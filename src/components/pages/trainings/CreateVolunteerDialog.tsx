"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useAuth } from "@/contexts/auth-provider";
import { useAccess } from "@/contexts/access-provider";
import { USER_ROLES } from "@/utils/constants";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { SelectFilial } from "@/components/shared/SelectFilial";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { queryClient } from "@/app/(main)/layout";
import {
  CreateVolunteerFormDataType,
  CreateVolunteerSchema,
} from "@/lib/zod/CreateVolunteerValidation";
import { CreateVolunteer } from "@/services/volunteers.service";
import DocumentInput from "@/components/shared/DocumentInput";
import PhoneInput from "@/components/shared/PhoneInput";

interface CreateVolunteerDialogProps {
  dialogNewVolunteer: boolean;
  setDialogNewVolunteer: (openStatus: boolean) => void;
}

export function CreateVolunteerDialog({
  dialogNewVolunteer,
  setDialogNewVolunteer,
}: CreateVolunteerDialogProps) {
  const { user } = useAuth();
  const { getAccessibleFilialsForCreate } = useAccess();

  const accessibleFilialsObjects =
    user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER
      ? []
      : getAccessibleFilialsForCreate(SYSTEM_MODULES.TRAININGS);

  const accessibleFilialsIds =
    accessibleFilialsObjects.length > 0
      ? accessibleFilialsObjects.map((f) => f.filialId)
      : user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER
        ? undefined
        : [];

  const volunteerForm = useForm<CreateVolunteerFormDataType>({
    resolver: zodResolver(CreateVolunteerSchema),
    defaultValues: {
      filialId: user?.sourceFilialId,
    },
  });

  const {
    reset,
    formState: { errors, isSubmitting },
  } = volunteerForm;

  const onSubmitVolunteer = async (data: CreateVolunteerFormDataType) => {
    const response = await CreateVolunteer(data);

    if (response.statusCode !== 201) {
      toast.warning(response.message, { style: { fontSize: "1rem" } });
      window.scroll({ top: 0 });
    } else {
      queryClient.invalidateQueries({ queryKey: [ "get-all-volunteers" ] });

      toast.success(response.message, { style: { fontSize: "1rem" } });
      window.scroll({ top: 0 });
      reset();
      setDialogNewVolunteer(false);
    }
  };

  return (
    <Dialog open={ dialogNewVolunteer } onOpenChange={ setDialogNewVolunteer }>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo paciente modelo
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[80%]">
        <form onSubmit={ volunteerForm.handleSubmit(onSubmitVolunteer) }>
          <DialogHeader>
            <DialogTitle>Cadastrar Novo paciente modelo</DialogTitle>
            <DialogDescription>
              Preencha as informações do paciente modelo
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Filial *</Label>
              <SelectFilial
                control={ volunteerForm.control }
                name="filialId"
                accessibleFilials={ accessibleFilialsIds }
                defaultFilial={ user?.sourceFilialId }
              />
              {volunteerForm.formState.errors.filialId && (
                <p className="text-sm text-destructive">
                  {volunteerForm.formState.errors.filialId.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                { ...volunteerForm.register("name") }
                placeholder="Ex: Dr. Carlos Silva"
              />
              {volunteerForm.formState.errors.name && (
                <p className="text-sm text-red-600">
                  {volunteerForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="documentNumber">CPF *</Label>
              <DocumentInput
                isCPF={ true }
                placeholder="Digite o CPF"
                register={ volunteerForm.register("documentNumber") }
              />
              {volunteerForm.formState.errors.documentNumber && (
                <p className="text-sm text-red-600">
                  {volunteerForm.formState.errors.documentNumber.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cellphone">Telefone *</Label>
              <PhoneInput register={ volunteerForm.register("cellphone") } />

              {volunteerForm.formState.errors.cellphone && (
                <p className="text-sm text-red-600">
                  {volunteerForm.formState.errors.cellphone.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={ () => setDialogNewVolunteer(false) }
            >
              Cancelar
            </Button>
            <Button
              disabled={ isSubmitting }
              className="cursor-pointer"
              type="submit"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Cadastrar paciente modelo"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
