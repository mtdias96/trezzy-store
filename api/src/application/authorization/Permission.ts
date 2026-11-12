export const PERMISSIONS = ['dashboard:access', 'products:read', 'products:write', 'media:write'] as const;

export type Permission = (typeof PERMISSIONS)[number];
