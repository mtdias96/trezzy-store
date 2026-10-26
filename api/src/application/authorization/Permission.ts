export const PERMISSIONS = ['dashboard:access'] as const;

export type Permission = (typeof PERMISSIONS)[number];
