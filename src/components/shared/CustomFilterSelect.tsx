import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import React from "react";

type FilterItem = string | { value: string; label: string };

interface CustomFilterSelectProps extends React.ComponentPropsWithoutRef<
  typeof Select
> {
  items: readonly FilterItem[];
  placeholder?: string;
  triggerProps?: React.ComponentPropsWithoutRef<typeof SelectTrigger>;
  showAllOption?: boolean;
}

export function CustomFilterSelect({
  items,
  placeholder,
  triggerProps,
  showAllOption = false,
  value,
  ...selectProps
}: CustomFilterSelectProps) {
  return (
    <Select value={ value ?? "" } { ...selectProps }>
      <SelectTrigger
        { ...triggerProps }
        className={ cn(
          "data-[placeholder]:text-placeholder",
          triggerProps?.className,
        ) }
      >
        <SelectValue placeholder={ placeholder } />
      </SelectTrigger>
      <SelectContent>
        {showAllOption && <SelectItem value="all">Todas</SelectItem>}
        {items.map((item) => {
          const value = typeof item === "string" ? item : item.value;
          const label = typeof item === "string" ? item : item.label;

          return (
            <SelectItem key={ value } value={ value }>
              {label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
