import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Filial } from "@/utils/@types/filials";
import { fetchWithToken } from "@/utils/fetchWithToken";

interface FilialFilterProps {
  value: string;
  onChange: (value: string) => void;
  accessibleFilials?: string[];
}

export function FilialFilter({
  value,
  onChange,
  accessibleFilials,
}: FilialFilterProps) {
  const [ allFilials, setAllFilials ] = useState<Filial[]>([]);

  useEffect(() => {
    async function handleGetAllFilials() {
      const response = await fetchWithToken(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/filials`,
        {
          credentials: "include",
          next: {
            tags: [ "get-all-filials" ],
          },
        }
      );
      const { data }: { data: Filial[] } = await response.json();
      setAllFilials(data);
    }
    handleGetAllFilials();
  }, []);

  return (
    <Select value={ value } onValueChange={ onChange }>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filtrar por Filial" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">Todas as Filiais</SelectItem>
        {allFilials
          .filter(
            (filial) =>
              !accessibleFilials || accessibleFilials.includes(filial.filialId)
          )
          .map((filial) => {
            return (
              <SelectItem key={ filial.filialId } value={ filial.filialId }>
                {filial.filialName}
              </SelectItem>
            );
          })}
      </SelectContent>
    </Select>
  );
}
