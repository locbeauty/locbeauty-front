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
            ...checkout.Customer,
            lastBooking: checkout.Customer.lastBooking
                ? new Date(checkout.Customer.lastBooking)
                : null,
        },
        address: {
            ...checkout.Address,
            createdAt: new Date(checkout.Address.createdAt),
            updatedAt: new Date(checkout.Address.updatedAt),
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
    fuelCost?: number;
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
        method: "POST",
        body: { checkoutId, date, checkoutStatus },
    });

    return response;
}

interface AddGearInCheckoutResponse {
  statusCode: number;
  message?: string;
  data?: {
    bookingId: string;
  };
}

export async function AddGearInCheckout({
    checkoutId,
    extraMachineCosts,
    extraMachineCostsDescription,
    gear,
    individualPrice
}: {
    checkoutId: string;
    gear: {
        gearId: string,
        gearName: string,
    };
    individualPrice: number;
    extraMachineCosts: number;
    extraMachineCostsDescription?: string;
}): Promise<AddGearInCheckoutResponse> {

    const response = await apiRequest<{bookingId: string}>({
        endpoint: "booking/update/add-gear",
        method: "POST",
        body: {
            checkoutId,
            extraMachineCosts,
            extraMachineCostsDescription,
            gear,
            individualPrice
        },
    });

    return response;
}
