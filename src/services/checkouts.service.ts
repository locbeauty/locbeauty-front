import { GetDayCheckoutsResponse } from "@/components/pages/bookings/create/CreateBookingForm";
import { apiRequest, ApiResponse } from "@/lib/api";
import { CreateCheckoutFormSchemaType, CreateCheckoutValidationWithMoneyInCents } from "@/lib/zod/CreateBookingValidation";
import { CreateCustomerFormSchemaType } from "@/lib/zod/CreateCustomerValidation";
import { UpdateCustomerFormSchemaType } from "@/lib/zod/UpdateCustomerValidation";
import { Checkout } from "@/utils/@types/checkouts";
import { Customer } from "@/utils/@types/customer";
import { Employee } from "@/utils/@types/employee";
import { ROLES } from "@/utils/@types/roles";

export async function CreateCheckout(body: CreateCheckoutValidationWithMoneyInCents) {
    const response = await apiRequest({ endpoint: "bookings/create", method: "POST", body });

    return response;
}

// export async function GetAllCheckouts({ queryParams }: {queryParams?: Record<string, unknown>}) {
//     const response = await apiRequest<Checkout[]>({ endpoint: "checkouts", queryParams });

//     return response;
// }

export async function GetAllCheckouts({ queryParams }: { queryParams?: Record<string, unknown> }) {
    const response = await apiRequest<Checkout[]>({ endpoint: "checkouts", queryParams });
    return response;
}

export async function getDayCheckouts(
    { body }: { body: Record<string, unknown> }
) {
    const response = await apiRequest<GetDayCheckoutsResponse[]>({ endpoint: "bookings/available", body, method: "POST" });
    return response;
}
