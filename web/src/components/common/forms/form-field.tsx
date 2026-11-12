'use client';

import { type ReactNode, useId } from 'react';

import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import {
  type Control,
  Controller,
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
  get,
  useFormState,
} from '@/lib/form';

// O que todo controle de formulário recebe: o id que o label usa e os aria que ligam o erro e a descrição.
export type FormControlProps = {
  id: string;
  'aria-invalid': true | undefined;
  'aria-describedby': string | undefined;
};

type FormFieldProps<TValues extends FieldValues, TName extends FieldPath<TValues>> = {
  control: Control<TValues>;
  name: TName;
  // Sem label, o controle se nomeia sozinho (aria-label numa célula de tabela, ou um <label> em volta dele).
  label?: string;
  hideLabel?: boolean;
  description?: ReactNode;
  className?: string;
  render: (props: {
    field: ControllerRenderProps<TValues, TName>;
    fieldState: ControllerFieldState;
    controlProps: FormControlProps;
  }) => ReactNode;
};

// Todo campo passa por aqui: label, descrição e erro do Field do shadcn, ligados ao controle pelo id e pelos aria.
export function FormField<TValues extends FieldValues, TName extends FieldPath<TValues>>({
  control,
  name,
  label,
  hideLabel = false,
  description,
  className,
  render,
}: FormFieldProps<TValues, TName>) {
  const id = useId();
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const describedBy = [description ? descriptionId : null, fieldState.error ? errorId : null].filter(Boolean).join(' ');

        return (
          <Field data-invalid={fieldState.invalid || undefined} className={className}>
            {label ? <FieldLabel htmlFor={id} className={hideLabel ? 'sr-only' : undefined}>{label}</FieldLabel> : null}
            {render({
              field,
              fieldState,
              controlProps: {
                id,
                'aria-invalid': fieldState.invalid || undefined,
                'aria-describedby': describedBy === '' ? undefined : describedBy,
              },
            })}
            {description ? <FieldDescription id={descriptionId}>{description}</FieldDescription> : null}
            <FieldError id={errorId} errors={[fieldState.error]} />
          </Field>
        );
      }}
    />
  );
}

type FormMessageProps<TValues extends FieldValues> = {
  control: Control<TValues>;
  name: FieldPath<TValues>;
};

// Erro de um caminho que não é um controle, como a lista `variants` (menos de 1): o useFieldArray guarda esse erro em
// `root` depois de adicionar ou remover uma linha, e o resolver em `message` no envio.
export function FormMessage<TValues extends FieldValues>({ control, name }: FormMessageProps<TValues>) {
  const { errors } = useFormState({ control, name });
  const error: unknown = get(errors, name);
  const message = messageOf(error) ?? messageOf(typeof error === 'object' && error !== null && 'root' in error ? error.root : undefined);

  return <FieldError errors={message === undefined ? [] : [{ message }]} />;
}

function messageOf(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
    ? error.message
    : undefined;
}
