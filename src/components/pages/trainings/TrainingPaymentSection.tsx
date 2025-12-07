// import { useEffect, useMemo } from "react";
// import { useFormContext } from "react-hook-form";
// import {
//     CheckCircle,
//     CalendarIcon,
//     CreditCard,
//     Banknote,
//     QrCode,
//     AlertCircle
// } from "lucide-react";
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//     FormControl,
//     FormField,
//     FormItem,
//     FormMessage,
// } from "@/components/ui/form";
// import PriceInput from "@/components/shared/PriceInput";
// import { CreateTrainingDataType } from "@/lib/zod/CreateTrainingValidation";

// // --- Helpers ---
// const paymentStatuses = [ "Pendente", "Pago", "Parcial" ] as const;
// const paymentMethods = [ "Pix", "Dinheiro", "Cartão de Crédito", "Cartão de Débito" ];

// const getStatusColor = (status: string) => {
//     switch (status) {
//     case "Pago": return "bg-green-500";
//     case "Parcial": return "bg-orange-500";
//     default: return "bg-gray-300";
//     }
// };

// const getPaymentIcon = (method: string) => {
//     switch (method) {
//     case "Pix": return <QrCode className="w-4 h-4" />;
//     case "Dinheiro": return <Banknote className="w-4 h-4" />;
//     case "Cartão de Crédito":
//     case "Cartão de Débito": return <CreditCard className="w-4 h-4" />;
//     default: return <Banknote className="w-4 h-4" />;
//     }
// };

// const parseCurrencyToFloat = (value: string | number | null | undefined): number => {
//     if (!value) return 0;
//     if (typeof value === "number") return value;
//     const cleanString = value.replace(/[^\d,]/g, "").replace(",", ".");
//     return parseFloat(cleanString) || 0;
// };

// // Formata float para "1.000,00" (formato que o input costuma esperar)
// const formatToDecimalString = (value: number) => {
//     return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// };

// const formatBRL = (value: number) =>
//     new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

// // --- Componente ---

// export function TrainingPaymentSection({ prefix }: {prefix: "traineePayment" | "volunteerPayment"}) {
//     const { control, watch, setValue, formState: { errors } } = useFormContext<CreateTrainingDataType>();

//     // Observando valores
//     const price = watch("price");
//     const additionalCost = watch("additionalCost");
//     const paymentStatus = watch("paymentInfo.paymentStatus");

//     // Observamos o firstPaymentAmount para calcular o restante no caso "Parcial"
//     const firstPaymentAmount = watch("paymentInfo.firstPaymentAmount");

//     // 1. Calcula o total em tempo real (Memoizado)
//     const totalValue = useMemo(() => {
//         return parseCurrencyToFloat(price) + parseCurrencyToFloat(additionalCost);
//     }, [ price, additionalCost ]);

//     // 2. Efeito Unificado para Atualização de Valores
//     useEffect(() => {
//         if (paymentStatus === "Pago") {
//         // CASO 1: PAGO
//         // Se estiver "Pago", o valor da 1ª parcela DEVE ser igual ao total.
//         // Isso roda sempre que o totalValue mudar.
//             if (totalValue > 0) {
//                 setValue("paymentInfo.firstPaymentAmount", formatToDecimalString(totalValue) as any);
//                 // Limpa segunda parcela
//                 setValue("paymentInfo.secondPaymentAmount", undefined);
//             }
//         } else if (paymentStatus === "Parcial") {
//         // CASO 2: PARCIAL
//         // Se estiver "Parcial", calculamos o restante baseados no que foi digitado na 1ª parcela.
//             const firstAmountFloat = parseCurrencyToFloat(firstPaymentAmount);
//             const remainder = totalValue - firstAmountFloat;

//             // Evita números negativos visualmente
//             const safeRemainder = remainder > 0 ? remainder : 0;

//             setValue("paymentInfo.secondPaymentAmount", formatToDecimalString(safeRemainder) as any);
//         }
//     }, [ paymentStatus, totalValue, firstPaymentAmount, setValue ]);

//     return (
//         <div className="space-y-6 pt-2">
//             {/* Header com Status e Total */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                     <Label className="text-sm font-medium flex items-center gap-2">
//                         <CheckCircle className="h-4 w-4 text-muted-foreground" />
//             Status do Pagamento
//                     </Label>

//                     <FormField
//                         control={ control }
//                         name="paymentInfo.paymentStatus"
//                         render={ ({ field }) => (
//                             <FormItem>
//                                 <Select onValueChange={ field.onChange } defaultValue={ field.value }>
//                                     <FormControl>
//                                         <SelectTrigger className={ errors.paymentInfo?.paymentStatus ? "border-red-500" : "" }>
//                                             <SelectValue placeholder="Selecione..." />
//                                         </SelectTrigger>
//                                     </FormControl>
//                                     <SelectContent>
//                                         {paymentStatuses.map((status) => (
//                                             <SelectItem key={ status } value={ status }>
//                                                 <div className="flex items-center gap-2">
//                                                     <div className={ `w-2 h-2 rounded-full ${getStatusColor(status)}` } />
//                                                     {status}
//                                                 </div>
//                                             </SelectItem>
//                                         ))}
//                                     </SelectContent>
//                                 </Select>
//                                 <FormMessage />
//                             </FormItem>
//                         ) }
//                     />
//                 </div>
//             </div>

//             {/* Inputs de Pagamento */}
//             {paymentStatus && paymentStatus !== "Pendente" && (
//                 <div className="bg-muted/30 p-4 rounded-lg border space-y-6 animate-in fade-in slide-in-from-top-2">

//                     {/* --- PRIMEIRA PARCELA / ENTRADA --- */}
//                     <div className="space-y-3">
//                         <div className="flex items-center justify-between">
//                             <Label className="text-sm font-bold flex items-center gap-2 text-primary">
//                                 <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs">1</div>
//                                 {paymentStatus === "Parcial" ? "Entrada / Primeira Parcela" : "Pagamento Integral"}
//                             </Label>
//                         </div>

//                         <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
//                             <div className="sm:col-span-4">
//                                 <FormField
//                                     control={ control }
//                                     name="paymentInfo.firstPaymentAmount"
//                                     render={ ({ field }) => (
//                                         <FormItem>
//                                             <Label className="text-xs text-muted-foreground">Valor</Label>
//                                             <FormControl>
//                                                 <PriceInput
//                                                     { ...field }
//                                                     withLabel={ false }
//                                                     value={ field.value ?? "" }
//                                                     // Bloqueamos a edição se for "Pago", pois o useEffect cuida disso
//                                                     // Se quiser permitir edição manual mesmo em "Pago", remova o disabled.
//                                                     disabled={ paymentStatus === "Pago" }
//                                                 />
//                                             </FormControl>
//                                             <FormMessage className="text-xs" />
//                                         </FormItem>
//                                     ) }
//                                 />
//                             </div>

//                             <div className="sm:col-span-4">
//                                 <FormField
//                                     control={ control }
//                                     name="paymentInfo.firstPaymentDate"
//                                     render={ ({ field }) => (
//                                         <FormItem>
//                                             <Label className="text-xs text-muted-foreground flex items-center gap-1">
//                                                 <CalendarIcon className="w-3 h-3" /> Data do Pagamento
//                                             </Label>
//                                             <FormControl>
//                                                 <Input
//                                                     type="date"
//                                                     { ...field }
//                                                     value={ field.value ? new Date(field.value).toISOString().split("T")[0] : "" }
//                                                 />
//                                             </FormControl>
//                                             <FormMessage className="text-xs" />
//                                         </FormItem>
//                                     ) }
//                                 />
//                             </div>

//                             <div className="sm:col-span-4">
//                                 <FormField
//                                     control={ control }
//                                     name="paymentInfo.firstPaymentMethod"
//                                     render={ ({ field }) => (
//                                         <FormItem>
//                                             <Label className="text-xs text-muted-foreground">Forma de Pagamento</Label>
//                                             <Select onValueChange={ field.onChange } value={ field.value }>
//                                                 <FormControl>
//                                                     <SelectTrigger>
//                                                         <SelectValue placeholder="Selecione..." />
//                                                     </SelectTrigger>
//                                                 </FormControl>
//                                                 <SelectContent>
//                                                     {paymentMethods.map((method) => (
//                                                         <SelectItem key={ method } value={ method }>
//                                                             <div className="flex items-center gap-2">
//                                                                 {getPaymentIcon(method)}
//                                                                 <span>{method}</span>
//                                                             </div>
//                                                         </SelectItem>
//                                                     ))}
//                                                 </SelectContent>
//                                             </Select>
//                                             <FormMessage className="text-xs" />
//                                         </FormItem>
//                                     ) }
//                                 />
//                             </div>
//                         </div>
//                     </div>

//                     {/* --- SEGUNDA PARCELA (Apenas Parcial) --- */}
//                     {paymentStatus === "Parcial" && (
//                         <>
//                             <div className="h-px bg-border border-dashed" />
//                             <div className="space-y-3 opacity-90">
//                                 <div className="flex items-center justify-between">
//                                     <Label className="text-sm font-bold flex items-center gap-2 text-orange-600">
//                                         <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-xs">2</div>
//                     Segunda Parcela / Restante
//                                     </Label>
//                                 </div>

//                                 <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
//                                     <div className="sm:col-span-4">
//                                         <FormField
//                                             control={ control }
//                                             name="paymentInfo.secondPaymentAmount"
//                                             render={ ({ field }) => (
//                                                 <FormItem>
//                                                     <Label className="text-xs text-muted-foreground">Valor Restante</Label>
//                                                     <FormControl>
//                                                         <PriceInput
//                                                             { ...field }
//                                                             withLabel={ false }
//                                                             disabled={ true }
//                                                             value={ field.value ?? "" }
//                                                         />
//                                                     </FormControl>
//                                                     <FormMessage className="text-xs" />
//                                                 </FormItem>
//                                             ) }
//                                         />
//                                     </div>

//                                     <div className="sm:col-span-4">
//                                         <FormField
//                                             control={ control }
//                                             name="paymentInfo.secondPaymentDate"
//                                             render={ ({ field }) => (
//                                                 <FormItem>
//                                                     <Label className="text-xs text-muted-foreground flex items-center gap-1">
//                                                         <CalendarIcon className="w-3 h-3" /> Data Prevista
//                                                     </Label>
//                                                     <FormControl>
//                                                         <Input
//                                                             type="date"
//                                                             { ...field }
//                                                             value={ field.value ? new Date(field.value).toISOString().split("T")[0] : "" }
//                                                         />
//                                                     </FormControl>
//                                                     <FormMessage className="text-xs" />
//                                                 </FormItem>
//                                             ) }
//                                         />
//                                     </div>

//                                     <div className="sm:col-span-4">
//                                         <FormField
//                                             control={ control }
//                                             name="paymentInfo.secondPaymentMethod"
//                                             render={ ({ field }) => (
//                                                 <FormItem>
//                                                     <Label className="text-xs text-muted-foreground">Forma Prevista</Label>
//                                                     <Select onValueChange={ field.onChange } value={ field.value }>
//                                                         <FormControl>
//                                                             <SelectTrigger>
//                                                                 <SelectValue placeholder="Selecione..." />
//                                                             </SelectTrigger>
//                                                         </FormControl>
//                                                         <SelectContent>
//                                                             {paymentMethods.map((method) => (
//                                                                 <SelectItem key={ method } value={ method }>
//                                                                     <div className="flex items-center gap-2">
//                                                                         {getPaymentIcon(method)}
//                                                                         <span>{method}</span>
//                                                                     </div>
//                                                                 </SelectItem>
//                                                             ))}
//                                                         </SelectContent>
//                                                     </Select>
//                                                     <FormMessage className="text-xs" />
//                                                 </FormItem>
//                                             ) }
//                                         />
//                                     </div>
//                                 </div>
//                             </div>
//                         </>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// }

"use client";

import { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import {
    CheckCircle,
    CalendarIcon,
    CreditCard,
    Banknote,
    QrCode,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import PriceInput from "@/components/shared/PriceInput";

// --- Helpers de Formatação e Parsing ---

const paymentStatuses = [ "Pendente", "Pago", "Parcial" ] as const;
const paymentMethods = [ "PIX", "Dinheiro", "Credito", "Debito" ];

const getStatusColor = (status: string) => {
    switch (status) {
    case "Pago": return "bg-green-500";
    case "Parcial": return "bg-orange-500";
    default: return "bg-gray-300";
    }
};

const getPaymentIcon = (method: string) => {
    switch (method) {
    case "Pix": return <QrCode className="w-4 h-4" />;
    case "Dinheiro": return <Banknote className="w-4 h-4" />;
    case "Cartão de Crédito":
    case "Cartão de Débito": return <CreditCard className="w-4 h-4" />;
    default: return <Banknote className="w-4 h-4" />;
    }
};

const parseCurrencyToFloat = (value: string | number | null | undefined): number => {
    if (!value) return 0;
    if (typeof value === "number") return value;
    // Remove tudo que não é dígito ou vírgula, depois troca vírgula por ponto
    const cleanString = value.replace(/[^\d,]/g, "").replace(",", ".");
    return parseFloat(cleanString) || 0;
};

const formatToDecimalString = (value: number) => {
    return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// --- Componente Principal ---

interface TrainingPaymentSectionProps {
    prefix: "traineePayment" | "volunteerPayment";
}

export function TrainingPaymentSection({ prefix }: TrainingPaymentSectionProps) {
    // Usamos 'any' no generic aqui para permitir flexibilidade com os caminhos dinâmicos
    const { control, watch, setValue, formState: { errors } } = useFormContext<any>();

    // --- Construção dinâmica dos caminhos ---
    const pricePath = `${prefix}.price`;
    const additionalCostPath = `${prefix}.additionalCost`; // Só existirá valor se for traineePayment
    const paymentStatusPath = `${prefix}.paymentInfo.paymentStatus`;
    const firstPaymentAmountPath = `${prefix}.paymentInfo.firstPaymentAmount`;
    const secondPaymentAmountPath = `${prefix}.paymentInfo.secondPaymentAmount`;

    // --- Watchers ---
    const price = watch(pricePath);
    const additionalCost = watch(additionalCostPath);
    const paymentStatus = watch(paymentStatusPath);
    const firstPaymentAmount = watch(firstPaymentAmountPath);

    // --- Cálculo do Total (Memoizado) ---
    // Soma o Preço Base + Custo Adicional (se houver nesta seção)
    const totalValue = useMemo(() => {
        return parseCurrencyToFloat(price) + parseCurrencyToFloat(additionalCost);
    }, [ price, additionalCost ]);

    // --- Efeito: Atualização Automática de Valores ---
    useEffect(() => {
        if (paymentStatus === "Pago") {
            // CASO 1: PAGO TOTAL
            // Se o total for maior que zero, preenchemos a primeira parcela com tudo
            if (totalValue > 0) {
                setValue(firstPaymentAmountPath, formatToDecimalString(totalValue));
                setValue(secondPaymentAmountPath, undefined); // Limpa segunda parcela
            }
        } else if (paymentStatus === "Parcial") {
            // CASO 2: PARCIAL
            // Calcula o restante: Total - Valor digitado na 1ª parcela
            const firstAmountFloat = parseCurrencyToFloat(firstPaymentAmount);
            const remainder = totalValue - firstAmountFloat;

            // Garante que não fique negativo visualmente
            const safeRemainder = remainder > 0 ? remainder : 0;

            setValue(secondPaymentAmountPath, formatToDecimalString(safeRemainder));
        }
    }, [ paymentStatus, totalValue, firstPaymentAmount, setValue, firstPaymentAmountPath, secondPaymentAmountPath ]);

    // Helper para verificar erro no select de status
    // Acessa errors['traineePayment']['paymentInfo']['paymentStatus'] de forma segura
    const statusError = (errors?.[prefix] as any)?.paymentInfo?.paymentStatus;

    return (
        <div className="space-y-6 pt-2">
            {/* Cabeçalho: Status do Pagamento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        Status do Pagamento
                    </Label>

                    <FormField
                        control={ control }
                        name={ paymentStatusPath }
                        render={ ({ field }) => (
                            <FormItem>
                                <Select onValueChange={ field.onChange } value={ field.value || "Pendente" }>
                                    <FormControl>
                                        <SelectTrigger className={ statusError ? "border-red-500" : "" }>
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {paymentStatuses.map((status) => (
                                            <SelectItem key={ status } value={ status }>
                                                <div className="flex items-center gap-2">
                                                    <div className={ `w-2 h-2 rounded-full ${getStatusColor(status)}` } />
                                                    {status}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        ) }
                    />
                </div>
            </div>

            {/* Inputs Detalhados (Aparecem se não for Pendente) */}
            {paymentStatus && paymentStatus !== "Pendente" && (
                <div className="bg-muted/30 p-4 rounded-lg border space-y-6 animate-in fade-in slide-in-from-top-2">

                    {/* --- 1ª PARCELA / ENTRADA --- */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-bold flex items-center gap-2 text-primary">
                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs">1</div>
                                {paymentStatus === "Parcial" ? "Entrada / Primeira Parcela" : "Valor Total"}
                            </Label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                            <div className="sm:col-span-4">
                                <FormField
                                    control={ control }
                                    name={ `${prefix}.paymentInfo.firstPaymentAmount` }
                                    render={ ({ field }) => (
                                        <FormItem>
                                            <Label className="text-xs text-muted-foreground">Valor</Label>
                                            <FormControl>
                                                <PriceInput
                                                    { ...field }
                                                    withLabel={ false }
                                                    value={ field.value ?? "" }
                                                    // Desabilita edição se estiver "Pago" (pois o useEffect fixa o valor total)
                                                    disabled={ paymentStatus === "Pago" }
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    ) }
                                />
                            </div>

                            <div className="sm:col-span-4">
                                <FormField
                                    control={ control }
                                    name={ `${prefix}.paymentInfo.firstPaymentDate` }
                                    render={ ({ field }) => (
                                        <FormItem>
                                            <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                                <CalendarIcon className="w-3 h-3" /> Data do Pagamento
                                            </Label>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    { ...field }
                                                    value={ field.value ? new Date(field.value).toISOString().split("T")[0] : "" }
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    ) }
                                />
                            </div>

                            <div className="sm:col-span-4">
                                <FormField
                                    control={ control }
                                    name={ `${prefix}.paymentInfo.firstPaymentMethod` }
                                    render={ ({ field }) => (
                                        <FormItem>
                                            <Label className="text-xs text-muted-foreground">Forma de Pagamento</Label>
                                            <Select onValueChange={ field.onChange } value={ field.value }>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {paymentMethods.map((method) => (
                                                        <SelectItem key={ method } value={ method }>
                                                            <div className="flex items-center gap-2">
                                                                {getPaymentIcon(method)}
                                                                <span>{method}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    ) }
                                />
                            </div>
                        </div>
                    </div>

                    {/* --- 2ª PARCELA / RESTANTE (Apenas Parcial) --- */}
                    {paymentStatus === "Parcial" && (
                        <>
                            <div className="h-px bg-border border-dashed" />
                            <div className="space-y-3 opacity-90">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-bold flex items-center gap-2 text-orange-600">
                                        <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-xs">2</div>
                                        Segunda Parcela / Restante
                                    </Label>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                    <div className="sm:col-span-4">
                                        <FormField
                                            control={ control }
                                            name={ `${prefix}.paymentInfo.secondPaymentAmount` }
                                            render={ ({ field }) => (
                                                <FormItem>
                                                    <Label className="text-xs text-muted-foreground">Valor Restante</Label>
                                                    <FormControl>
                                                        <PriceInput
                                                            { ...field }
                                                            withLabel={ false }
                                                            disabled={ true } // Sempre calculado automaticamente
                                                            value={ field.value ?? "" }
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            ) }
                                        />
                                    </div>

                                    <div className="sm:col-span-4">
                                        <FormField
                                            control={ control }
                                            name={ `${prefix}.paymentInfo.secondPaymentDate` }
                                            render={ ({ field }) => (
                                                <FormItem>
                                                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <CalendarIcon className="w-3 h-3" /> Data Prevista
                                                    </Label>
                                                    <FormControl>
                                                        <Input
                                                            type="date"
                                                            { ...field }
                                                            value={ field.value ? new Date(field.value).toISOString().split("T")[0] : "" }
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            ) }
                                        />
                                    </div>

                                    <div className="sm:col-span-4">
                                        <FormField
                                            control={ control }
                                            name={ `${prefix}.paymentInfo.secondPaymentMethod` }
                                            render={ ({ field }) => (
                                                <FormItem>
                                                    <Label className="text-xs text-muted-foreground">Forma Prevista</Label>
                                                    <Select onValueChange={ field.onChange } value={ field.value }>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecione..." />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {paymentMethods.map((method) => (
                                                                <SelectItem key={ method } value={ method }>
                                                                    <div className="flex items-center gap-2">
                                                                        {getPaymentIcon(method)}
                                                                        <span>{method}</span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            ) }
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}