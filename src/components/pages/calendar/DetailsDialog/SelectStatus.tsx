import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterBookingStatusTypes } from "@/utils/filterOptions";

// TODO: delete this component. CustomFilterSelect will be used instead.
export function SelectStatus() {
  return (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Selecione o status" />
      </SelectTrigger>
      <SelectContent>
        {
          FilterBookingStatusTypes.map(status => {
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