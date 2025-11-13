import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
    Clock,
    MapPin,
    DollarSign,
    User,
    Calendar,
    ClipboardList,
    Package,
    Building,
    Phone,
    Mail, Trash2,
    CircleEllipsis, Text, FileText,
    Pencil,
    Copy,
    Scroll,
    Check
} from "lucide-react";
import {
    formatDate,
    formatTime
} from "@/components/pages/bookings/view/bookingViewHelpers";
import { BookingStatusBadge } from "@/components/pages/bookings/common/BookingStatusBadge";
import { BookingPaymentStatusBadge } from "../../common/BookingPaymentStatusBadge";
import { toast } from "sonner";
import { fetchWithToken } from "@/utils/fetchWithToken";
import { MachineExtraCostsDialog } from "../MachineExtraCostsDialog/MachineExtraCostsDialog";
import { centsToString, centsToStringWithCurrencyMark } from "@/utils/centsToString";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkout } from "@/utils/@types/checkouts";
import { AdditionalCostsDialog } from "../AdditionalCostsDialog/AdditionalCostsDialog";
import { Textarea } from "@/components/ui/textarea";
import { MarkCheckoutAsConcluded, UpdateCheckout } from "@/services/checkouts.service";
import { queryClient } from "@/app/(main)/layout";
import { CheckoutPaymentMethodDialog } from "../CheckoutPaymentMethodDialog/CheckoutPaymentMethodDialog";

interface BookingDetailsDialogProps {
  setBookingDetailsDialogOpen: Dispatch<SetStateAction<boolean>>;
  isBookingDetailsDialogOpen: boolean;
  selectedCheckout: Checkout | null;
  setSelectedCheckout: Dispatch<SetStateAction<Checkout | null>>
}

export function BookingDetailsDialog({
    isBookingDetailsDialogOpen,
    setBookingDetailsDialogOpen,
    selectedCheckout,
    setSelectedCheckout
}: BookingDetailsDialogProps) {

    const [ checkoutObservations, setCheckoutObservations ] = useState("");
    const [ selectedBookingIdForExtraCosts, setSelectedBookingIdForExtraCosts ] = useState<string | null>(null);
    const [ isAdditionalCostsDialogOpen, setAdditionalCostsDialogOpen ] = useState(false);
    const [ isCheckoutPaymentMethodDialogOpen, setIsCheckoutPaymentMethodDialogOpen ] = useState(false);

    useEffect(() => {
        setCheckoutObservations(selectedCheckout?.observations || "");
    }, [ selectedCheckout ]);

    async function handleUpdateCheckoutObservations() {
        const response = await UpdateCheckout({
            body: {
                observations: checkoutObservations
            },
            checkoutId: selectedCheckout!.checkoutId,
        });

        if (response.statusCode !== 200) {
            toast.warning(response.message, { style: { fontSize: "1rem" } });
            window.scroll({ top: 0 });
            return;
        }

        toast.success(response.message, { style: { fontSize: "1rem" } });

        setSelectedCheckout(prev => {
            if(!prev) return prev;
            return {
                ...prev,
                observations: checkoutObservations
            };
        });

        queryClient.invalidateQueries({ queryKey: [ "get-all-checkouts" ] });
    }

    async function handleMarkAsConcluded(checkoutId: string) {
        const response = await MarkCheckoutAsConcluded({
            checkoutId,
            date: selectedCheckout!.date.toString()
        });

        if (response.statusCode !== 200) {
            toast.warning(response.message, { style: { fontSize: "1rem" } });
            // setBookingDetailsDialogOpen(false);
        } else {

            toast.success(response.message, { style: { fontSize: "1rem" } });

            setSelectedCheckout(prev => {
                if(!prev) return prev;
                return {
                    ...prev,
                    checkoutStatus: "Concluido"
                };
            });

            queryClient.invalidateQueries({ queryKey: [ "get-all-checkouts" ] });
        }
    }

    if(!selectedCheckout) return null;

    const startDate = new Date(selectedCheckout.date);
    startDate.setHours(Math.floor(selectedCheckout.startHourInMinutes / 60));
    startDate.setMinutes(selectedCheckout.startHourInMinutes % 60);

    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + selectedCheckout.totalDurationInMinutes);

    return (
        <Dialog
            open={ isBookingDetailsDialogOpen }
            onOpenChange={ setBookingDetailsDialogOpen }
        >
            <DialogContent className="max-h-[90vh] w-[80vw] overflow-scroll dark:bg-gray-900">
                { selectedCheckout && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-xl">
                Detalhes do Agendamento
                            </DialogTitle>
                            <DialogDescription>
                Informações completas sobre a locação do equipamento
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            { /* Cabeçalho com informações principais */ }
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-primary" />
                                    <h3 className="text-lg font-semibold">
                                        {selectedCheckout.Bookings.sort((a, b) => a.gear.gearName.localeCompare(b.gear.gearName)).map(item => item.gear.gearName).join(", ")}
                                    </h3>
                                </div>
                                <div className="flex gap-2">
                                    <BookingStatusBadge
                                        status={ selectedCheckout.checkoutStatus }
                                    />
                                    <BookingPaymentStatusBadge
                                        status={ selectedCheckout.CheckoutPayment.paymentStatus }
                                    />
                                </div>
                            </div>

                            <Separator />

                            { /* Informações do funcionário */ }
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm text-muted-foreground">
                  FUNCIONÁRIO RESPONSÁVEL
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span>{ selectedCheckout.accountableEmployee.fullname }</span>
                                    </div>
                                    { selectedCheckout.customer.email && (
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span>{ selectedCheckout.accountableEmployee.documentNumber }</span>
                                        </div>
                                    ) }
                                </div>
                            </div>

                            <Separator />
                            { /* Informações do cliente */ }
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm text-muted-foreground">
                  CLIENTE
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span>{ selectedCheckout.customer.fullname }</span>
                                    </div>
                                    { selectedCheckout.customer.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span>{ selectedCheckout.customer.email }</span>
                                        </div>
                                    ) }
                                    { selectedCheckout.customer.documentNumber && (
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <span>{ selectedCheckout.customer.documentNumber }</span>
                                        </div>
                                    ) }
                                    { selectedCheckout.customer.cellphone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span>{ selectedCheckout.customer.cellphone }</span>
                                        </div>
                                    ) }
                                </div>
                            </div>

                            <Separator />

                            { /* Informações de local */ }
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm text-muted-foreground">
                  LOCAL
                                </h4>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                        <span>{ selectedCheckout.address.city.cityName }</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            {selectedCheckout.address.neighborhood.neighborhoodName},{" "}
                                            {selectedCheckout.address.street.streetName},{" "}
                                            {selectedCheckout.address.buildingNumber}
                                        </span>
                                    </div>
                                    {
                                        selectedCheckout.address.addressComplement && (
                                            <div className="flex items-center gap-2">
                                                <CircleEllipsis className="h-4 w-4 text-muted-foreground" />
                                                <span>{ selectedCheckout.address.addressComplement }</span>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>

                            <Separator />

                            { /* Informações de data e hora */ }
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm text-muted-foreground">
                  DATA E HORA
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>{ formatDate(selectedCheckout.date) }</span>
                                        {/* <span>{ selectedCheckout.date.toString() }</span> */}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            { formatTime(startDate) } -{ " " }
                                            { formatTime(endDate) }
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>
                      Duração: { selectedCheckout.totalDurationInMinutes / 60 } horas
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <h4 className="font-medium text-sm text-muted-foreground">
                  MOTORISTA
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>{selectedCheckout.driverId || "A definir"}</div>
                                </div>
                            </div>

                            <Separator className="my-6" />

                            { /* Informações financeiras */ }
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm text-muted-foreground">
        INFORMAÇÕES FINANCEIRAS
                                </h4>
                                <Card>
                                    <CardContent>
                                        { /* Informações individuais de cada booking */ }
                                        {selectedCheckout.Bookings
                                            .sort((a, b) => a.gear.gearName.localeCompare(b.gear.gearName))
                                            .map((booking, index, arr) => {
                                                const isLast = index === arr.length - 1;
                                                return (
                                                    <div
                                                        key={ booking.bookingId }
                                                        className={ `grid grid-cols-12 gap-2 py-2 ${isLast ? "" : "border-b"}` }
                                                    >
                                                        <div className="flex items-center gap-2 col-span-3">
                                                            <Package className="h-4 w-4 text-muted-foreground" />
                                                            <span>{booking.gear.gearName}</span>
                                                        </div>

                                                        <div className="flex flex-col gap-2 col-span-7">
                                                            <div className="flex items-center gap-2">
                                                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                                <span><span className="font-bold">Valor:</span> {centsToStringWithCurrencyMark(booking.individualPrice)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                                <span className="text-sm"><span className="font-bold">Custo extra máquina:</span> {centsToStringWithCurrencyMark(booking.extraMachineCosts)}</span>
                                                            </div>
                                                            {booking.extraMachineCostsDescription && (
                                                                <div className="flex items-center gap-2">
                                                                    <Text className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                                    <span className="text-sm text-wrap"><span className="font-bold">Descrição:</span> {booking.extraMachineCostsDescription}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center justify-end col-span-2">
                                                            <Tooltip defaultOpen={ false }>
                                                                <TooltipTrigger defaultChecked={ false } asChild>
                                                                    <Button variant="outline" size="xs" className="size-8" onClick={ () => setSelectedBookingIdForExtraCosts(booking.bookingId) }>
                                                                        <Pencil />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Adicionar ou editar custos extras</p>
                                                                </TooltipContent>
                                                            </Tooltip>

                                                            <MachineExtraCostsDialog
                                                                setBookingDetailsDialogOpen={ setBookingDetailsDialogOpen }
                                                                setSelectedCheckout={ setSelectedCheckout }
                                                                selectedBookingId={ selectedBookingIdForExtraCosts }
                                                                isMachineExtraCostsDialogOpen={ !!selectedBookingIdForExtraCosts }
                                                                setMachineExtraCostsDialogOpen={ () => setSelectedBookingIdForExtraCosts(null) }
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                        <Separator className="my-6" />

                                        { /* Informações do checkout em geral */ }
                                        <div className="flex flex-col gap-4 text-sm text-muted-foreground mb-4">
                                            {selectedCheckout.basePrice > 0 && (
                                                <div><span className="font-bold">Preço base:</span> {centsToStringWithCurrencyMark(selectedCheckout.basePrice)}</div>
                                            )}
                                            {selectedCheckout.distanceInKm > 0 && (
                                                <div><span className="font-bold">Distância (km):</span> {selectedCheckout.distanceInKm}</div>
                                            )}
                                            {selectedCheckout.fuelCost > 0 && (
                                                <div><span className="font-bold">Preço combustível:</span> {centsToStringWithCurrencyMark(selectedCheckout.fuelCost)}</div>
                                            )}
                                            {selectedCheckout.foodCost > 0 && (
                                                <div><span className="font-bold">Alimentação:</span> {centsToStringWithCurrencyMark(selectedCheckout.foodCost)}</div>
                                            )}
                                            {selectedCheckout.lodgingCost > 0 && (
                                                <div><span className="font-bold">Hospedagem:</span> {centsToStringWithCurrencyMark(selectedCheckout.lodgingCost)}</div>
                                            )}
                                            {selectedCheckout.totalPrice - selectedCheckout.CheckoutPayment.firstPaymentAmount && selectedCheckout.CheckoutPayment.paymentMode === "Parcelado" && (
                                                <div><span className="font-bold">Valor pendente:</span> {centsToStringWithCurrencyMark(selectedCheckout.totalPrice - selectedCheckout.CheckoutPayment.firstPaymentAmount)}</div>
                                            )}
                                            {selectedCheckout.additionalTransportCost > 0 && (
                                                <div><span className="font-bold">Valores adicionais de transporte:</span> {centsToStringWithCurrencyMark(selectedCheckout.additionalTransportCost)}</div>
                                            )}
                                            <div className="flex items-center justify-end col-span-2">
                                                <Tooltip defaultOpen={ false }>
                                                    <TooltipTrigger defaultChecked={ false } asChild>
                                                        <Button variant="outline" size="xs" className="size-8" onClick={ () => setAdditionalCostsDialogOpen(true) }>
                                                            <Pencil />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Adicionar ou editar custos extras</p>
                                                    </TooltipContent>
                                                </Tooltip>

                                                <AdditionalCostsDialog
                                                    selectedCheckout={ selectedCheckout }
                                                    setAdditionalCostsDialogOpen={ setAdditionalCostsDialogOpen }
                                                    isAdditionalCostsDialogOpen={ isAdditionalCostsDialogOpen }
                                                    setSelectedCheckout={ setSelectedCheckout }
                                                />
                                            </div>
                                        </div>
                                        <Separator className="my-6" />

                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-2 items-center">
                                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                <span><span className="font-bold">Total do checkout: </span>{centsToStringWithCurrencyMark(selectedCheckout.totalPrice)}</span>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                type="button"
                                                onClick={ () => {
                                                    if (!selectedCheckout) return;

                                                    const lines = [
                                                        `Equipamento${selectedCheckout.Bookings.length > 1 ? "s" : ""}: ${selectedCheckout.Bookings.map(item => item.gear.gearName).join(", ")}`,
                                                        `Data: ${new Date(selectedCheckout.date).toLocaleDateString("pt-BR")}`,
                                                        `Horário: ${formatTime(startDate)} - ${formatTime(endDate)}`,
                                                        `Duração: ${selectedCheckout.totalDurationInMinutes / 60}h`,
                                                        `Preço total: ${centsToStringWithCurrencyMark(selectedCheckout.totalPrice)}`,
                                                        `Cliente: ${selectedCheckout.customer.fullname} - ${selectedCheckout.customer.documentNumber || "Sem documento"}`,
                                                        `Contato: ${selectedCheckout.customer.cellphone || "Sem telefone"}`,
                                                        `Endereço: ${selectedCheckout.address.street.streetName}, ${selectedCheckout.address.buildingNumber} - ${selectedCheckout.address.neighborhood.neighborhoodName}, ${selectedCheckout.address.city.cityName}`,
                                                        `Motorista: ${selectedCheckout.driverId || "A definir"}`,
                                                        selectedCheckout.foodCost > 0 && `Alimentação: ${centsToStringWithCurrencyMark(selectedCheckout.foodCost)}`,
                                                        selectedCheckout.fuelCost > 0 && `Combustível: ${centsToStringWithCurrencyMark(selectedCheckout.fuelCost)}`,
                                                        selectedCheckout.lodgingCost > 0 && `Hospedagem: ${centsToStringWithCurrencyMark(selectedCheckout.lodgingCost)}`,
                                                        selectedCheckout.additionalTransportCost > 0 && `Custos adicionais de transporte: ${centsToStringWithCurrencyMark(selectedCheckout.additionalTransportCost)}`,
                                                        selectedCheckout.observations && selectedCheckout.observations.trim().length > 0 && `Observações: ${selectedCheckout.observations}`
                                                    ].filter(Boolean); // remove falsy (undefined/false) linhas

                                                    const textToCopy = lines.join("\n");

                                                    navigator.clipboard.writeText(textToCopy);
                                                    toast.success("Resumo copiado para a área de transferência.");
                                                } }
                                            >
                                                <Copy className="w-4 h-4 text-primary" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            { /* Observações */ }
                            <Card>
                                <CardHeader>
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm text-muted-foreground">
                    OBSERVAÇÕES
                                        </h4>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col items-end gap-3">
                                        <Textarea placeholder="Adicione uma observação" value={ checkoutObservations } onChange={ (e) => setCheckoutObservations(e.target.value) } className="max-h-[150px]" maxLength={ 100 } />
                                        <Button onClick={ () => handleUpdateCheckoutObservations() } disabled={ checkoutObservations === selectedCheckout.observations }>Salvar observação</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <DialogFooter className="flex flex-row gap-3 justify-center sm:justify-center items-center w-full">
                            <Button
                                className="flex items-center justify-center cursor-pointer"
                                variant={ "outline" }
                                onClick={ () => setIsCheckoutPaymentMethodDialogOpen(true) }
                            >
                                <DollarSign className="" />
                                <span className="md:block hidden">Gerenciar pagamento</span>
                            </Button>
                            <Button
                                variant="default"
                                className="flex items-center justify-center cursor-pointer"
                                onClick={ () => handleMarkAsConcluded(selectedCheckout.checkoutId) }
                                disabled={ selectedCheckout.checkoutStatus === "Concluido" || selectedCheckout.CheckoutPayment.paymentStatus !== "Pago" }
                            >
                                <Check className="" />
                                <span className="md:block hidden">Marcar como concluído</span>
                            </Button>
                            <Button
                                disabled={ selectedCheckout.checkoutStatus === "Concluido" }
                                variant="destructive"
                                className="flex items-center justify-center cursor-pointer"
                            >
                                <Trash2 className="" />
                                <span className="md:block hidden">Cancelar Agendamento</span>
                            </Button>
                        </DialogFooter>
                    </>
                ) }

                <CheckoutPaymentMethodDialog
                    selectedCheckout={ selectedCheckout }
                    setSelectedCheckout={ setSelectedCheckout }
                    isCheckoutPaymentMethodDialogOpen={ isCheckoutPaymentMethodDialogOpen }
                    setIsCheckoutPaymentMethodDialogOpen={ setIsCheckoutPaymentMethodDialogOpen }
                />
            </DialogContent>
        </Dialog>
    );
}