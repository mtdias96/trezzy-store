export const PERMISSIONS = ['dashboard:access', 'products:write', 'media:write'] as const;

export type Permission = (typeof PERMISSIONS)[number];
