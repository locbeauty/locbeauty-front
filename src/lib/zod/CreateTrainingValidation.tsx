import { z } from "zod";

export const CreateTrainingSchema = z.object({
    hour: z.number({ message: "Campo obrigatório" }).int().min(0).max(23),
    minute: z.number({ message: "Campo obrigatório" }).int().min(0).max(59),
    gearId: z.string({ message: "Campo obrigatório" }).cuid(),
    professorId: z.string({ message: "Campo obrigatório" }).cuid(),
    studentId: z.string({ message: "Campo obrigatório" }).cuid(),
    dueDate: z.date({ message: "Campo obrigatório" }),
    addressId: z.string({ message: "Campo obrigatório" }).cuid(),
    price: z.string()
});

export type CreateTrainingDataType = z.infer<typeof CreateTrainingSchema>;