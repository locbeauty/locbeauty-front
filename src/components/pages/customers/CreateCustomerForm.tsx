
import { CustomerGeneralInformationForm } from "./CustomerGeneralInformationForm";
import { CustomerAddressForm } from "./CustomerAddressForm";

export function CreateCustomerForm() {
    return (
        <div className="flex flex-col gap-5">
            <CustomerGeneralInformationForm />
            <CustomerAddressForm />
        </div>
    );
}