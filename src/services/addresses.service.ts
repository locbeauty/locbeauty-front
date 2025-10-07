import { apiRequest } from "@/lib/api";
import { Address } from "@/utils/@types/address";

export async function GetAllCustomerAddresses({ customerId }: {customerId: string}) {
    const response = await apiRequest<Address[]>({ endpoint: "customer/addresses", queryParams: { customerId } });

    return response;
}

export async function GetAllStudentAddresses({ studentId }: {studentId: string}) {
    const response = await apiRequest<Address[]>({ endpoint: "student/addresses", queryParams: { studentId } });

    return response;
}

export async function CreateCustomerAddress({ customerId, body }: {customerId: string, body: unknown}) {
    const response = await apiRequest<Address[]>({ endpoint: "address/create", queryParams: { customerId }, body, method: "POST" });

    return response;
}

export async function DeactivateCustomerAddress({ addressId }: { addressId: string }) {
    const response = await apiRequest({
        endpoint: "address/deactivate",
        queryParams: { addressId },
    });

    return response;
}