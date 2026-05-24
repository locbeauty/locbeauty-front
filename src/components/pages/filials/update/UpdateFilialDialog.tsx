import { Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction, useEffect } from "react";
import { UpdateFilialForm } from "./UpdateFilialForm";
import { Filial } from "@/utils/@types/filials";
import { FormProvider, useForm } from "react-hook-form";
import { fetchWithToken } from "@/utils/fetchWithToken";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  updateFilialFormSchema,
  UpdateFilialFormSchemaType,
} from "@/lib/zod/UpdateFilialValidation";
import { formatPhone } from "@/utils/formatPhone";

interface UpdateFilialDialogProps {
  isUpdateFilialDialogOpen: boolean;
  selectedFilial: Filial;
  setSelectedFilial: Dispatch<SetStateAction<Filial | null>>;
  handleToggleUpdateFilialDialog: (
    _openStatus: boolean,
    _filial: Filial | null,
  ) => void;
  onSuccess?: () => void;
}

export function UpdateFilialDialog({
  isUpdateFilialDialogOpen,
  selectedFilial,
  handleToggleUpdateFilialDialog,
  onSuccess,
}: UpdateFilialDialogProps) {
  const updateFilialMethods = useForm<UpdateFilialFormSchemaType>({
    resolver: zodResolver(updateFilialFormSchema),
  });
  const {
    handleSubmit,
    register,
    control,
    reset,
    formState: { errors, isDirty },
  } = updateFilialMethods;

  useEffect(() => {
    if (selectedFilial) {
      reset({
        cellphone: formatPhone(selectedFilial.cellphone),
        filialName: selectedFilial.filialName,
        managerEmployeeId: selectedFilial.managerEmployee?.employeeId,
        zipCode: selectedFilial.zipCode ?? "",
        street: selectedFilial.street ?? "",
        buildingNumber: selectedFilial.buildingNumber ?? "",
        addressComplement: selectedFilial.addressComplement ?? "",
        neighborhood: selectedFilial.neighborhood ?? "",
        city: selectedFilial.city ?? "",
        state: selectedFilial.state ?? "",
      });
    }
  }, [ selectedFilial, reset ]);

  async function handleUpdateFilial(
    updatedFilialData: UpdateFilialFormSchemaType,
  ) {
    const response = await fetchWithToken(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/filials/update/${selectedFilial.filialId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatedFilialData),
      },
    );
    const data = await response.json();

    if (!response.ok) {
      toast.warning(data.message, { style: { fontSize: "1rem" } });
    } else {
      toast.success("Filial atualizada com sucesso!", {
        style: { fontSize: "1rem" },
      });
      handleToggleUpdateFilialDialog(false, null);
      reset();
      if (onSuccess) {
        onSuccess();
      }
    }
  }
  return (
    <Dialog
      open={ isUpdateFilialDialogOpen }
      onOpenChange={ (status) =>
        handleToggleUpdateFilialDialog(status, selectedFilial)
      }
    >
      <DialogContent
        className="max-w-[90%] md:w-[60%] max-h-[90%] overflow-y-scroll flex flex-col gap-0"
        aria-describedby={ undefined }
        onOpenAutoFocus={ (e) => e.preventDefault() }
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-5 ml-5">
            Edite a filial:
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={ handleSubmit(handleUpdateFilial) }
          className="flex flex-col gap-5"
        >
          <FormProvider { ...updateFilialMethods }>
            <div className="space-y-6">
              <UpdateFilialForm selectedFilial={ selectedFilial } />
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={ () =>
                    handleToggleUpdateFilialDialog(false, selectedFilial)
                  }
                >
                  Cancelar
                </Button>
                <Button disabled={ !isDirty }>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar alterações
                </Button>
              </DialogFooter>
            </div>
          </FormProvider>
        </form>
      </DialogContent>
    </Dialog>
  );
}
