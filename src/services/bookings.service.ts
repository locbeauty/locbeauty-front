import { apiRequest } from "@/lib/api";
import { Booking } from "@/utils/@types/bookings";

export async function UpdateBooking({ body, bookingId }: {body: { individualPrice: number, extraMachineCosts: number, extraMachineCostsDescription: string }, bookingId: string}) {
    const response = await apiRequest({ endpoint: "booking/update", method: "POST", body,  queryParams: { bookingId } });

    return response;
}

export async function GetBookingById({ bookingId }: {bookingId: string}): Promise<Booking | undefined>{
    const response = await apiRequest<Booking | undefined>({ endpoint: `booking/${bookingId}` });

    return response.data;
}

export async function RemoveBookingFromCheckout({ bookingId, checkoutId }: {bookingId: string, checkoutId: string}){
    const response = await apiRequest({ method: "GET", endpoint: "booking/remove", queryParams: { checkoutId, bookingId } });

    return response;
}
