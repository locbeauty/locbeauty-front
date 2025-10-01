import { apiRequest } from "@/lib/api";
import { CreateStudentFormDataType } from "@/lib/zod/CreateStudentValidation";
import { Student } from "@/utils/@types/student";

export async function GetAllStudents() {
    const response = await apiRequest<Student[]>({ endpoint: "students" });
    return response;
}
export async function CreateStudent(body: CreateStudentFormDataType) {
    const response = await apiRequest({ endpoint: "students/create", method: "POST", body });

    return response;
}

// export async function UpdateCustomer({ body, queryParams }: {body: UpdateCustomerFormSchemaType, queryParams?: Record<string, string>}) {
//     const response = await apiRequest<Customer[]>({ endpoint: "customers/update", method: "POST", body, queryParams });

//     return response;
// }

