import { z, ZodError, ZodTypeDef } from 'zod'

type ValidateSchemaResponse<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: z.ZodError }

export const validateSchema = <
  Schema,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Schema,
>(
  schema: z.ZodType<Schema, Def, Input>,
  body: unknown,
): ValidateSchemaResponse<Schema> => {
  const result = schema.safeParse(body)

  if (result.success) return { success: true, data: result.data, error: null }

  return { success: false, data: null, error: result.error }
}

export const handleSchemaError = (error: unknown) => {
  const message =
    error instanceof ZodError
      ? error.issues.map(issue => JSON.stringify(issue)).join(',')
      : 'unknown error'

  return {
    headers: { 'Content-Type': 'application/json' },

    status: 422,
    body: { error: message },
  }
}
