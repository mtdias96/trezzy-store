export const PANEL_HOME = '/admin';
export const PANEL_SIGN_IN = '/admin/entrar';

// Para onde voltar depois do login. Só caminhos do painel: sem isso, o ?next= viraria um redirecionamento
// para fora do site (open redirect), e o próprio login entraria em loop.
export function toPanelPath(path: string | undefined): string {
  const isPanelPath = path !== undefined
    && /^\/admin(?:[/?#]|$)/.test(path)
    && !path.includes('//')
    && !path.includes('\\');

  return isPanelPath && !path.startsWith(PANEL_SIGN_IN) ? path : PANEL_HOME;
}
