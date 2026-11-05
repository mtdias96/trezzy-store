// Retorno de toda Server Action (web/AGENTS.md, seção 4): erro de negócio volta como valor, nunca como throw.
export type ActionResult<T = void>
  = | { ok: true; data: T }
    | {
      ok: false;
      error: string;
      fieldErrors?: Partial<Record<string, string[]>>;
      // O React limpa o formulário depois da action: values devolve o que foi digitado (nunca a senha).
      values?: Record<string, string>;
    };

export type FormAction<T = void> = (state: ActionResult<T> | null, formData: FormData) => Promise<ActionResult<T>>;
