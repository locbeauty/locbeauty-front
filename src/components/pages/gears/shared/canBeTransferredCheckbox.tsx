import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Control, Controller, FieldErrors, FieldPath, FieldValues } from "react-hook-form";

type canBeTransferredCheckboxProps<T extends FieldValues> = {
  control: Control<T>
  errors: FieldErrors
  name: FieldPath<T>
}

export function CanBeTransferredCheckbox<T extends FieldValues>({ control, errors, name }: canBeTransferredCheckboxProps<T>) {
    return (
        <Controller
            control={ control }
            name={ name }
            render={ ({ field }) => (
                <div className="flex items-center h-full">
                    <div
                        className={ `bg-white dark:bg-gray-800 rounded-lg p-4 border ${
                            errors.canBeTransferred
                                ? "border-destructive"
                                : "border-gray-200 dark:border-gray-700"
                        } w-full flex items-center space-x-3` }
                    >
                        <Checkbox
                            id="canBeTransferred"
                            checked={ field.value }
                            onCheckedChange={ field.onChange }
                        />
                        <div className="space-y-1">
                            <Label
                                htmlFor="canBeTransferred"
                                className={ `font-medium cursor-pointer ${
                                    errors.canBeTransferred ? "text-destructive" : ""
                                }` }
                            >
                        Pode ser transferido?
                            </Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                        Marque esta opção se o equipamento pode ser transferido
                        entre regionais
                            </p>
                        </div>
                    </div>
                </div>
            ) }
        />
    );
}