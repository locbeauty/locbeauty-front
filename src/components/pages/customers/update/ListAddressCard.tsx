import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { MapPinX, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Address } from "@/utils/@types/address";
import { RegisterNewAddressDialog } from "./RegisterNewAddressDialog";
import { useState } from "react";

interface ListCustomerAddressesCardProps {
    customerAddresses: Address[] | null
    customerId: string,
}
export function ListCustomerAddressesCard({ customerAddresses, customerId }: ListCustomerAddressesCardProps) {
    const [ isRegisterNewAddressDialogOpen, setIsRegisterNewAddressDialogOpen ] = useState(false);

    return (
        <Card className="">
            <CardHeader>
                <CardDescription className="text-xl font-bold">Endereços cadastrados:</CardDescription>
            </CardHeader>
            <CardContent>
                {
                    customerAddresses?.map(addr => {
                        return (
                            <div key={ addr.addressId } className="flex justify-between items-center">
                                <p>{ addr.street.streetName }, { addr.neighborhood.neighborhoodName }, {addr.buildingNumber}, {addr.addressComplement} - { addr.city.cityName }/{ addr.state.UF }</p>
                                <Button variant="outline">
                                    <MapPinX className="size-5" />
                                </Button>
                            </div>
                        );
                    })
                }

                <RegisterNewAddressDialog
                    customerId={ customerId }
                    isRegisterNewAddressDialogOpen={ isRegisterNewAddressDialogOpen }
                    setIsRegisterNewAddressDialogOpen={ setIsRegisterNewAddressDialogOpen }
                />
            </CardContent>
        </Card>
    );
}