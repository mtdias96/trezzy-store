'use client';

import { startTransition, useActionState, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { ProductColorwayFields } from '@/features/admin/products/components/colorway/product-colorway-fields';
import { ProductEditor } from '@/features/admin/products/components/editor/product-editor';
import { ProductMedia } from '@/features/admin/products/components/media/product-media';
import { ProductVariantsFields } from '@/features/admin/products/components/variants/product-variants-fields';
import { createProduct, setColorway } from '@/features/admin/products/data/actions';
import { uploadProductImage } from '@/features/admin/products/data/upload';
import { useMediaUploads } from '@/features/admin/products/hooks/use-media-uploads';
import { colorCopyDefaults } from '@/features/admin/products/model/colorway';
import type { MediaItem } from '@/features/admin/products/model/media';
import {
  type ProductCreateInput,
  type ProductFormInput,
  productFormSchema,
  type ProductFormValues,
  toColorwayInput,
  toProductCreateInput,
} from '@/features/admin/products/model/schema';
import type {
  CategoryOption,
  ColorwayCandidate,
  ProductDetail,
  ProductMediaFile,
  SelectOption,
} from '@/features/admin/products/model/types';
import { SIZES_BY_GRID, summarizeVariants, variantsOutsideGrid } from '@/features/admin/products/model/variants';
import type { ActionResult } from '@/lib/action-result';
import { applyFieldErrors, Form, useForm, useWatch, zodResolver } from '@/lib/form';

type ProductFormContainerProps = {
  product?: ProductDetail;
  // "Cadastrar outra cor": o cadastro novo abre preenchido com o produto de origem e já ligado a ele.
  modelOf?: ProductDetail;
  brands: readonly SelectOption[];
  categories: readonly CategoryOption[];
  colorwayCandidates: readonly ColorwayCandidate[];
};

function toMediaItem({ id, url }: ProductMediaFile): MediaItem {
  return { id, mediaId: id, name: url.split('/').at(-1) ?? id, previewUrl: url, status: 'done', progress: 100 };
}

function toFormDefaults(product?: ProductDetail): ProductFormInput {
  const prices = product?.variants.map(({ priceInCents }) => priceInCents) ?? [];

  return {
    title: product?.title ?? '',
    description: product?.description ?? '',
    active: product ? product.status === 'active' : true,
    brandId: product?.brandId ?? '',
    categoryId: product?.categoryId ?? '',
    colorName: product?.colorName ?? '',
    // Qualquer cor da família serve: ligar a ela mantém o produto onde está.
    familyOf: product?.colorways[0]?.id ?? '',
    basePriceInCents: prices.length > 0 ? Math.min(...prices) : 0,
    variants: product?.variants.map(({ size, color, sku, priceInCents, stock, active }) => ({
      size,
      color,
      sku,
      priceInCents,
      stock,
      active,
    })) ?? [],
  };
}

// `mediaIds.<i>` é a posição na lista enviada, que pula as fotos com erro: a mensagem usa a posição na tela.
function mediaErrors(
  fieldErrors: Partial<Record<string, string[]>>,
  sentMediaIds: readonly string[],
  items: readonly MediaItem[],
): string[] {
  return Object.entries(fieldErrors).flatMap(([field, messages = []]) => {
    const match = /^mediaIds(?:\.(\d+))?$/.exec(field);

    if (!match) {
      return [];
    }

    if (match[1] === undefined) {
      return messages;
    }

    const position = items.findIndex(({ mediaId }) => mediaId === sentMediaIds[Number(match[1])]) + 1;

    // A foto do erro já saiu da galeria: a mensagem não vale mais.
    return position > 0 ? messages.map((message) => `Foto ${position}: ${message}`) : [];
  });
}

export function ProductFormContainer({ product, modelOf, brands, categories, colorwayCandidates }: ProductFormContainerProps) {
  const form = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: !product && modelOf ? colorCopyDefaults(modelOf) : toFormDefaults(product),
  });
  const [colorwayResult, setColorwayResult] = useState<ActionResult | null>(null);
  const [isSavingColorway, startColorwaySave] = useTransition();
  const { items, rejections, addFiles, remove, reorder, clear } = useMediaUploads(
    uploadProductImage,
    (product?.media ?? []).map(toMediaItem),
  );
  const router = useRouter();
  const [sentMediaIds, setSentMediaIds] = useState<readonly string[]>([]);
  const variants = useWatch({ control: form.control, name: 'variants' });

  // Sem redirect na action: o redirect de Server Action renderiza a lista dentro da resposta, e ela ficava presa no
  // skeleton. A limpeza vem antes da navegação porque o Next guarda a página escondida (<Activity>) e ela voltaria
  // preenchida com o produto salvo.
  const [state, submit, isSaving] = useActionState(
    async (previous: ActionResult | null, input: ProductCreateInput) => {
      const result = await createProduct(previous, input);

      if (result.ok) {
        form.reset(toFormDefaults());
        clear();
        setSentMediaIds([]);
        router.push('/admin/produtos');

        return result;
      }

      // Os erros das fotos aparecem no card de mídia, pela posição na tela.
      applyFieldErrors(form.setError, result.fieldErrors ?? {}, (field) => !field.startsWith('mediaIds'));

      return result;
    },
    null,
  );

  const formRef = useRef<HTMLFormElement>(null);
  const [clientError, setClientError] = useState<string>();
  let saveBlockedReason: string | undefined;

  if (product) {
    saveBlockedReason = 'A edição ainda não salva.';
  } else if (items.some(({ status }) => status === 'uploading')) {
    saveBlockedReason = 'Aguarde o envio das fotos.';
  } else if (items.some(({ status }) => status === 'error')) {
    saveBlockedReason = 'Remova as fotos com falha ou envie de novo.';
  }

  function showClientError() {
    setClientError('Revise os campos destacados.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const onSubmit = form.handleSubmit((values) => {
    const grid = categories.find(({ value }) => value === values.categoryId)?.grid;
    const outside = grid ? variantsOutsideGrid(values.variants, grid) : [];

    // A API recusa tamanho fora da grade da categoria: aponta a linha antes de ir até ela.
    if (grid && outside.length > 0) {
      for (const index of outside) {
        form.setError(`variants.${index}.size`, {
          type: 'grid',
          message: `Fora da grade da categoria (${SIZES_BY_GRID[grid].join(', ')}).`,
        });
      }

      showClientError();

      return;
    }

    const mediaIds = items.flatMap(({ status, mediaId }) => (status === 'done' && mediaId ? [mediaId] : []));

    setClientError(undefined);
    setSentMediaIds(mediaIds);
    startTransition(() => submit(toProductCreateInput(values, mediaIds)));
  }, showClientError);

  const isSaveBlocked = saveBlockedReason !== undefined || isSaving;

  function saveColorway(productId: string) {
    startColorwaySave(async () => {
      if (!(await form.trigger(['colorName', 'familyOf']))) {
        return;
      }

      const values = form.getValues();
      const result = await setColorway(productId, toColorwayInput(values));

      setColorwayResult(result);

      if (result.ok) {
        form.resetField('colorName', { defaultValue: values.colorName });
        form.resetField('familyOf', { defaultValue: values.familyOf });
        router.refresh();

        return;
      }

      applyFieldErrors(form.setError, result.fieldErrors ?? {});
    });
  }

  // O botão anuncia ⌘S: o atalho salva com os mesmos bloqueios do botão, e não abre o "Salvar página" do navegador.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();

        if (!isSaveBlocked) {
          formRef.current?.requestSubmit();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSaveBlocked]);

  const failure = state && !state.ok && !isSaving ? state : null;

  return (
    <Form {...form}>
      <form ref={formRef} noValidate onSubmit={(event) => void onSubmit(event)} className="flex flex-1 flex-col">
        <ProductEditor
          product={product}
          brands={brands}
          categories={categories}
          media={(
            <ProductMedia
              items={items}
              rejections={rejections}
              onFiles={addFiles}
              onRemove={remove}
              onReorder={reorder}
              errors={failure ? mediaErrors(failure.fieldErrors ?? {}, sentMediaIds, items) : []}
            />
          )}
          variants={<ProductVariantsFields categories={categories} defaultSizeGrid={product?.sizeGrid ?? modelOf?.sizeGrid ?? 'one'} />}
          colorway={(
            <ProductColorwayFields
              candidates={colorwayCandidates}
              editing={product
                ? {
                    productId: product.id,
                    colorways: product.colorways,
                    isSaving: isSavingColorway,
                    error: colorwayResult && !colorwayResult.ok ? colorwayResult.error : undefined,
                    onSave: () => saveColorway(product.id),
                  }
                : undefined}
            />
          )}
          summary={summarizeVariants(variants)}
          imageCount={items.filter(({ status }) => status === 'done').length}
          hasUnsavedChanges={form.formState.isDirty}
          isSaving={isSaving}
          saveBlockedReason={saveBlockedReason}
          formError={isSaving ? undefined : (clientError ?? failure?.error)}
        />
      </form>
    </Form>
  );
}
