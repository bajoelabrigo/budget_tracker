import { z } from "zod";

export const CreateTransactionSchema = z.object({
  // ✅ Convierte cualquier string/number a number, valida >0 y que tenga máximo 2 decimales
  amount: z.coerce.number().positive().multipleOf(0.01),

  // ✅ Campo opcional
  description: z.string().optional(),

  // ✅ Convierte string (del input date) a Date
  date: z.coerce.date(),

  // ✅ Cadena obligatoria (puedes añadir .min(1) si no quieres vacío)
  category: z.string(),

  // ✅ Enum entre "income" y "expense"
  type: z.union([z.literal("income"), z.literal("expense")]),
});

export type CreateTransactionSchemaType = z.infer<
  typeof CreateTransactionSchema
>;
