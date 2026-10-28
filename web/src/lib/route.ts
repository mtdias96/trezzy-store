import type { Route } from 'next';

// Caminho de uma página da loja que ainda não existe: o typedRoutes só aceita rota com page.tsx. Quando a página
// entrar, troque a chamada pelo literal, que passa a ser checado.
export function pendingRoute(path: `/${string}`): Route {
  return path as Route;
}
