import { apiRequest, ApiResponse } from "@/lib/api";
import { Checkout } from "@/utils/@types/checkouts";
import { CheckoutStatuses } from "@/utils/constants";

// Helper function to parse date strings into Date objects
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseCheckoutDates(checkout: Record<string, any>): Checkout {
  return {
    ...(checkout as Checkout),
    date: new Date(checkout.date),
    Customer: {
      ...checkout.Customer,
      lastBooking: checkout.Customer.lastBooking
        ? new Date(checkout.Customer.lastBooking)
        : null,
    },
    Address: {
      ...checkout.Address,
      createdAt: new Date(checkout.Address.createdAt),
      updatedAt: new Date(checkout.Address.updatedAt),
    },
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
  const response = await apiRequest<Checkout>({
    endpoint: `checkouts/${checkoutId}`,
  });

  // Parse dates for the checkout
  if (response.data) {
    response.data = parseCheckoutDates(response.data);
  }

  return response;
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
