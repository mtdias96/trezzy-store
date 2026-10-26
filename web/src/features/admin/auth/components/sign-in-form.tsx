import { Suspense } from 'react';

import { PasswordInput } from '@/components/common/password-input';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ActionResult } from '@/lib/action-result';

import { RedirectField } from './redirect-field';

const SUPPORT_EMAIL = 'suporte@trezzy.com.br';

// A API ainda não tem recuperação de senha: até ela entrar, o link abre um e-mail para o suporte.
const FORGOT_PASSWORD_HREF = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Esqueci a senha do painel')}`;

type SignInFormProps = {
  action: (formData: FormData) => void;
  pending: boolean;
  result: ActionResult | null;
};

export function SignInForm({ action, pending, result }: SignInFormProps) {
  const failure = result?.ok === false ? result : undefined;
  const emailError = failure?.fieldErrors?.email?.[0];
  const passwordError = failure?.fieldErrors?.password?.[0];

  return (
    <div className="w-full max-w-110">
      <h1 className="type-display text-display-md text-ink sm:text-display-lg">Entrar no painel</h1>
      <p className="mt-2 w-fit -rotate-3 font-hand text-body-lg tracking-wider text-brand">Bem-vindo de volta</p>
      <p className="mt-2 text-body text-muted-foreground">Use o e-mail da sua conta Trezzy com perfil ADMIN.</p>

      <form action={action} className="mt-6 flex flex-col">
        {failure && (
          <p role="alert" className="mb-5 rounded-xl bg-danger-50 px-4 py-3 text-body-sm font-medium text-danger-700">
            {failure.error}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="voce@trezzy.com.br"
            required
            defaultValue={failure?.values?.email}
            aria-invalid={emailError ? true : undefined}
            aria-describedby={emailError ? 'email-error' : undefined}
          />
          {emailError && <p id="email-error" className="text-caption text-danger-600">{emailError}</p>}
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
            aria-invalid={passwordError ? true : undefined}
            aria-describedby={passwordError ? 'password-error' : undefined}
          />
          {passwordError && <p id="password-error" className="text-caption text-danger-600">{passwordError}</p>}
        </div>

        <Label className="mt-4 gap-2.5 text-body font-normal text-pretty">
          <Checkbox name="remember" defaultChecked />
          Manter conectado neste dispositivo por 30 dias
        </Label>

        <Suspense>
          <RedirectField />
        </Suspense>

        <button
          type="submit"
          disabled={pending}
          className="mt-5 flex h-cta items-center justify-center rounded-pill bg-primary text-body-lg font-bold text-primary-foreground transition-colors duration-base hover:bg-brand-600 disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? 'Entrando…' : 'Entrar'}
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
