import { useEffect } from 'react';
import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Input } from '@/components/ui/input';
import { Form, useForm, type UseFormReturn } from '@/lib/form';

import { FormField, FormMessage } from './form-field';

type Values = { title: string; variants: { sku: string }[] };

// O texto que o leitor de tela lê como descrição: os elementos apontados pelo aria-describedby, na ordem.
function descriptionOf(element: HTMLElement): string {
  return (element.getAttribute('aria-describedby') ?? '')
    .split(' ')
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent ?? '')
    .join(' ');
}

function TestForm({ onReady }: { onReady: (form: UseFormReturn<Values>) => void }) {
  const form = useForm<Values>({ defaultValues: { title: '', variants: [] } });

  useEffect(() => onReady(form), [form, onReady]);

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="title"
        label="Título"
        description="Aparece no card da loja."
        render={({ field, controlProps }) => <Input {...field} {...controlProps} />}
      />
      <FormMessage control={form.control} name="variants" />
    </Form>
  );
}

function renderForm(): UseFormReturn<Values> {
  let form: UseFormReturn<Values> | undefined;

  render(
    <TestForm
      onReady={(ready) => {
        form = ready;
      }}
    />,
  );

  if (!form) {
    throw new Error('The form did not mount.');
  }

  return form;
}

describe('FormField', () => {
  it('links the label and the description to the control', () => {
    renderForm();

    const input = screen.getByLabelText('Título');

    expect(descriptionOf(input)).toBe('Aparece no card da loja.');
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });

  it('marks the control invalid and describes it with the error once there is one', () => {
    const form = renderForm();

    act(() => form.setError('title', { type: 'server', message: 'Informe o título.' }));

    const input = screen.getByLabelText('Título');

    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(descriptionOf(input)).toBe('Aparece no card da loja. Informe o título.');
  });
});

describe('FormMessage', () => {
  it('shows the list error kept in root by the field array', () => {
    const form = renderForm();

    // É onde o useFieldArray grava o erro da lista; o tipo do setError não lista esse caminho.
    act(() => form.setError('variants.root' as 'variants', { type: 'min', message: 'Gere pelo menos uma variante.' }));

    expect(screen.getByRole('alert').textContent).toBe('Gere pelo menos uma variante.');
  });
});
