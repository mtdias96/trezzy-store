// A sessão que o app enxerga. Não leva os tokens, para nunca chegarem ao browser por props.
export type Session = {
  accountId: string;
  isAdmin: boolean;
  expiresAt: number;
};
