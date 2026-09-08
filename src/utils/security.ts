/**
 * Comprehensive Application Security & Sanitization Engine
 * 
 * Features:
 * - Anti-XSS and tag-stripping with attribute and entity filtering
 * - Dangerous pseudo-protocol blocking (javascript:, data:, vbscript:)
 * - Client-side rate limiting and spam flood protection
 * - LocalStorage safe JSON parsing with prototype pollution defense
 * - Anti-bot honeypot verification
 * - Max payload size guard to prevent storage quota denial-of-service
 */

// Strip HTML tags, malicious attributes, entities, dangerous schemes, and control characters
export function sanitizeInput(raw: string, maxLength: number = 250): string {
  if (!raw || typeof raw !== 'string') return '';

  let cleaned = raw
    // Decode common obfuscation entities that try to hide <script>
    .replace(/&#x[0-9a-f]+;?/gi, '')
    .replace(/&#[0-9]+;?/gi, '')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    // Strip HTML tags and closing tags
    .replace(/<[^>]*>/g, '')
    // Strip potential inline event handlers (onerror=, onload=, onclick=, etc.)
    .replace(/\bon\w+\s*=/gi, '')
    // Strip dangerous pseudo-protocols
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:/gi, '')
    .replace(/vbscript\s*:/gi, '')
    // Strip null bytes and non-printable control characters (keep standard \n and \r)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Prevent common template literal injection strings
    .replace(/\${[^}]*}/g, '')
    // Trim extraneous whitespace
    .trim();

  // Enforce strict upper bound
  return cleaned.slice(0, maxLength);
}

// Clean object keys to prevent __proto__, constructor, or prototype pollution
export function safeSanitizeObject<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => {
      if (typeof item === 'string') return sanitizeInput(item, 5000);
      if (typeof item === 'object' && item !== null) return safeSanitizeObject(item);
      return item;
    }) as unknown as T;
  }

  const clean: Record<string, any> = {};
  const dangerousKeys = new Set(['__proto__', 'constructor', 'prototype']);

  for (const key of Object.keys(obj)) {
    if (dangerousKeys.has(key)) {
      continue;
    }
    const val = (obj as any)[key];
    if (typeof val === 'string') {
      clean[key] = sanitizeInput(val, 5000);
    } else if (typeof val === 'object' && val !== null) {
      clean[key] = safeSanitizeObject(val);
    } else {
      clean[key] = val;
    }
  }
  return clean as T;
}

/**
 * Safe JSON parser with fallback and prototype pollution neutralization
 */
export function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw || typeof raw !== 'string') return fallback;

  try {
    // Basic fast validation before parsing
    const trimmed = raw.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      return fallback;
    }

    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null) {
      return safeSanitizeObject(parsed) as T;
    }
    return parsed;
  } catch (err) {
    console.warn("Secure JSON parse failed, returning fallback state", err);
    return fallback;
  }
}

/**
 * In-memory client-side rate limiter to prevent automated flood attacks
 * on burial creation and tribute posting.
 */
interface RateLimitBucket {
  timestamps: number[];
}

const rateLimitBuckets = new Map<string, RateLimitBucket>();

export function checkRateLimit(
  actionKey: string, 
  maxCount: number = 6, 
  windowMs: number = 30000
): { allowed: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();
  let bucket = rateLimitBuckets.get(actionKey);

  if (!bucket) {
    bucket = { timestamps: [] };
    rateLimitBuckets.set(actionKey, bucket);
  }

  // Prune timestamps older than window
  bucket.timestamps = bucket.timestamps.filter(ts => now - ts < windowMs);

  if (bucket.timestamps.length >= maxCount) {
    const oldestInWindow = bucket.timestamps[0];
    const retryAfterSec = Math.ceil((windowMs - (now - oldestInWindow)) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: Math.max(1, retryAfterSec),
    };
  }

  bucket.timestamps.push(now);
  return {
    allowed: true,
    remaining: maxCount - bucket.timestamps.length,
    retryAfterSec: 0,
  };
}

/**
 * Honeypot bot detection: bots automatically fill hidden input fields.
 */
export function validateHoneypot(trapValue: string): boolean {
  return trapValue.trim().length === 0;
}

/**
 * Storage quota safety: ensures we do not exceed safe storage margins
 */
export function isStoragePayloadSafe(data: unknown, maxBytes: number = 2000000): boolean {
  try {
    const str = JSON.stringify(data);
    return str.length * 2 <= maxBytes; // UTF-16 approx 2 bytes
  } catch {
    return false;
  }
}

