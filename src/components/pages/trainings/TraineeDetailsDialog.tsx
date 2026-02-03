"use client";

import { Dispatch, SetStateAction, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Hash,
  Home,
  Calendar,
  Clock,
  CheckCircle2,
  X,
  Filter,
  Building2,
} from "lucide-react";
import { centsToStringWithCurrencyMark } from "@/utils/centsToString";
import { Trainee } from "@/utils/@types/trainee";
import { Training } from "@/utils/@types/training";

export interface TraineeDetailsDialogProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  trainee: Trainee | null;
  allTrainings: Training[];
}

// --- HELPERS ---
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("pt-BR");
};

const getStatusColorClass = (status: string | null | undefined) => {
  switch (status) {
  case "Pago":
    return "text-green-600 bg-green-50 border-green-200";
  case "Parcial":
    return "text-orange-600 bg-orange-50 border-orange-200";
  case "Pendente":
    return "text-red-600 bg-red-50 border-red-200";
  default:
    return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

export function TraineeDetailsDialog({
  isOpen,
  setIsOpen,
  trainee,
  allTrainings,
}: TraineeDetailsDialogProps) {
  const [ filterDate, setFilterDate ] = useState<string>("");
  const [ filterId, setFilterId ] = useState<string>("");

  const trainingsList = useMemo(() => {
    if (!trainee || !allTrainings) return [];
    return allTrainings.filter((t) =>
      t.Trainees?.some((tr) => tr.customerId === trainee.customerId),
    );
  }, [ trainee, allTrainings ]);

  const filteredTrainings = useMemo(() => {
    let result = trainingsList;

    if (filterDate) {
      result = result.filter((training) => {
        if (!training.dueDate) return false;
        const trainingDate = new Date(training.dueDate);
        trainingDate.setHours(0, 0, 0, 0);
        const selectedDate = new Date(filterDate + "T00:00:00");
        selectedDate.setHours(0, 0, 0, 0);
        return trainingDate.getTime() === selectedDate.getTime();
      });
    }

    if (filterId) {
      result = result.filter((training) =>
        training.trainingId.toString().includes(filterId),
      );
    }

    return result;
  }, [ trainingsList, filterDate, filterId ]);

  const clearFilter = () => {
    setFilterDate("");
    setFilterId("");
  };

  if (!trainee) return null;

  return (
    <Dialog open={ isOpen } onOpenChange={ setIsOpen }>
      <DialogContent className="max-h-[90vh] w-[90vw] md:w-[600px] overflow-hidden flex flex-col">
        <DialogHeader className="px-1">
          <DialogTitle className="text-xl">Detalhes do Aluno</DialogTitle>
          <DialogDescription>
            Informações completas do cadastro e histórico.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2 py-4 custom-scrollbar">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{trainee.fullname}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Aluno Ativo
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Dados Pessoais */}
            <div className="space-y-3">
              <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-3 w-3" /> Dados Pessoais
              </h4>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-muted-foreground w-16">
                    CPF:
                  </span>
                  <span>{trainee.cpf || "--"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-muted-foreground w-16">
                    CNPJ:
                  </span>
                  <span>{trainee.cnpj || "--"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-muted-foreground">
                    Filial:
                  </span>
                  <span>
                    {trainee.SourceFilial?.filialName || "Não informada"}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Contato */}
            <div className="space-y-3">
              <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Phone className="h-3 w-3" /> Contato
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-primary/70 shrink-0" />
                  <span className="truncate" title={ trainee.email || "" }>
                    {trainee.email || "--"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-primary/70 shrink-0" />
                  <span>{trainee.cellphone || "--"}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Endereços */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="h-3 w-3" /> Endereços
                </h4>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {trainee.Addresses?.length || 0}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {trainee.Addresses && trainee.Addresses.length > 0 ? (
                  trainee.Addresses.map((addr, index) => (
                    <div
                      key={ index }
                      className="relative flex flex-col gap-1 p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
                    >
                      <div className="absolute top-3 right-3">
                        <Home className="h-4 w-4 text-muted-foreground/30" />
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <div className="flex h-2 w-2 rounded-full bg-primary" />
                        </div>
                        <div className="text-sm">
                          <p className="font-medium leading-none mb-1">
                            {addr.street}, {addr.buildingNumber}
                          </p>
                          {addr.addressComplement && (
                            <p className="text-muted-foreground text-xs mb-1">
                              Comp: {addr.addressComplement}
                            </p>
                          )}
                          <p className="text-muted-foreground">
                            {addr.neighborhood}
                          </p>
                          <p className="text-muted-foreground">
                            {addr.city} - {addr.state}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center border-2 border-dashed rounded-lg bg-muted/10">
                    <MapPin className="h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Nenhum endereço vinculado.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Histórico */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="h-3 w-3" /> Histórico
                  </h4>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {filteredTrainings.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* ID Filter */}
                  <div className="flex items-center gap-1 bg-background border rounded-md px-2 py-0.5 shadow-sm hover:border-primary/50 transition-colors">
                    <Hash className="h-3 w-3 text-muted-foreground" />
                    <input
                      type="text"
                      className="h-6 w-16 text-xs bg-transparent border-none focus:outline-none focus:ring-0 text-muted-foreground placeholder:text-muted-foreground/50"
                      placeholder="ID"
                      value={ filterId }
                      onChange={ (e) => setFilterId(e.target.value) }
                    />
                    {filterId && (
                      <button
                        onClick={ () => setFilterId("") }
                        className="ml-1 text-muted-foreground hover:text-red-500"
                        title="Limpar ID"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* Date Filter */}
                  <div className="flex items-center gap-1 bg-background border rounded-md px-2 py-0.5 shadow-sm hover:border-primary/50 transition-colors">
                    <Filter className="h-3 w-3 text-muted-foreground" />
                    <input
                      type="date"
                      className="h-6 w-28 text-xs bg-transparent border-none focus:outline-none focus:ring-0 text-muted-foreground"
                      value={ filterDate }
                      onChange={ (e) => setFilterDate(e.target.value) }
                    />
                    {filterDate && (
                      <button
                        onClick={ () => setFilterDate("") }
                        className="ml-1 text-muted-foreground hover:text-red-500"
                        title="Limpar data"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {filteredTrainings.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground bg-muted/20 rounded-md border border-dashed flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 opacity-50" />
                    <span>
                      {trainingsList.length > 0 && filterDate
                        ? "Nenhum treino nesta data."
                        : "Nenhum treinamento registrado."}
                    </span>
                  </div>
                  {filterDate && (
                    <button
                      onClick={ clearFilter }
                      className="text-primary text-xs underline hover:no-underline"
                    >
                      Ver todos
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredTrainings.map((training) => {
                    // Encontra o pagamento específico do aluno (TRAINEE)
                    const payment = training.TrainingPayment?.find(
                      (p) =>
                        p.payerType === "TRAINEE" &&
                        p.customerId === trainee.customerId,
                    );

                    return (
                      <div
                        key={ training.trainingId }
                        className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 text-sm space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium flex items-center gap-2 text-base">
                              <span className="text-xs text-muted-foreground font-normal bg-muted px-1.5 rounded border">
                                #{training.trainingId}
                              </span>
                              {training.Gear?.gearName || "Treinamento"}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(training.dueDate).toLocaleDateString(
                                  "pt-BR",
                                )}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {String(
                                  Math.floor(training.hourInMinutes / 60),
                                ).padStart(2, "0")}
                                :
                                {String(training.hourInMinutes % 60).padStart(
                                  2,
                                  "0",
                                )}
                              </span>
                            </div>
                            {training.SourceFilial && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Building2 className="h-3 w-3" />
                                <span>{training.SourceFilial.filialName}</span>
                              </div>
                            )}
                          </div>
                          {payment && (
                            <Badge
                              variant="outline"
                              className={ `${getStatusColorClass(
                                payment.paymentStatus,
                              )}` }
                            >
                              {payment.paymentStatus}
                            </Badge>
                          )}
                        </div>

                        {payment && (
                          <div className="bg-muted/30 rounded p-3 space-y-2 border mt-2">
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-xs font-semibold text-muted-foreground">
                                Detalhes do Pagamento
                              </p>
                              {/* --- CORREÇÃO AQUI: Usando payment.price --- */}
                              <span className="text-xs font-bold text-primary/80">
                                Total:{" "}
                                {centsToStringWithCurrencyMark(
                                  payment.totalPrice || 0,
                                )}
                              </span>
                            </div>

                            {/* 1ª Parcela */}
                            <div className="flex justify-between items-center text-xs">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                  1
                                </div>
                                <div className="flex flex-col">
                                  <span>Entrada</span>
                                  <span className="text-[10px] opacity-70">
                                    {formatDate(payment.firstPaymentDate)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {payment.firstPaymentMethod && (
                                  <span className="text-[10px] px-1.5 py-0.5 bg-background border rounded">
                                    {payment.firstPaymentMethod}
                                  </span>
                                )}
                                <span className="font-medium">
                                  {centsToStringWithCurrencyMark(
                                    payment.firstPaymentAmount || 0,
                                  )}
                                </span>
                                {payment.firstPaymentStatus === "Pago" && (
                                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                                )}
                              </div>
                            </div>

                            {/* 2ª Parcela */}
                            {(payment.secondPaymentAmount || 0) > 0 && (
                              <>
                                <Separator className="bg-border/50" />
                                <div className="flex justify-between items-center text-xs">
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-bold text-orange-600">
                                      2
                                    </div>
                                    <div className="flex flex-col">
                                      <span>Restante</span>
                                      <span className="text-[10px] opacity-70">
                                        {formatDate(payment.secondPaymentDate)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {payment.secondPaymentMethod && (
                                      <span className="text-[10px] px-1.5 py-0.5 bg-background border rounded">
                                        {payment.secondPaymentMethod}
                                      </span>
                                    )}
                                    <span className="font-medium">
                                      {centsToStringWithCurrencyMark(
                                        payment.secondPaymentAmount || 0,
                                      )}
                                    </span>
                                    {payment.secondPaymentStatus === "Pago" ? (
                                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                                    ) : (
                                      <span className="text-[10px] text-orange-600 italic bg-orange-50 px-1 rounded">
                                        Pendente
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
