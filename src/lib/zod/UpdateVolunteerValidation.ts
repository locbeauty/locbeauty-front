import { z } from "zod";

export const updateVolunteerSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").optional(),
  documentNumber: z.string().length(14, "CPF incompleto").optional(),
  cellphone: z.string().min(10, "Telefone inválido").optional(),
  filialId: z.string().cuid({ message: "Filial é obrigatória" }).optional(),
  isVisible: z.boolean().optional(),
});

export type UpdateVolunteerFormDataType = z.infer<typeof updateVolunteerSchema>;
