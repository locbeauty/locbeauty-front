import { Save } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dispatch, SetStateAction, useEffect } from "react";
import { Gear } from "@/utils/@types/gears";
import { useAuth } from "@/contexts/auth-provider";
import { USER_ROLES } from "@/utils/constants";
import { Controller, FormProvider, useForm } from "react-hook-form";
import {
    updateGearFormSchema,
    UpdateGearFormSchemaType,
} from "@/lib/zod/UpdateGearValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectFilial } from "@/components/shared/SelectFilial";
import { TransferableCheckbox } from "../shared/canBeTransferredCheckbox";
import { AmountControlButton } from "@/components/shared/AmountControlButton";
import { fetchWithToken } from "@/utils/fetchWithToken";
import { toast } from "sonner";

interface UpdateGearDialogProps {
  isUpdateGearDialogOpen: boolean;
  setIsUpdateGearDialogOpen: Dispatch<SetStateAction<boolean>>;
  selectedGear: Gear | null;
  setSelectedGear: Dispatch<SetStateAction<Gear | null>>;
  setGears: Dispatch<SetStateAction<Gear[] | null>>;
}

export function UpdateGearDialog({
    isUpdateGearDialogOpen,
    setIsUpdateGearDialogOpen,
    selectedGear,
    setSelectedGear,
    setGears,
}: UpdateGearDialogProps) {
    const { user } = useAuth();

    const updateGearMethods = useForm<UpdateGearFormSchemaType>({
        resolver: zodResolver(updateGearFormSchema),
    });

    const {
        control,
        register,
        handleSubmit,
        setValue,
        watch,
        trigger,
        reset,
        formState: { errors, isDirty },
    } = updateGearMethods;

    useEffect(() => {
        if (selectedGear) {
            reset({
                transferable: selectedGear?.transferable,
                sourceFilialId: selectedGear?.SourceFilial.filialId,
                // acquisitionDate: new Date(selectedGear.acquisitionDate),
                availableUnits: selectedGear?.availableUnits,
                gearName: selectedGear?.gearName,
                outOfServiceUnits: selectedGear?.outOfServiceUnits,
                totalUnits: selectedGear?.totalUnits,
            });
        }
    }, [ selectedGear, reset ]);

    const handleSaveGear = async (targetGearData: UpdateGearFormSchemaType) => {
        try {
            const response = await fetchWithToken(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/gears/update?gearId=${selectedGear?.gearId}`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(targetGearData),
                }
            );
            const data = await response.json();

            if (!response.ok) {
                toast.warning(data.message, { style: { fontSize: "1rem" } });
            } else {
                toast.success("Equipamento atualizado com sucesso!", {
                    style: { fontSize: "1rem" },
                });

                reset();
                setIsUpdateGearDialogOpen(false);
            }
        } catch {
            toast.error("Erro ao atualizar equipamento.");
        }
    };

    return (
        <Dialog
            open={ isUpdateGearDialogOpen }
            onOpenChange={ setIsUpdateGearDialogOpen }
        >
            <DialogContent
                className="sm:max-w-[600px]"
                aria-describedby={ undefined }
                onOpenAutoFocus={ (e) => e.preventDefault() }
            >
                <DialogHeader>
                    <DialogTitle>Editar Equipamento</DialogTitle>
                </DialogHeader>

                {selectedGear && (
                    <form
                        onSubmit={ handleSubmit(handleSaveGear) }
                        className="grid gap-6 py-4"
                    >
                        <div className="grid grid-cols-1 gap-3">
                            <Label>Nome</Label>
                            <Input { ...register("gearName") } />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid grid-cols-1 gap-3">
                                {user?.role === USER_ROLES.GERENTE && (
                                    <div className="space-y-2">
                                        <Label>Filial</Label>
                                        <FormProvider { ...updateGearMethods }>
                                            <SelectFilial<UpdateGearFormSchemaType>
                                                control={ control }
                                                name="sourceFilialId"
                                            />
                                        </FormProvider>
                                        {errors.sourceFilialId && (
                                            <p className="text-sm text-destructive mt-2">
                                                {errors.sourceFilialId.message}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* <div className="flex flex-col gap-6 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="acquisitionDate">Data de aquisição</Label>
                                    <Controller
                                        control={ control }
                                        name="acquisitionDate"
                                        render={ ({ field }) => (
                                            <DatePicker
                                                placeholder="Selecione a data de aquisição"
                                                value={ field.value }
                                                onChange={ (date) => {
                                                    setValue("acquisitionDate", date!);
                                                    trigger("acquisitionDate");
                                                } }
                                                classNames={ {
                                                    trigger:
                                                  errors.acquisitionDate &&
                                                  "border-destructive focus-visible:ring-destructive",
                                                } }
                                            />
                                        ) }
                                    />
                                    {errors.acquisitionDate && (
                                        <p className="text-sm text-destructive">
                                            {errors.acquisitionDate.message}
                                        </p>
                                    )}
                                </div>
                            </div> */}
                            <div>
                                <TransferableCheckbox
                                    control={ control }
                                    errors={ errors }
                                    name="transferable"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 max-w-[90%] md:max-w-[40%]">
                            <div className="space-y-2 flex-1 mt-4">
                                <Label htmlFor="totalUnits">Estoque</Label>
                                <Controller
                                    control={ control }
                                    name="totalUnits"
                                    render={ ({ field }) => (
                                        <AmountControlButton
                                            value={ field.value || 0 }
                                            onChange={ field.onChange }
                                            error={ !!errors.totalUnits }
                                        />
                                    ) }
                                />
                                {errors.totalUnits && (
                                    <p className="text-sm text-destructive mt-2">
                                        {errors.totalUnits.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2 flex-1 mt-4">
                                <Label htmlFor="totalUnits">Unidades disponíveis</Label>
                                <Controller
                                    control={ control }
                                    name="availableUnits"
                                    render={ ({ field }) => (
                                        <AmountControlButton
                                            value={ field.value || 0 }
                                            onChange={ field.onChange }
                                            error={ !!errors.totalUnits }
                                        />
                                    ) }
                                />
                                {errors.availableUnits && (
                                    <p className="text-sm text-destructive mt-2">
                                        {errors.availableUnits.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2 flex-1 mt-4">
                                <Label htmlFor="totalUnits">Unidades defeituosas</Label>
                                <Controller
                                    control={ control }
                                    name="outOfServiceUnits"
                                    render={ ({ field }) => (
                                        <AmountControlButton
                                            value={ field.value || 0 }
                                            onChange={ field.onChange }
                                            error={ !!errors.totalUnits }
                                        />
                                    ) }
                                />
                                {errors.outOfServiceUnits && (
                                    <p className="text-sm text-destructive mt-2">
                                        {errors.outOfServiceUnits.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={ () => setIsUpdateGearDialogOpen(false) }
                            >
                Cancelar
                            </Button>
                            <Button disabled={ !isDirty }>
                                <Save className="mr-2 h-4 w-4" />
                Salvar alterações
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
