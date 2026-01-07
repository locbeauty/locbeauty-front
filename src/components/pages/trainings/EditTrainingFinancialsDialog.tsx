import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import PriceInput from "@/components/shared/PriceInput";
import { Training } from "@/utils/@types/training";
import { UpdateTraining } from "@/services/trainings.service";
import { Loader2 } from "lucide-react";
import { UpdateTrainingPayload } from "./TrainingPaymentMethodDialog";
import { centsToString } from "@/utils/centsToString";
import { PaymentModes, PaymentStatuses } from "@/utils/constants";
import { toast } from "sonner";

const formSchema = z.object({
    basePrice: z.number().min(0),
    totalPrice: z.number().min(0),
    additionalCost: z.number().min(0),
    additionalCostDescription: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditTrainingFinancialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  training: Training;
  payerType: "TRAINEE" | "VOLUNTEER";
  onSuccess: (updatedTraining: Training) => void;
  onFinancialUpdate?: (values: {
    basePrice: number;
    additionalCost: number;
    additionalCostDescription: string;
    totalPrice: number;
  }) => void;
  currentValues?: {
    basePrice: number;
    additionalCost: number;
    additionalCostDescription: string;
    totalPrice: number;
  };
}

const parseCurrencyToCents = (val: string) => {
    const clean = val.replace(/\D/g, "");
    return parseInt(clean || "0", 10);
};

export default function EditTrainingFinancialsDialog({
    open,
    onOpenChange,
    training,
    payerType,
    onSuccess,
    onFinancialUpdate,
    currentValues,
}: EditTrainingFinancialsDialogProps) {
    // Find the relevant payment record
    const paymentRecord = training.TrainingPayment.find(
        (p) => p.payerType === payerType
    );

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            basePrice: 0,
            totalPrice: 0,
            additionalCost: 0,
            additionalCostDescription: "",
        },
    });

    // Reset form when opening or changing training/payerType
    useEffect(() => {
        if (open) {
            if (currentValues) {
                form.reset({
                    basePrice: currentValues.basePrice,
                    totalPrice: currentValues.totalPrice,
                    additionalCost: currentValues.additionalCost,
                    additionalCostDescription: currentValues.additionalCostDescription,
                });
            } else if (paymentRecord) {
                form.reset({
                    basePrice: paymentRecord.basePrice,
                    totalPrice: paymentRecord.totalPrice,
                    additionalCost: paymentRecord.additionalCost || 0,
                    additionalCostDescription:
            paymentRecord.additionalCostDescription || "",
                });
            }
        }
    }, [ open, paymentRecord, form, payerType, currentValues ]);

    // Helper to calculate total price dynamically for Trainee
    const basePrice = form.watch("basePrice");
    const additionalCost = form.watch("additionalCost");

    useEffect(() => {
        if (payerType === "TRAINEE") {
            const calculatedTotal = (basePrice || 0) + (additionalCost || 0);
            form.setValue("totalPrice", calculatedTotal);
        }
    }, [ basePrice, additionalCost, payerType, form ]);

    const onSubmit = async (values: FormValues) => {
        try {
            if (!paymentRecord) {
                console.error("No payment record found");
                return;
            }

            const payload: UpdateTrainingPayload = {
                trainingStatus: training.trainingStatus,
                payerType: payerType,
                isCourtesy: paymentRecord.isCourtesy,
                wasRefunded: paymentRecord.wasRefunded,
                cancellationFee: paymentRecord.cancellationFee ?? undefined,
                TrainingPayment: {
                    // Fields we are editing
                    basePrice: values.basePrice,
                    totalPrice: values.totalPrice,
                    additionalCost: values.additionalCost,
                    additionalCostDescription: values.additionalCostDescription || "",

                    // Fields we must preserve
                    paymentStatus:
            (paymentRecord.paymentStatus as PaymentStatuses) || "Pendente",
                    paymentMode: (paymentRecord.paymentMode as PaymentModes) || "AVista",

                    firstPaymentAmount: paymentRecord.firstPaymentAmount || 0,
                    firstPaymentDate: paymentRecord.firstPaymentDate
                        ? new Date(paymentRecord.firstPaymentDate)
                        : null,
                    firstPaymentMethod: paymentRecord.firstPaymentMethod,
                    firstPaymentStatus: paymentRecord.firstPaymentStatus,

                    secondPaymentAmount: paymentRecord.secondPaymentAmount || 0,
                    secondPaymentDate: paymentRecord.secondPaymentDate
                        ? new Date(paymentRecord.secondPaymentDate)
                        : null,
                    secondPaymentMethod: paymentRecord.secondPaymentMethod,
                    secondPaymentStatus: paymentRecord.secondPaymentStatus,
                },
            };

            const response = await UpdateTraining({
                trainingId: training.trainingId,
                body: payload,
            });

            if (response.data) {
                toast.success("Valores atualizados com sucesso.");
                onSuccess(response.data);

                // Call the new callback to update parent state immediately
                if (onFinancialUpdate) {
                    onFinancialUpdate({
                        basePrice: values.basePrice,
                        additionalCost: values.additionalCost,
                        additionalCostDescription: values.additionalCostDescription || "",
                        totalPrice: values.totalPrice,
                    });
                }

                onOpenChange(false);
            } else {
                throw new Error("Falha ao atualizar");
            }
        } catch (error) {
            console.error(error);
            toast.error("Falha ao atualizar valores.");
        }
    };

    const isSubmitting = form.formState.isSubmitting;

    return (
        <Dialog open={ open } onOpenChange={ onOpenChange }>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
            Editar Valores ({payerType === "TRAINEE" ? "Aluno" : "Modelo"})
                    </DialogTitle>
                </DialogHeader>

                <Form { ...form }>
                    <form onSubmit={ form.handleSubmit(onSubmit) } className="space-y-4">
                        {/* Fields for Trainee */}
                        {payerType === "TRAINEE" && (
                            <>
                                <FormField
                                    control={ form.control }
                                    name="basePrice"
                                    render={ ({ field }) => (
                                        <FormItem>
                                            <FormLabel>Preço Base</FormLabel>
                                            <FormControl>
                                                <PriceInput
                                                    { ...field }
                                                    value={ centsToString(field.value ?? 0) }
                                                    onChange={ (val) =>
                                                        field.onChange(parseCurrencyToCents(val))
                                                    }
                                                    withLabel={ false }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    ) }
                                />

                                <FormField
                                    control={ form.control }
                                    name="additionalCost"
                                    render={ ({ field }) => (
                                        <FormItem>
                                            <FormLabel>Custos Adicionais</FormLabel>
                                            <FormControl>
                                                <PriceInput
                                                    { ...field }
                                                    value={ centsToString(field.value ?? 0) }
                                                    onChange={ (val) =>
                                                        field.onChange(parseCurrencyToCents(val))
                                                    }
                                                    withLabel={ false }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    ) }
                                />

                                <FormField
                                    control={ form.control }
                                    name="additionalCostDescription"
                                    render={ ({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descrição dos Custos (Opcional)</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Ex: Material extra, deslocamento..."
                                                    className="resize-none"
                                                    { ...field }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    ) }
                                />

                                <div className="pt-2 border-t mt-4">
                                    <div className="flex justify-between items-center font-bold">
                                        <span>Total Calculado:</span>
                                        <span>
                                            {new Intl.NumberFormat("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                            }).format(form.watch("totalPrice") / 100)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                    (Preço Base + Custos Adicionais)
                                    </p>
                                </div>
                            </>
                        )}

                        {/* Fields for Volunteer */}
                        {payerType === "VOLUNTEER" && (
                            <FormField
                                control={ form.control }
                                name="totalPrice"
                                render={ ({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valor Total</FormLabel>
                                        <FormControl>
                                            <PriceInput
                                                { ...field }
                                                value={ centsToString(field.value ?? 0) }
                                                onChange={ (val) =>
                                                    field.onChange(parseCurrencyToCents(val))
                                                }
                                                withLabel={ false }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                ) }
                            />
                        )}

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={ () => onOpenChange(false) }
                            >
                Cancelar
                            </Button>
                            <Button type="submit" disabled={ isSubmitting }>
                                {isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                Salvar Alterações
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
