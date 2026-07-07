import { z } from "zod";

const digits = (v: string) => (v ?? "").replace(/\D/g, "");

export const nameSchema = z
  .string()
  .trim()
  .min(3, "Informe nome completo (mín. 3 letras)")
  .max(120, "Nome muito longo");

export const emailSchema = z
  .string()
  .trim()
  .email("E-mail inválido")
  .max(160, "E-mail muito longo");

export const phoneSchema = z
  .string()
  .refine((v) => digits(v).length >= 10 && digits(v).length <= 13, {
    message: "WhatsApp inválido (use DDD + número)",
  });

export const cpfSchema = z
  .string()
  .refine((v) => digits(v).length === 11, { message: "CPF deve ter 11 dígitos" });

export const cnpjSchema = z
  .string()
  .refine((v) => digits(v).length === 14, { message: "CNPJ deve ter 14 dígitos" });

export const docSchema = (type: "pf" | "pj") =>
  type === "pj" ? cnpjSchema : cpfSchema;

export const ufSchema = z
  .string()
  .length(2, "UF inválida")
  .regex(/^[A-Z]{2}$/, "UF deve ter 2 letras");

export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
});

export type ContactInput = z.infer<typeof contactSchema>;

export function firstError(err: z.ZodError): string {
  return err.issues[0]?.message ?? "Dados inválidos";
}
