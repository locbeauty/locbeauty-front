"use client";

import { AddCustomerAddressForm } from "@/components/pages/customers/update/AddCustomerAddressForm";
import { AddressTypeSchema } from "@/lib/zod/address";

export function EmbeddedTrainingAddressForm() {
  const handleSavePlaceholder = (_values: AddressTypeSchema) => {
    // Logic moved to parent CreateTrainingDialog
  };

  return (
  // <div className="border rounded-md p-4 bg-background mt-2">

    <div className="relative">
      <AddCustomerAddressForm
        handleSaveUpdatedCustomer={ handleSavePlaceholder }
        hideButton={ true }
      />
    </div>
    // </div>
  );
}
