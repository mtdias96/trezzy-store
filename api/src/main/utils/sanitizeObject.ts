export function sanitizeObject<T extends Record<string, unknown>>(
  obj?: T | null,
): Record<string, string> {
  if (!obj) {
    return {};
  }

  const sanitized: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      sanitized[key] = String(value);
    }
  }

  return sanitized;
}
