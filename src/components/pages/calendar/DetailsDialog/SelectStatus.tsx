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
          // FilterBookingStatusTypes.map(status => {
          //   if(status !== "Todos") {
          //     return (
          //       <SelectItem key={ status } value={ status.toLowerCase() }>{ status }</SelectItem>
          //     );
          //   }
          // })
          FilterBookingStatusTypes.map(status => {
            if (status === "Todos") return null;

            const value = typeof status === "string" ? status : status.value;
            const label = typeof status === "string" ? status : status.label;

            return (
              <SelectItem key={ value } value={ value.toLowerCase() }>{ label }</SelectItem>
            );
          })
        }
      </SelectContent>
    </Select>
  );
}