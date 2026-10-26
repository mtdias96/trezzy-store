import { PasswordInput } from '@/components/common/password-input';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SUPPORT_EMAIL = 'suporte@trezzy.com.br';

// A API ainda não tem recuperação de senha: até ela entrar, o link abre um e-mail para o suporte.
const FORGOT_PASSWORD_HREF = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Esqueci a senha do painel')}`;

export function SignInForm() {
  return (
    <div className="w-full max-w-110">
      <h1 className="type-display text-display-md text-ink sm:text-display-lg">Entrar no painel</h1>
      <p className="mt-2 w-fit -rotate-3 font-hand text-body-lg tracking-wider text-brand">Bem-vindo de volta</p>
      <p className="mt-2 text-body text-muted-foreground">Use o e-mail da sua conta Trezzy com perfil ADMIN.</p>

      {/* Sem a action, o POST evita que a senha vá para a URL num envio por GET. */}
      <form method="post" className="mt-6 flex flex-col">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="voce@trezzy.com.br"
            required
          />
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <a href={FORGOT_PASSWORD_HREF} className="text-body-sm leading-none font-semibold text-brand-700 hover:underline">
              Esqueci a senha
            </a>
          </div>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />
        </div>

        <Label className="mt-4 gap-2.5 text-body font-normal text-pretty">
          <Checkbox name="remember" defaultChecked />
          Manter conectado neste dispositivo por 30 dias
        </Label>

        <button
          type="submit"
          className="mt-5 flex h-cta items-center justify-center rounded-pill bg-primary text-body-lg font-bold text-primary-foreground transition-colors duration-base hover:bg-brand-600"
        >
          Entrar
        </button>
      </form>

      <hr className="mt-6 border-gray-150" />

      <p className="mt-5 text-body-sm text-muted-foreground">
        Problemas para entrar? Fale com
        {' '}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-brand-700 hover:underline">
          {SUPPORT_EMAIL}
        </a>
      </p>
    </div>
  );
}
