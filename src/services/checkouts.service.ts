import { apiRequest, ApiResponse } from "@/lib/api";
import { Checkout, CheckoutValueChange } from "@/utils/@types/checkouts";
import { CheckoutStatuses } from "@/utils/constants";

// Helper function to parse date strings into Date objects
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseCheckoutDates(checkout: Record<string, any>): Checkout {
  return {
    ...(checkout as Checkout),
    date: new Date(checkout.date),
    concludedAt: checkout.concludedAt ? new Date(checkout.concludedAt) : null,
    cancellationDate: checkout.cancellationDate
      ? new Date(checkout.cancellationDate)
      : null,
    Customer: checkout.Customer
      ? {
        ...checkout.Customer,
        lastBooking: checkout.Customer.lastBooking
          ? new Date(checkout.Customer.lastBooking)
          : null,
      }
      : checkout.Customer,
    Address: checkout.Address
      ? {
        ...checkout.Address,
        createdAt: new Date(checkout.Address.createdAt),
        updatedAt: new Date(checkout.Address.updatedAt),
      }
      : checkout.Address,
  };
}

export async function GetAllCheckouts({
  queryParams,
}: {
  queryParams?: Record<
    string,
    string | number | boolean | Date | undefined | null | string[]
  >;
} = {}) {
  const response = await apiRequest<{ items: Checkout[]; total: number }>({
    endpoint: "checkouts",
    queryParams,
  });

  // Parse dates for all checkouts
  if (response.data?.items) {
    response.data.items = response.data.items.map(parseCheckoutDates);
  }

  return response;
}

export async function GetCheckoutById(checkoutId: string) {
  const response = await apiRequest<{ items: Checkout[]; total: number }>({
    endpoint: "checkouts",
    queryParams: { checkoutId, limit: 1 },
  });

  const raw = response.data?.items?.[0];
  return {
    ...response,
    data: raw ? parseCheckoutDates(raw) : undefined,
  };
}

export async function UpdateDriverLocation({
  checkoutId,
  lat,
  lng,
}: {
  checkoutId: string;
  lat: number;
  lng: number;
}) {
  return apiRequest({
    endpoint: `checkouts/${checkoutId}/driver-location`,
    method: "PATCH",
    body: { lat, lng },
  });
}

export type UpdateCheckoutBody = {
  driverId?: string;
  observations?: string;
  checkoutStatus?: CheckoutStatuses;
  cancellationFee?: number;
  cancellationDate?: Date | null;
  cancellationFeePaymentDate?: Date | null;
  cancellationFeePaymentMethod?: string | null;
  CheckoutPayment?: {
    paymentStatus: string;
    paymentMode: string;
    firstPaymentAmount: number;
    firstPaymentDate: Date | null;
    firstPaymentMethod: string | null;
    firstPaymentStatus: string;
    secondPaymentAmount: number | null;
    secondPaymentDate: Date | null;
    secondPaymentMethod: string | null;
    secondPaymentStatus: string | null;
  };
  distanceInKm?: number;
  fuelCost?: number;
  lodgingCost?: number;
  additionalTransportCost?: number;
  foodCost?: number;
  addressId?: string;
  date?: Date;
  startHourInMinutes?: number;
  totalDurationInMinutes?: number;
  isVisible?: boolean;
  justification?: string;
};

export async function UpdateCheckout({
  checkoutId,
  body,
}: {
  checkoutId: string;
  body: UpdateCheckoutBody;
}) {
  const response = await apiRequest<Checkout>({
    endpoint: `checkouts/${checkoutId}`,
    method: "PATCH",
    body,
  });

  // Parse dates for the checkout
  if (response.data) {
    response.data = parseCheckoutDates(response.data);
  }

  return response;
}

export async function GetCheckoutValueChanges(checkoutId: string) {
  return apiRequest<CheckoutValueChange[]>({
    endpoint: `checkouts/${checkoutId}/value-changes`,
  });
}

export async function UpdateCheckoutStatus({
  checkoutId,
  checkoutStatus,
  date,
}: {
  checkoutId: string;
  checkoutStatus: CheckoutStatuses;
  date: string;
}) {
  const response = await apiRequest<Checkout>({
    endpoint: `checkouts/${checkoutId}/status`,
    method: "PATCH",
    body: {
      checkoutStatus,
      date,
    },
  });

  // Parse dates for the checkout
  if (response.data) {
    response.data = parseCheckoutDates(response.data);
  }

  return response;
}

export type AddGearInCheckoutBody = {
  checkoutId: string;
  extraMachineCosts: number;
  extraMachineCostsDescription?: string;
  gear: {
    gearId: string;
    gearName: string;
  };
  individualPrice: number;
};

export async function AddGearInCheckout(body: AddGearInCheckoutBody) {
  const response = await apiRequest<{ bookingId: string }>({
    endpoint: `checkouts/${body.checkoutId}/gears`,
    method: "POST",
    body,
  });
  return response;
}

export interface GetDayCheckoutsResponse {
  hourInMinutes: number;
  formattedTime: string;
  availability: {
    durationInMinutes: number;
    available: boolean;
    maxGearAmount: number;
  }[];
}

export async function getDayCheckouts({
  body,
}: {
  body: {
    filialId: string;
    gears: Array<{ gearId: string; gearName: string; individualPrice: string }>;
    date: Date | undefined;
    excludeCheckoutId?: string;
    excludeTrainingId?: string;
  };
}) {
  const response = await apiRequest<GetDayCheckoutsResponse[]>({
    endpoint: "checkouts/day-availability",
    method: "POST",
    body,
  });
  return response;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function CreateCheckout(body: any) {
  const response = await apiRequest<Checkout>({
    endpoint: "checkouts",
    method: "POST",
    body,
  });

  // Parse dates for the checkout
  if (response.data) {
    response.data = parseCheckoutDates(response.data);
  }

  return response;
}

export async function SyncCheckouts(checkout: Checkout) {
  const response = await apiRequest<Checkout>({
    endpoint: `checkouts/${checkout.checkoutId}`,
  });

  const checkoutData = response.data;

  if (!checkoutData) {
    return response;
  }

  const parsedCheckout: Checkout = {
    ...checkoutData,
    date: new Date(checkoutData.date),
    Customer: {
      ...checkoutData.Customer,
      lastBooking: checkoutData.Customer.lastBooking
        ? new Date(checkoutData.Customer.lastBooking)
        : null,
    },
    Address: {
      ...checkoutData.Address,
      createdAt: new Date(checkoutData.Address.createdAt),
      updatedAt: new Date(checkoutData.Address.updatedAt),
    },
    Bookings: checkoutData.Bookings.map((b: Checkout["Bookings"][number]) => ({
      ...b,
    })),
  };

  return {
    ...response,
    data: parsedCheckout,
  };
}

export async function DeleteCheckout(checkoutId: string) {
  const response = await apiRequest({
    endpoint: `checkouts/${checkoutId}`,
    method: "DELETE",
  });
  return response;
}

export interface AddCheckoutPaymentBody {
  checkoutId: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentDate: Date;
  amount: number;
  observation?: string;
  transactionId?: string;
}

export async function AddCheckoutPayment(body: AddCheckoutPaymentBody) {
  const response = await apiRequest<ApiResponse<unknown>>({
    endpoint: "checkouts/payments",
    method: "POST",
    body,
  });
  return response as ApiResponse<unknown>;
}

export interface UpdateCheckoutPaymentBody {
  checkoutPaymentId: string;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentDate?: Date;
  amount?: number;
  observation?: string;
  transactionId?: string;
}

export async function UpdateCheckoutPayment(body: UpdateCheckoutPaymentBody) {
  const response = await apiRequest<ApiResponse<unknown>>({
    endpoint: `checkouts/payments/${body.checkoutPaymentId}`,
    method: "PATCH",
    body,
  });
  return response as ApiResponse<unknown>;
}

export async function DeleteCheckoutPayment(checkoutPaymentId: string) {
  const response = await apiRequest<ApiResponse<unknown>>({
    endpoint: `checkouts/payments/${checkoutPaymentId}`,
    method: "DELETE",
  });
  return response as ApiResponse<unknown>;
}
