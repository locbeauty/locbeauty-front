import { useFormContext } from "react-hook-form";
import { CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import PhoneInput from "@/components/shared/PhoneInput";
import { Input } from "@/components/ui/input";
import { SelectEmployee } from "../../../shared/SelectEmployee";
import { Textarea } from "@/components/ui/textarea";
import { Filial } from "@/utils/@types/filials";
import { FilialUpdateAddressForm } from "./FilialUpdateAddressForm";
import { UpdateFilialFormSchemaType } from "@/lib/zod/UpdateFilialValidation";

interface UpdateFilialFormProps {
  selectedFilial: Filial;
}

export function UpdateFilialForm({ selectedFilial }: UpdateFilialFormProps) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<UpdateFilialFormSchemaType>();

  return (
    <CardContent className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone</Label>
          <PhoneInput register={ register("cellphone") } />
          {errors.cellphone && (
            <p className="text-sm font-medium text-destructive">
              {errors.cellphone.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            { ...register("email") }
            id="email"
            type="email"
            placeholder="email@exemplo.com"
            className="placeholder:text-placeholder"
          />
          {errors.email && (
            <p className="text-sm font-medium text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Descrição</Label>
        <Textarea
          { ...register("filialName") }
          placeholder="Informações adicionais sobre a filial"
          className="placeholder:text-placeholder max-h-[200px]"
        />
        {errors.email && (
          <p className="text-sm font-medium text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="gerente">Gerente</Label>
        <SelectEmployee
          // managerEmployeeId={ selectedFilial.managerEmployee.employeeId }
          control={ control }
          name="managerEmployeeId"
        />
        {errors.managerEmployeeId && (
          <p className="text-sm font-medium text-destructive">
            {errors.managerEmployeeId.message}
          </p>
        )}
      </div>
      <FilialUpdateAddressForm />
    </CardContent>
  );
}
