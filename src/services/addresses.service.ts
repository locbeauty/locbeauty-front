import { apiRequest } from "@/lib/api";
import { Address } from "@/utils/@types/address";

export async function GetAllCustomerAddresses({
  customerId,
}: {
  customerId: string;
}) {
  const response = await apiRequest<Address[]>({
    endpoint: "customer/addresses",
    queryParams: { customerId },
  });

  return response;
}

export async function GetAllTraineeAddresses({
  customerId,
}: {
  customerId: string;
}) {
  const response = await apiRequest<Address[]>({
    endpoint: "customer/addresses",
    queryParams: { customerId },
  });

  return response;
}

// ... existing code ...
export async function CreateCustomerAddress({
  customerId,
  body,
}: {
  customerId: string;
  body: unknown;
}) {
  const response = await apiRequest<Address[]>({
    endpoint: `address/create/${customerId}`,
    body,
    method: "POST",
  });

  return response;
}

export async function CreateGenericAddress({ body }: { body: unknown }) {
  const response = await apiRequest<Address>({
    endpoint: "address/create",
    body,
    method: "POST",
  });

  return response;
}
// ... existing code ...

export async function DeactivateCustomerAddress({
  addressId,
}: {
  addressId: string;
}) {
  const response = await apiRequest({
    endpoint: "address/deactivate",
    body: { addressId },
    method: "POST",
  });

  return response;
}

export async function ActivateCustomerAddress({
  addressId,
}: {
  addressId: string;
}) {
  const response = await apiRequest({
    endpoint: "address/activate",
    body: { addressId },
    method: "POST",
  });

  return response;
}

export async function GetAddressSuggestions({
  type,
  search,
}: {
  type: "city" | "neighborhood" | "street";
  search: string;
}) {
  const response = await apiRequest<string[]>({
    endpoint: "addresses/suggestions",
    queryParams: { type, search },
  });

  return response;
}

