'use client';

import { type ComponentProps, useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

import { Input } from '@/components/ui/input';

type PasswordInputProps = Omit<ComponentProps<typeof Input>, 'type'>;

export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input {...props} type={visible ? 'text' : 'password'} className="pr-12" />
      <button
        type="button"
        aria-label="Mostrar senha"
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-2xl text-muted-foreground transition-colors duration-base hover:text-ink"
      >
        {visible ? <EyeOffIcon aria-hidden className="size-5" /> : <EyeIcon aria-hidden className="size-5" />}
      </button>
    </div>
  );
}
