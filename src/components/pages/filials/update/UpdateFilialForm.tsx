import { useFormContext } from "react-hook-form";
import { CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import PhoneInput from "@/components/shared/PhoneInput";
import { Input } from "@/components/ui/input";
import { SelectEmployee } from "../../../shared/SelectEmployee";
import { Textarea } from "@/components/ui/textarea";
import { Filial } from "@/utils/@types/filials";
import { USER_ROLES } from "@/utils/constants";

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
      <div className="space-y-2">
        <Label htmlFor="filialName">Nome</Label>
        <Textarea
          { ...register("filialName") }
          placeholder="Informações adicionais sobre a filial"
          className="placeholder:text-placeholder max-h-[200px]"
        />
        {errors.filialName && (
          <p className="text-sm font-medium text-destructive">
            {errors.filialName.message}
          </p>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone</Label>
          <PhoneInput control={ control } name="cellphone" />
          {errors.cellphone && (
            <p className="text-sm font-medium text-destructive">
              {errors.cellphone.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="gerente">Gerente</Label>
        <SelectEmployee
          control={ control }
          name="managerEmployeeId"
          // currentUser={
          //   selectedFilial.managerEmployee
          //     ? ({
          //       ...selectedFilial.managerEmployee,
          //       documentNumber: "",
          //     } as any)
          //     : null
          // }
          modal={ true }
          excludeRoles={ [ USER_ROLES.MASTER ] }
        />
        {errors.managerEmployeeId && (
          <p className="text-sm font-medium text-destructive">
            {errors.managerEmployeeId.message}
          </p>
        )}
      </div>
    </CardContent>
  );
}
