import { BookingFilterStatusTypes } from "@/app/(main)/bookings/page";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SelectStatus() {
    return (
        <Select>
            <SelectTrigger id="status">
                <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
                {
                    BookingFilterStatusTypes.map(status => {
                        if(status !== "Todos") {
                            return (
                                <SelectItem key={ status } value={ status.toLowerCase() }>{ status }</SelectItem>
                            );
                        }
                    })
                }
            </SelectContent>
        </Select>
    );
}