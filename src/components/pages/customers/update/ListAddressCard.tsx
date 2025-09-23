import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { MapPinX, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Address } from "@/utils/@types/address";
import { RegisterNewAddressDialog } from "./RegisterNewAddressDialog";
import { useState } from "react";
import { fetchWithToken } from "@/utils/fetchWithToken";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

interface ListCustomerAddressesCardProps {
    customerAddresses: Address[] | null
    customerId: string,
}
export function ListCustomerAddressesCard({ customerAddresses, customerId }: ListCustomerAddressesCardProps) {
    const [ isRegisterNewAddressDialogOpen, setIsRegisterNewAddressDialogOpen ] = useState(false);

    async function handleDeactivateAddress(addressId: string) {
        const response = await fetchWithToken(`${process.env.NEXT_PUBLIC_SERVER_URL}/address/deactivate?addressId=${addressId}`, {
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
        });
        const data = await response.json();

        if(!response.ok) {
            toast.warning(data.message, { style: { fontSize: "1rem" } });
            window.scroll({ top: 0 });
        } else {
            toast.success("Endereço desativado com sucesso!", { style: { fontSize: "1rem" } });
        }
    }

    return (
        <Card className="">
            <CardHeader>
                <CardDescription className="text-xl font-bold">Endereços cadastrados:</CardDescription>
            </CardHeader>
            <CardContent>
                {
                    customerAddresses?.map(addr => {
                        return (
                            <div
                                key={ addr.addressId }
                                className="flex justify-between items-center"
                            >
                                <p>
                                    {addr.street.streetName}, {addr.neighborhood.neighborhoodName},{" "}
                                    {addr.buildingNumber}, {addr.addressComplement} -{" "}
                                    {addr.city.cityName}/{addr.state.UF}
                                </p>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={ () => addr.isActive && handleDeactivateAddress(addr.addressId) }
                                                className={
                                                    !addr.isActive
                                                        ? "pointer-events-none opacity-50 hover:bg-transparent"
                                                        : ""
                                                }
                                            >
                                                <X className="size-5" />
                                            </Button>
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {addr.isActive ? (
                                            <p>Desativar endereço</p>
                                        ) : (
                                            <p>Endereço já desativado</p>
                                        )}
                                    </TooltipContent>
                                </Tooltip>
                            </div>

                        // <Tooltip key={ addr.addressId }>
                        //     <TooltipTrigger asChild>
                        //         <div className="flex justify-between items-center">
                        //             <p>{ addr.street.streetName }, { addr.neighborhood.neighborhoodName }, {addr.buildingNumber}, {addr.addressComplement} - { addr.city.cityName }/{ addr.state.UF }</p>
                        //             <Button
                        //                 type="button"
                        //                 onClick={ () => handleDeactivateAddress(addr.addressId) }
                        //                 variant="outline"
                        //                 disabled={ !addr.isActive }
                        //             >
                        //                 <X className="size-5" />
                        //             </Button>
                        //         </div>
                        //     </TooltipTrigger>
                        //     <TooltipContent>
                        //         {addr.isActive ? (
                        //             <p>Desativar endereço</p>
                        //         ) : (
                        //             <p>Endereço já desativado</p>
                        //         )}
                        //     </TooltipContent>
                        // </Tooltip>
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