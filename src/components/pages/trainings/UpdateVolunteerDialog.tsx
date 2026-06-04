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
} from "@/components/ui/dialog";
import { Loader2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/auth-provider";
import { useAccess } from "@/contexts/access-provider";
import { USER_ROLES } from "@/utils/constants";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { SelectFilial } from "@/components/shared/SelectFilial";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { queryClient } from "@/app/(main)/layout";
import {
  updateVolunteerSchema,
  UpdateVolunteerFormDataType,
} from "@/lib/zod/UpdateVolunteerValidation";
import { UpdateVolunteer } from "@/services/volunteers.service";
import DocumentInput from "@/components/shared/DocumentInput";
import PhoneInput from "@/components/shared/PhoneInput";
import { useEffect } from "react";
import { Volunteer } from "@/utils/@types/volunteer";

interface UpdateVolunteerDialogProps {
  isOpen: boolean;
  setIsOpen: (openStatus: boolean) => void;
  selectedVolunteer: Volunteer | null;
}

export function UpdateVolunteerDialog({
  isOpen,
  setIsOpen,
  selectedVolunteer,
}: UpdateVolunteerDialogProps) {
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

  const volunteerForm = useForm<UpdateVolunteerFormDataType>({
    resolver: zodResolver(updateVolunteerSchema),
  });

  const {
    reset,
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = volunteerForm;

  // Preenche o formulário com os dados do paciente modelo ao abrir
  useEffect(() => {
    if (isOpen && selectedVolunteer) {
      reset({
        name: selectedVolunteer.name,
        documentNumber: selectedVolunteer.documentNumber,
        cellphone: selectedVolunteer.cellphone,
        filialId: selectedVolunteer.sourceFilialId,
      });
    }
  }, [ isOpen, selectedVolunteer, reset ]);

  const onSubmit = async (data: UpdateVolunteerFormDataType) => {
    if (!selectedVolunteer) return;

    const response = await UpdateVolunteer({
      volunteerId: selectedVolunteer.volunteerId,
      body: data,
    });

    if (response.statusCode === 200 || response.statusCode === 201) {
      queryClient.invalidateQueries({ queryKey: [ "get-all-volunteers" ] });
      toast.success("Paciente modelo atualizado com sucesso.", {
        style: { fontSize: "1rem" },
      });
      setIsOpen(false);
    } else {
      toast.warning(
        response.message || "Erro ao atualizar paciente modelo.",
        { style: { fontSize: "1rem" } },
      );
    }
  };

  return (
    <Dialog open={ isOpen } onOpenChange={ setIsOpen }>
      <DialogContent className="w-[80%]">
        <form onSubmit={ handleSubmit(onSubmit) }>
          <DialogHeader>
            <DialogTitle>Editar paciente modelo</DialogTitle>
            <DialogDescription>
              Atualize as informações do paciente modelo
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Filial *</Label>
              <SelectFilial
                control={ control }
                name="filialId"
                accessibleFilials={ accessibleFilialsIds }
                defaultFilial={ selectedVolunteer?.sourceFilialId }
              />
              {errors.filialId && (
                <p className="text-sm text-destructive">
                  {errors.filialId.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                { ...register("name") }
                placeholder="Ex: João Pereira"
                className="placeholder:text-placeholder"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="documentNumber">CPF *</Label>
              <DocumentInput
                isCPF={ true }
                placeholder="Digite o CPF"
                register={ register("documentNumber") }
              />
              {errors.documentNumber && (
                <p className="text-sm text-red-600">
                  {errors.documentNumber.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cellphone">Telefone *</Label>
              <PhoneInput control={ control } name="cellphone" />
              {errors.cellphone && (
                <p className="text-sm text-red-600">
                  {errors.cellphone.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={ () => setIsOpen(false) }
            >
              Cancelar
            </Button>
            <Button
              disabled={ isSubmitting }
              className="cursor-pointer"
              type="submit"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
