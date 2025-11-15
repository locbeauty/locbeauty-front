import { GetDayCheckoutsResponse } from "@/components/pages/bookings/create/CreateBookingForm";
import { UpdateCheckoutPayload } from "@/components/pages/bookings/view/CheckoutPaymentMethodDialog/CheckoutPaymentMethodDialog";
import { apiRequest, ApiResponse } from "@/lib/api";
import {
    CreateCheckoutFormSchemaType,
    CreateCheckoutValidationWithMoneyInCents,
} from "@/lib/zod/CreateBookingValidation";
import { CreateCustomerFormSchemaType } from "@/lib/zod/CreateCustomerValidation";
import { UpdateCustomerFormSchemaType } from "@/lib/zod/UpdateCustomerValidation";
import { Checkout } from "@/utils/@types/checkouts";
import { Customer } from "@/utils/@types/customer";
import { Employee } from "@/utils/@types/employee";
import { ROLES } from "@/utils/@types/roles";
import { CheckoutStatuses } from "@/utils/constants";

export async function CreateCheckout(
    body: CreateCheckoutValidationWithMoneyInCents
) {
    const response = await apiRequest({
        endpoint: "bookings/create",
        method: "POST",
        body,
    });

    return response;
}

export async function GetAllCheckouts({
    queryParams,
}: {
  queryParams?: Record<string, string>;
}) {
    const response = await apiRequest<Checkout[]>({
        endpoint: "checkouts",
        queryParams,
    });

    if (!response?.data) return response;

    const parsedData: Checkout[] = response?.data?.map((checkout) => ({
        ...checkout,
        date: new Date(checkout.date),
        customer: {
            ...checkout.customer,
            lastBooking: checkout.customer.lastBooking
                ? new Date(checkout.customer.lastBooking)
                : null,
        },
        address: {
            ...checkout.address,
            createdAt: new Date(checkout.address.createdAt),
            updatedAt: new Date(checkout.address.updatedAt),
        },
        Bookings: checkout.Bookings.map((b) => ({
            ...b,
        })),
    }));

    return { ...response, data: parsedData };
}

export async function getDayCheckouts({
    body,
}: {
  body: Record<string, unknown>;
}) {
    const response = await apiRequest<GetDayCheckoutsResponse[]>({
        endpoint: "bookings/available",
        body,
        method: "POST",
    });
    return response;
}

export async function UpdateCheckout({
    body,
    checkoutId,
}: {
  body: {
    distanceInKm?: number;
    foodCost?: number;
    lodgingCost?: number;
    additionalTransportCost?: number;
    observations?: string;
    checkoutStatus?: CheckoutStatuses;
    CheckoutPayment?: UpdateCheckoutPayload["CheckoutPayment"];
  };
  checkoutId: string;
}) {
    const response = await apiRequest({
        endpoint: "checkout/update",
        method: "POST",
        body,
        queryParams: { checkoutId },
    });

    return response;
}

export async function UpdateCheckoutStatus({
    checkoutId,
    date,
    checkoutStatus
}: {
  date: string;
  checkoutId: string;
  checkoutStatus: CheckoutStatuses;
}) {

    const response = await apiRequest({
        endpoint: "bookings/config/status",
        queryParams: { checkoutId, date, checkoutStatus },
    });

    return response;
}
