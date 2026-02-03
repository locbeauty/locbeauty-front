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
import { Plus } from "lucide-react";
import { useEffect } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { format, parse } from "date-fns";
import DateInput from "@/components/shared/DateInput";
import { useAuth } from "@/contexts/auth-provider";
import { useAccess } from "@/contexts/access-provider";
import { USER_ROLES } from "@/utils/constants";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { SelectFilial } from "@/components/shared/SelectFilial";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { queryClient } from "@/app/(main)/layout";
import DocumentInput from "@/components/shared/DocumentInput";
import PhoneInput from "@/components/shared/PhoneInput";
import {
  CreateCustomerFormSchemaType,
  createCustomerFormSchema,
} from "@/lib/zod/CreateCustomerValidation";
import { CreateCustomer } from "@/services/customers.service";
import { CustomerAddressForm } from "@/components/pages/customers/create/CustomerAddressForm";

interface CreateTraineeDialogProps {
  dialogNovoAluno: boolean;
  setDialogNovoAluno: (openStatus: boolean) => void;
}

export function CreateTraineeDialog({
  dialogNovoAluno,
  setDialogNovoAluno,
}: CreateTraineeDialogProps) {
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

  const customerForm = useForm<CreateCustomerFormSchemaType>({
    resolver: zodResolver(createCustomerFormSchema),
    defaultValues: {
      filialId: user?.sourceFilialId || "",
      isTrainee: true,
      address: {
        zipCode: "",
        buildingNumber: "",
        addressComplement: "",
        stateName: "",
        cityName: "",
        neighborhoodName: "",
        streetName: "",
      },
      instagram: null,
      companyName: null,
      email: null,
      secondaryEmail: null,
      secondaryCellphone: null,
    },
  });

  // --- Helper: Scroll to top on error ---
  const onInvalid = () => {
    const dialogContent = document.getElementById(
      "create-training-dialog-content",
    );
    if (dialogContent) {
      dialogContent.scrollTo({ top: 0, behavior: "smooth" });
    }
    toast.warning("Verifique os campos obrigatórios.", {
      style: { fontSize: "1rem" },
    });
  };

  useEffect(() => {
    if (dialogNovoAluno) {
      customerForm.reset();
    }
  }, [ dialogNovoAluno, customerForm ]);
  const { errors } = customerForm.formState;

  const onSubmitTrainee = async (data: CreateCustomerFormSchemaType) => {
    // Ensure isTrainee is true
    data.isTrainee = true;

    const response = await CreateCustomer(data);

    if (response.statusCode !== 201) {
      toast.warning(response.message, { style: { fontSize: "1rem" } });
      window.scroll({ top: 0 });
    } else {
      // Invalidate both trainees and customers queries to keep data sync
      queryClient.invalidateQueries({ queryKey: [ "get-all-trainees" ] });
      queryClient.invalidateQueries({ queryKey: [ "get-all-customers" ] });

      toast.success("Aluno cadastrado com sucesso!", {
        style: { fontSize: "1rem" },
      });
      window.scroll({ top: 0 });
      customerForm.reset();
      setDialogNovoAluno(false);
    }
  };

  return (
    <Dialog open={ dialogNovoAluno } onOpenChange={ setDialogNovoAluno }>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Aluno
        </Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-[800px] h-[90vh] overflow-y-auto">
        <FormProvider { ...customerForm }>
          <form
            onSubmit={ customerForm.handleSubmit(onSubmitTrainee, onInvalid) }
          >
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Aluno</DialogTitle>
              <DialogDescription>
                Preencha as informações do aluno. Campos marcados com * são
                obrigatórios.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Filial *</Label>
                  <SelectFilial
                    control={ customerForm.control }
                    name="filialId"
                    accessibleFilials={ accessibleFilialsIds }
                    defaultFilial={ user?.sourceFilialId }
                  />
                  {customerForm.formState.errors.filialId && (
                    <p className="text-sm text-destructive">
                      {customerForm.formState.errors.filialId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullname">Nome Completo *</Label>
                  <Input
                    id="fullname"
                    { ...customerForm.register("fullname") }
                    placeholder="Ex: João Pereira"
                    className="placeholder:text-placeholder"
                  />
                  {customerForm.formState.errors.fullname && (
                    <p className="text-sm text-destructive">
                      {customerForm.formState.errors.fullname.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF (ou CNPJ) *</Label>
                  <DocumentInput
                    isCPF={ true }
                    placeholder="000.000.000-00"
                    register={ customerForm.register("cpf") }
                  />
                  {customerForm.formState.errors.cpf && (
                    <p className="text-sm text-destructive">
                      {customerForm.formState.errors.cpf.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ (ou CPF)</Label>
                  <DocumentInput
                    isCPF={ false }
                    placeholder="00.000.000/0000-00"
                    register={ customerForm.register("cnpj") }
                  />
                  {customerForm.formState.errors.cnpj && (
                    <p className="text-sm text-destructive">
                      {customerForm.formState.errors.cnpj.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthdate">Data de Nascimento *</Label>
                  <Controller
                    control={ customerForm.control }
                    name="birthdate"
                    render={ ({ field }) => (
                      <DateInput
                        value={
                          field.value ? format(field.value, "dd/MM/yyyy") : ""
                        }
                        onChange={ (e) => {
                          const val = e.target.value;
                          if (val.length === 10) {
                            const date = parse(val, "dd/MM/yyyy", new Date());
                            if (!isNaN(date.getTime())) {
                              field.onChange(date);
                            } else {
                              field.onChange(null);
                            }
                          } else if (val === "") {
                            field.onChange(null);
                          }
                        } }
                        placeholder="dd/mm/aaaa"
                        className="placeholder:text-placeholder"
                      />
                    ) }
                  />
                  {customerForm.formState.errors.birthdate && (
                    <p className="text-sm text-destructive">
                      {customerForm.formState.errors.birthdate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cellphone">Telefone *</Label>
                  <PhoneInput control={ customerForm.control } name="cellphone" />
                  {customerForm.formState.errors.cellphone && (
                    <p className="text-sm text-destructive">
                      {customerForm.formState.errors.cellphone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Opcional)</Label>
                  <Input
                    id="email"
                    type="email"
                    { ...customerForm.register("email") }
                    placeholder="aluno@email.com"
                    className="placeholder:text-placeholder"
                  />
                  {customerForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {customerForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram (Opcional)</Label>
                  <Input
                    id="instagram"
                    { ...customerForm.register("instagram") }
                    placeholder="@usuario"
                    className="placeholder:text-placeholder"
                  />
                </div>
              </div>

              {/* Address Section */}
              <div className="pt-4 mt-2">
                <CustomerAddressForm />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={ () => setDialogNovoAluno(false) }
              >
                Cancelar
              </Button>
              <Button type="submit">Cadastrar Aluno</Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
