// Enquanto a conta não tem nome: marina.costa → MC, marina → MA.
export function initialsFromEmail(email: string): string {
  const [localPart = ''] = email.split('@');
  const [first = '', second] = localPart.split(/[._+-]+/).filter(Boolean);
  const initials = second === undefined ? first.slice(0, 2) : `${first.charAt(0)}${second.charAt(0)}`;

  return initials.toUpperCase();
}
