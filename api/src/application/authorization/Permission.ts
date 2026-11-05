export const PERMISSIONS = ['dashboard:access', 'products:write'] as const;

export type Permission = (typeof PERMISSIONS)[number];
