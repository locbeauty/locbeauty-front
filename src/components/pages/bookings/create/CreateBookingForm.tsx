import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SelectCustomer } from "./SelectCustomer";
import { SelectGear } from "./SelectGear";
import { SelectStatus } from "../view/DetailsDialog/SelectStatus";

export function CreateBookingForm() {
    const availableHours = [
        { hour: 5, available: true },
        { hour: 6, available: true },
        { hour: 7, available: true },
        { hour: 8, available: false },
        { hour: 9, available: false },
        { hour: 10, available: false },
        { hour: 11, available: false },
        { hour: 12, available: false },
        { hour: 13, available: false },
        { hour: 14, available: false },
        { hour: 15, available: true },
        { hour: 16, available: true },
        { hour: 17, available: true },
        { hour: 18, available: true },
        { hour: 19, available: true },
        { hour: 20, available: true },
        { hour: 21, available: true },
        { hour: 22, available: false },
    ];

    return (
        <CardContent>
            <form id="new-booking-form" className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="cliente">Cliente</Label>
                    <SelectCustomer />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="equipamento">Equipamento</Label>
                    <SelectGear />
                </div>

                <div className="grid gap-4 md:grid-cols-3 space-y-2">
                    <div className="space-y-2">
                        <Label htmlFor="quantidade">Quantidade</Label>
                        <Input id="quantidade" type="number" min="1" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Status</Label>
                    {/* TODO: Remove this SelectStatus, use CustomFilterSelect instead */}
                    <SelectStatus />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="data-inicio">Data da reserva</Label>
                    <div className="flex flex-col md:flex-row items-center gap-2">
                        {/* TODO: ADD <DatePicker /> */}
                        <div className="flex justify-center flex-wrap gap-2">
                            {availableHours.map((hour) => (
                                <Badge
                                    key={ hour.hour }
                                    variant="outline"
                                    className={ cn(
                                        "hover:bg-primary/20",
                                        hour.available
                                            ? "cursor-pointer"
                                            : "cursor-not-allowed opacity-50"
                                    ) }
                                >
                                    {hour.hour}:00
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Input id="observacoes" />
                </div>
            </form>
        </CardContent>
    );
}
