import { z } from 'zod';

const SCHEMA_METADATA_KEY = 'custom:schema';

export function Schema(schema: z.ZodSchema): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(SCHEMA_METADATA_KEY, schema, target);
  };
}

export function getSchema(target: object): z.ZodSchema | undefined {
  return Reflect.getMetadata(SCHEMA_METADATA_KEY, target.constructor);
}
