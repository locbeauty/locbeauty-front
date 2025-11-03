import { GetDayCheckoutsResponse } from "@/components/pages/bookings/create/CreateBookingForm";
import { apiRequest, ApiResponse } from "@/lib/api";
import { CreateCheckoutFormSchemaType, CreateCheckoutValidationWithMoneyInCents } from "@/lib/zod/CreateBookingValidation";
import { CreateCustomerFormSchemaType } from "@/lib/zod/CreateCustomerValidation";
import { UpdateCustomerFormSchemaType } from "@/lib/zod/UpdateCustomerValidation";
import { Booking } from "@/utils/@types/bookings";
import { Checkout } from "@/utils/@types/checkouts";
import { Customer } from "@/utils/@types/customer";
import { Employee } from "@/utils/@types/employee";
import { ROLES } from "@/utils/@types/roles";

export async function UpdateBooking({ body, bookingId }: {body: { individualPrice: number, extraMachineCosts: number, extraMachineCostsDescription: string }, bookingId: string}) {
    const response = await apiRequest({ endpoint: "booking/update", method: "POST", body,  queryParams: { bookingId } });

    return response;
}

export async function GetBookingById({ bookingId }: {bookingId: string}): Promise<Booking | undefined>{
    const response = await apiRequest<Booking | undefined>({ endpoint: `booking/${bookingId}` });

    return response.data;
}
