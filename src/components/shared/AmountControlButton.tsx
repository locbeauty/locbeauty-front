import { Minus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

interface UnitCounterInputProps {
  value: number
  onChange: (_value: number) => void
  error?: boolean
  min?: number,
  max?: number,
  disabled?: boolean
}

export function AmountControlButton({ value, onChange, error, min = 0, max, disabled=false }: UnitCounterInputProps) {
  const handleIncrement = () => {
    const newValue = (value !== undefined ? value : min) + 1;
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = (value !== undefined ? value : min) - 1;
    onChange(Math.max(min, newValue));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = parseInt(e.target.value);
    onChange(isNaN(numericValue) || numericValue < 1 ? 1 : numericValue);
  };

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={ handleDecrement }
        className="bg-gray-100 dark:bg-gray-800 p-2 rounded-l-md border border-gray-200 dark:border-gray-700 cursor-pointer"
        aria-label="Diminuir quantidade"
        disabled={ disabled }
      >
        <Minus className="size-4" />
      </button>
      <Input
        disabled
        id="availableUnits"
        type="number"
        min="0"
        value={ value }
        onChange={ handleInputChange }
        className={ `rounded-none text-center md:w-20 border-y border-gray-200 dark:border-gray-700 w-full ${
          error ? "border-destructive focus-visible:ring-destructive" : ""
        }` }
      />
      <button
        type="button"
        onClick={ handleIncrement }
        className="bg-gray-100 dark:bg-gray-800 p-2 rounded-r-md border border-gray-200 dark:border-gray-700 cursor-pointer"
        aria-label="Aumentar quantidade"
        disabled={ disabled || value === max }
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
