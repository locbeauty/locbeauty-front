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
  traineeId,
}: {
  traineeId: string;
}) {
  const response = await apiRequest<Address[]>({
    endpoint: "trainee/addresses",
    queryParams: { traineeId },
  });

  return response;
}

export async function CreateCustomerAddress({
  customerId,
  body,
}: {
  customerId: string;
  body: unknown;
}) {
  console.log("Creating address for customer:", customerId);
  const response = await apiRequest<Address[]>({
    endpoint: `address/create/${customerId}`,
    body,
    method: "POST",
  });

  return response;
}

export async function DeactivateCustomerAddress({
  addressId,
}: {
  addressId: string;
}) {
  const response = await apiRequest({
    endpoint: "address/deactivate",
    queryParams: { addressId },
  });

  return response;
}
