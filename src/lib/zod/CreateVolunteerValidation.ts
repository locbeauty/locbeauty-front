import { z } from "zod";

export const CreateVolunteerSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  documentNumber: z.string().length(14, "CPF incompleto"),
  cellphone: z.string().min(10, "Telefone inválido"),
  filialId: z.string().cuid({ message: "Filial é obrigatória" }),
});

export type CreateVolunteerFormDataType = z.infer<typeof CreateVolunteerSchema>;
