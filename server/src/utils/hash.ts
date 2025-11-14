import crypto from 'crypto';

/**
 * Compute SHA-256 hash of normalized case content for deduplication
 */
export function computeCaseHash(title?: string, description?: string, context?: string): string {
  const normalize = (s?: string) => (s || '').trim().toLowerCase();
  const payload = `${normalize(title)}||${normalize(description)}||${normalize(context)}`;
  return crypto.createHash('sha256').update(payload, 'utf8').digest('hex');
}
