import { describe, expect, it } from 'vitest';

import { colorwaySchema, productCreateSchema, productFormSchema, type ProductFormValues, toColorwayInput, toProductCreateInput } from './schema';

const values: ProductFormValues = {
  title: 'Camiseta Grizzly Bear Squad',
  description: '',
  active: true,
  brandId: '0d9c3c8e-2f1a-4b6e-9a7d-1c2b3a4d5e6f',
  categoryId: '7a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d',
  colorName: '',
  familyOf: '',
  basePriceInCents: 14990,
  variants: [
    { size: 'P', color: 'amarelo', sku: '', priceInCents: 14990, stock: 5, active: true },
    { size: 'M', color: 'amarelo', sku: 'GRZ-M-AMA', priceInCents: 14990, stock: 0, active: false },
  ],
};

const fieldsOf = (result: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } }) =>
  result.error?.issues.map(({ path }) => path.join('.')) ?? [];

describe('productFormSchema', () => {
  it('trims the title and normalizes the SKU', () => {
    const parsed = productFormSchema.parse({
      ...values,
      title: '  Camiseta  ',
      variants: [{ ...values.variants[0], sku: ' grz-p ' }],
    });

    expect(parsed.title).toBe('Camiseta');
    expect(parsed.variants[0]?.sku).toBe('GRZ-P');
  });

  it('points to each missing field and to the variant without a price', () => {
    const result = productFormSchema.safeParse({
      ...values,
      title: ' ',
      brandId: '',
      variants: [{ ...values.variants[0], priceInCents: 0, sku: 'GRZ--P' }],
    });

    expect(fieldsOf(result)).toEqual(['title', 'brandId', 'variants.0.sku', 'variants.0.priceInCents']);
  });

  it('requires at least one variant', () => {
    expect(fieldsOf(productFormSchema.safeParse({ ...values, variants: [] }))).toEqual(['variants']);
  });
});

describe('productFormSchema title', () => {
  it('refuses a title made only of symbols, as the API does', () => {
    expect(fieldsOf(productFormSchema.safeParse({ ...values, title: '!!!' }))).toEqual(['title']);
  });
});

describe('toProductCreateInput', () => {
  it('turns the switch into the status, leaves an empty SKU out and keeps the gallery order', () => {
    const input = toProductCreateInput(values, ['3f2b8c1d-4e5a-4b6c-9d7e-8f9a0b1c2d3e', '5c4d3e2f-1a0b-4c9d-8e7f-6a5b4c3d2e1f']);

    expect(input).toEqual({
      title: 'Camiseta Grizzly Bear Squad',
      description: '',
      status: 'active',
      brandId: '0d9c3c8e-2f1a-4b6e-9a7d-1c2b3a4d5e6f',
      categoryId: '7a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d',
      colorName: null,
      familyOf: null,
      variants: [
        { size: 'P', color: 'amarelo', sku: undefined, priceInCents: 14990, stock: 5, active: true },
        { size: 'M', color: 'amarelo', sku: 'GRZ-M-AMA', priceInCents: 14990, stock: 0, active: false },
      ],
      mediaIds: ['3f2b8c1d-4e5a-4b6c-9d7e-8f9a0b1c2d3e', '5c4d3e2f-1a0b-4c9d-8e7f-6a5b4c3d2e1f'],
    });
    expect(toProductCreateInput({ ...values, active: false }, []).status).toBe('draft');
  });
});

const MODEL_ID = '9b8a7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d';

describe('the color of a model', () => {
  it('requires the color name only when another product is chosen as the same model', () => {
    expect(productFormSchema.safeParse(values).success).toBe(true);
    expect(fieldsOf(productFormSchema.safeParse({ ...values, familyOf: MODEL_ID }))).toEqual(['colorName']);
    expect(fieldsOf(productFormSchema.safeParse({ ...values, familyOf: MODEL_ID, colorName: '  ' }))).toEqual(['colorName']);
    expect(productFormSchema.safeParse({ ...values, familyOf: MODEL_ID, colorName: 'Reflective Black' }).success).toBe(true);
  });

  it('sends empty fields as null, to create and to save the link', () => {
    const linked = { ...values, colorName: 'Reflective Black', familyOf: MODEL_ID };

    expect(toProductCreateInput(linked, [])).toMatchObject({ colorName: 'Reflective Black', familyOf: MODEL_ID });
    expect(toColorwayInput(values)).toEqual({ colorName: null, familyOf: null });
    expect(colorwaySchema.safeParse({ colorName: null, familyOf: MODEL_ID }).success).toBe(false);
  });
});

describe('productCreateSchema', () => {
  it('requires a photo to publish, but not for a draft', () => {
    expect(fieldsOf(productCreateSchema.safeParse(toProductCreateInput(values, [])))).toEqual(['mediaIds']);
    expect(productCreateSchema.safeParse(toProductCreateInput({ ...values, active: false }, [])).success).toBe(true);
  });

  it('accepts at most 10 photos', () => {
    const eleven = Array.from({ length: 11 }, (_, index) => `3f2b8c1d-4e5a-4b6c-9d7e-8f9a0b1c2d${String(index).padStart(2, '0')}`);

    expect(fieldsOf(productCreateSchema.safeParse(toProductCreateInput(values, eleven)))).toEqual(['mediaIds']);
  });
});
