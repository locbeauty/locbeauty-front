import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

interface MaskedDateInputProps {
  value: Date | string | null | undefined;
  onChange: (date: Date | null) => void;
  id?: string;
  error?: string;
  disabled?: boolean;
}

export function MaskedDateInput({
  value,
  onChange,
  id,
  error,
  disabled,
}: MaskedDateInputProps) {
  const [inputValue, setInputValue] = useState("");

  // Sync with external value changes (e.g. initial load)
  useEffect(() => {
    if (value instanceof Date) {
      setInputValue(value.toLocaleDateString("pt-BR"));
    } else if (!value) {
      setInputValue("");
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, "");
    if (input.length > 8) input = input.substring(0, 8);

    let formatted = input;
    if (input.length >= 3) {
      formatted = input.substring(0, 2) + "/" + input.substring(2);
    }
    if (input.length >= 5) {
      formatted = formatted.substring(0, 5) + "/" + formatted.substring(5);
    }

    setInputValue(formatted);

    // Parse to Date
    if (formatted.length === 10) {
      const parts = formatted.split("/");
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);

      const date = new Date(year, month - 1, day);
      if (
        date.getDate() === day &&
        date.getMonth() === month - 1 &&
        date.getFullYear() === year
      ) {
        onChange(date);
      } else {
        // Invalid date date
      }
    } else if (formatted.length === 0) {
      onChange(null);
    }
  };

  return (
    <Input
      id={id}
      disabled={disabled}
      placeholder="DD/MM/AAAA"
      value={inputValue}
      onChange={handleChange}
      maxLength={10}
      className={`placeholder:text-muted-foreground/50 ${
        error ? "border-destructive focus-visible:ring-destructive" : ""
      }`}
    />
  );
}
