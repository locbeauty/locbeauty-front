import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectGear } from "./SelectGear";
import { SelectCustomer } from "./SelectCustomer";
import { SelectStatus } from "./SelectStatus";
import { RangeDatePicker } from "@/components/ui/range-date-picker";
import { CardContent } from "@/components/ui/card";

export function CreateBookingForm() {
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
                    <Label htmlFor="status">Status</Label>
                    <SelectStatus />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="data-inicio">Data da reserva</Label>
                    <RangeDatePicker />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Input id="observacoes" />
                </div>

            </form>
        </CardContent>
    );
}