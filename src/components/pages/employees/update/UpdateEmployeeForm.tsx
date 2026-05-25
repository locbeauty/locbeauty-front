import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Employee } from "@/utils/@types/employee";
import {
  createEmployeeFormSchema,
  CreateEmployeeFormSchemaType,
} from "@/lib/zod/CreateEmployeeValidation";
import { EmployeeForm } from "../forms/EmployeeForm";
import { UpdateEmployeeDialog } from "./UpdateEmployeeDialog";
import { AccessControlDialog } from "../view/AccessControlDialog";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { USER_ROLES } from "@/utils/constants";

interface UpdateEmployeeFormProps {
  selectedEmployee: Employee;
}

export function UpdateEmployeeForm({
  selectedEmployee,
}: UpdateEmployeeFormProps) {
  const { user } = useAuth();
  return (
    <>
      <EmployeeForm
        isEditing={ true }
        currentUsername={ selectedEmployee.username }
      />

      {(user?.role === USER_ROLES.GERENTE ||
        user?.role === USER_ROLES.MASTER) && (
        <>
          <Separator className="my-6" />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Controle de Acessos</h3>
            <p className="text-sm text-muted-foreground">
              Gerencie as permissões de acesso deste funcionário por filial. As
              alterações são salvas automaticamente.
            </p>
            <AccessControlDialog employee={ selectedEmployee } />
          </div>
        </>
      )}
    </>
  );
}
