import { apiRequest } from "@/lib/api";
import { BookingWithCheckout } from "@/utils/@types/bookings";

export async function UpdateBooking({
  body,
  bookingId,
}: {
  body: {
    individualPrice: number;
    extraMachineCosts: number;
    extraMachineCostsDescription: string;
    gearId?: string;
  };
  bookingId: string;
}) {
  const response = await apiRequest({
    endpoint: "booking/update",
    method: "POST",
    body,
    queryParams: { bookingId },
  });

  return response;
}

export async function GetBookingById({
  bookingId,
}: {
  bookingId: string;
}): Promise<BookingWithCheckout | undefined> {
  const response = await apiRequest<BookingWithCheckout | undefined>({
    endpoint: `booking/${bookingId}`,
  });

  return response.data;
}

export async function RemoveBookingFromCheckout({
  bookingId,
  checkoutId,
}: {
  bookingId: string;
  checkoutId: string;
}) {
  const response = await apiRequest({
    method: "GET",
    endpoint: "booking/remove",
    queryParams: { checkoutId, bookingId },
  });

  return response;
}

export async function ImportBookings(formData: FormData) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/bookings/import`,
      {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      },
    );

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Network error:", err);
    return { statusCode: 0, message: "Network error" };
  }
}
