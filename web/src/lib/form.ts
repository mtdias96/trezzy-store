import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form';

// Única porta do react-hook-form e do resolver (web/AGENTS.md, seção 7): feature e componente importam daqui.
export { zodResolver } from '@hookform/resolvers/zod';
export type { Control, ControllerFieldState, ControllerRenderProps, FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';
export {
  Controller,
  FormProvider as Form,
  get,
  useFieldArray,
  useForm,
  useFormContext,
  useFormState,
  useWatch,
} from 'react-hook-form';

export type FieldErrors = Partial<Record<string, string[]>>;

// Os `fieldErrors` da Server Action usam o mesmo caminho do formulário (`variants.1.sku`): cada campo recebe a primeira
// mensagem. `accepts` deixa de fora o que a tela mostra em outro lugar.
export function applyFieldErrors<TValues extends FieldValues>(
  setError: UseFormSetError<TValues>,
  fieldErrors: FieldErrors,
  accepts: (field: string) => boolean = () => true,
): void {
  for (const [field, messages] of Object.entries(fieldErrors)) {
    const message = messages?.[0];

    if (message !== undefined && accepts(field)) {
      setError(field as FieldPath<TValues>, { type: 'server', message });
    }
  }
}
