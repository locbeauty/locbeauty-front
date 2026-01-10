import { apiRequest } from "@/lib/api";
import { CreateTrainingDataType } from "@/lib/zod/CreateTrainingValidation";
import { Gear } from "@/utils/@types/gears";
import { Training } from "@/utils/@types/training";

export async function GetAllGears({ filialId }: {filialId?: string | undefined}) {
    const response = await apiRequest<Gear[]>({ endpoint: "gears", queryParams: filialId ? { filialId } : {}  });
    console.log("response: ", response);
    return response;
}

// export async function CreateTraining(body: CreateTrainingDataType) {
// const parsedPrice = body.price.replace(/\D/g, "");
//
// const dataWithCents = {
// ...body,
// price: Number(parsedPrice),
// };
//
// console.log("body: ", body);
// console.log("parsed: ", Number(parsedPrice));
//
// const response = await apiRequest({ endpoint: "trainings/create", method: "POST", body: dataWithCents });
//
// return response;
// }

// export async function UpdateCustomer({ body, queryParams }: {body: UpdateCustomerFormSchemaType, queryParams?: Record<string, string>}) {
//     const response = await apiRequest<Customer[]>({ endpoint: "customers/update", method: "POST", body, queryParams });

//     return response;
// }

