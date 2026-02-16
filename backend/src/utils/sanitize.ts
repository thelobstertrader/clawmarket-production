/**
 * Sanitize user input for use in PostgREST filter strings (.or() calls).
 * Strips characters that PostgREST uses as filter syntax delimiters
 * (commas, dots, parentheses) to prevent filter injection.
 * The stripped chars are not useful in search terms anyway.
 */
export function sanitizeForPostgREST(value: string): string {
  return value.replace(/[,.()\[\]]/g, ' ').replace(/\s+/g, ' ').trim();
}
