import { UserMenu } from '@/features/admin/account/components/user-menu';
import { getPanelAccount } from '@/features/admin/account/data/queries';

type UserMenuContainerProps = {
  // Vem do layout: a action é da feature shared/auth, que esta feature não pode importar.
  signOutAction: () => Promise<void>;
};

export async function UserMenuContainer({ signOutAction }: UserMenuContainerProps) {
  const { email, initials } = await getPanelAccount();

  return <UserMenu email={email} initials={initials} signOutAction={signOutAction} />;
}
