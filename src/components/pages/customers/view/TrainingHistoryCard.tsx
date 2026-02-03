"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  Building2,
  DollarSign,
  FileText,
  X,
  CheckCircle2,
  Hash,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { centsToStringWithCurrencyMark } from "@/utils/centsToString";
import { Training } from "@/utils/@types/training";
import { Customer } from "@/utils/@types/customer";
import { GetCustomerTrainings } from "@/services/trainings.service";

interface TrainingHistoryCardProps {
  isCustomerDetailsModalOpen: boolean;
  selectedCustomer: Customer | null;
}

const TRAININGS_PER_PAGE = 5;

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

export function TrainingHistoryCard({
  isCustomerDetailsModalOpen,
  selectedCustomer,
}: TrainingHistoryCardProps) {
  const [ allTrainings, setAllTrainings ] = useState<Training[]>([]);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ visibleCount, setVisibleCount ] = useState(TRAININGS_PER_PAGE);

  const [ filterDate, setFilterDate ] = useState<string>("");
  const [ filterGearId, setFilterGearId ] = useState<string>("all");
  const [ filterPaymentStatus, setFilterPaymentStatus ] = useState<string>("all");
  const [ filterId, setFilterId ] = useState<string>("");

  useEffect(() => {
    async function fetchTrainings() {
      if (!selectedCustomer?.customerId) return;
      setIsLoading(true);
      try {
        const response = await GetCustomerTrainings(
          selectedCustomer.customerId,
        );
        if (response.success) {
          setAllTrainings(response.data);
        }
      } catch (error) {
        console.error("Erro ao carregar treinamentos:", error);
        setAllTrainings([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (isCustomerDetailsModalOpen) {
      fetchTrainings();
      setVisibleCount(TRAININGS_PER_PAGE);
    }
  }, [ isCustomerDetailsModalOpen, selectedCustomer ]);

  const filteredTrainings = useMemo(() => {
    let result = allTrainings || [];

    if (filterDate) {
      result = result.filter((tr) => {
        const trDate = new Date(tr.dueDate);
        trDate.setHours(0, 0, 0, 0);
        const selectedDate = new Date(filterDate + "T00:00:00");
        selectedDate.setHours(0, 0, 0, 0);
        return trDate.getTime() === selectedDate.getTime();
      });
    }

    if (filterGearId !== "all") {
      result = result.filter((tr) => tr.gearId === filterGearId);
    }

    if (filterId) {
      result = result.filter((tr) =>
        tr.trainingId.toLowerCase().includes(filterId.toLowerCase()),
      );
    }

    if (filterPaymentStatus !== "all") {
      result = result.filter((tr) => {
        const payment = tr.TrainingPayment?.find(
          (p) => p.customerId === selectedCustomer?.customerId,
        );
        return payment?.paymentStatus === filterPaymentStatus;
      });
    }

    return result;
  }, [
    allTrainings,
    filterDate,
    filterGearId,
    filterId,
    filterPaymentStatus,
    selectedCustomer,
  ]);

  const availableGears = useMemo(() => {
    const gearsMap = new Map();
    allTrainings.forEach((tr) => {
      if (tr.Gear) {
        gearsMap.set(tr.Gear.gearId, tr.Gear.gearName);
      }
    });
    return Array.from(gearsMap.entries()).map(([ id, name ]) => ({ id, name }));
  }, [ allTrainings ]);

  const displayedTrainings = filteredTrainings.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTrainings.length;

  const clearFilters = () => {
    setFilterDate("");
    setFilterGearId("all");
    setFilterPaymentStatus("all");
    setFilterId("");
  };

  const isFiltered =
    filterDate !== "" ||
    filterGearId !== "all" ||
    filterPaymentStatus !== "all" ||
    filterId !== "";

  return (
    <Card className="mt-6 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex flex-col gap-4">
          <div className="flex items-center justify-between md:flex-row flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-lg">
                Histórico de Treinamentos
              </span>
              <Badge
                variant="secondary"
                className="bg-primary/20 text-primary hover:bg-primary/30"
              >
                {filteredTrainings.length}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {isFiltered && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={ clearFilters }
                  className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpar Filtros
                </Button>
              )}
              {visibleCount < filteredTrainings.length && (
                <Badge
                  variant="outline"
                  className="text-xs border-primary/30 text-primary"
                >
                  Mostrando {visibleCount} de {filteredTrainings.length}
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <div className="relative">
              <Hash className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="ID Treinamento"
                className="w-full pl-8 pr-2 py-1.5 text-xs rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                value={ filterId }
                onChange={ (e) => setFilterId(e.target.value) }
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="date"
                className="w-full pl-8 pr-2 py-1.5 text-xs rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                value={ filterDate }
                onChange={ (e) => setFilterDate(e.target.value) }
              />
            </div>

            <div className="relative">
              <FileText className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <select
                className="w-full pl-8 pr-2 py-1.5 text-xs rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer shadow-sm"
                value={ filterGearId }
                onChange={ (e) => setFilterGearId(e.target.value) }
              >
                <option value="all">Todos os Equipamentos</option>
                {availableGears.map((gear) => (
                  <option key={ gear.id } value={ gear.id }>
                    {gear.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <DollarSign className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <select
                className="w-full pl-8 pr-2 py-1.5 text-xs rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer shadow-sm"
                value={ filterPaymentStatus }
                onChange={ (e) => setFilterPaymentStatus(e.target.value) }
              >
                <option value="all">Todos os Status</option>
                <option value="Pago">Pago</option>
                <option value="Pendente">Pendente</option>
                <option value="Parcial">Parcial</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground animate-pulse">
              Carregando treinamentos...
            </p>
          </div>
        ) : filteredTrainings.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed rounded-lg bg-background/50">
            <Calendar className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              {allTrainings.length > 0
                ? "Nenhum treinamento corresponde aos filtros."
                : "Nenhum treinamento registrado."}
            </p>
            {isFiltered && (
              <Button
                variant="link"
                onClick={ clearFilters }
                className="text-primary mt-2"
              >
                Limpar todos os filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayedTrainings.map((training) => {
              const payment = training.TrainingPayment?.find(
                (p) => p.customerId === selectedCustomer?.customerId,
              );

              return (
                <div
                  key={ training.trainingId }
                  className="group relative rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:border-primary/30"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded border">
                              #{training.trainingId.slice(-6)}
                            </span>
                            <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                              {training.Gear?.gearName || "Treinamento"}
                            </h4>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-primary/70" />
                              {formatDate(training.dueDate)}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-primary/70" />
                              {String(
                                Math.floor(training.hourInMinutes / 60),
                              ).padStart(2, "0")}
                              :
                              {String(training.hourInMinutes % 60).padStart(
                                2,
                                "0",
                              )}
                            </span>
                            {training.SourceFilial && (
                              <span className="flex items-center gap-1.5">
                                <Building2 className="h-3.5 w-3.5 text-primary/70" />
                                {training.SourceFilial.filialName}
                              </span>
                            )}
                          </div>
                        </div>
                        {payment && (
                          <Badge
                            className={ `shadow-none border ${getStatusColorClass(payment.paymentStatus)}` }
                          >
                            {payment.paymentStatus}
                          </Badge>
                        )}
                      </div>

                      {payment && (
                        <div className="rounded-lg bg-muted/30 p-3 overflow-hidden border">
                          <div className="flex justify-between items-center mb-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                              Resumo Financeiro
                            </p>
                            <span className="text-sm font-black text-primary">
                              {centsToStringWithCurrencyMark(
                                payment.totalPrice || 0,
                              )}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Parcel 1 */}
                            <div className="flex items-center justify-between text-xs bg-background/50 p-2 rounded border border-transparent hover:border-primary/10 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20">
                                  1
                                </div>
                                <div>
                                  <p className="font-semibold">
                                    {centsToStringWithCurrencyMark(
                                      payment.firstPaymentAmount || 0,
                                    )}
                                  </p>
                                  <p className="text-[9px] text-muted-foreground uppercase opacity-70">
                                    {payment.firstPaymentMethod || "N/A"} •{" "}
                                    {formatDate(payment.firstPaymentDate)}
                                  </p>
                                </div>
                              </div>
                              {payment.firstPaymentStatus === "Pago" ? (
                                <div className="bg-green-100 p-0.5 rounded-full">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                                </div>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] h-4 py-0 bg-red-50 text-red-600 border-red-200 uppercase px-1"
                                >
                                  Pendente
                                </Badge>
                              )}
                            </div>

                            {/* Parcel 2 */}
                            {(payment.secondPaymentAmount || 0) > 0 && (
                              <div className="flex items-center justify-between text-xs bg-background/50 p-2 rounded border border-transparent hover:border-primary/10 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-black text-orange-600 border border-orange-200">
                                    2
                                  </div>
                                  <div>
                                    <p className="font-semibold">
                                      {centsToStringWithCurrencyMark(
                                        payment.secondPaymentAmount || 0,
                                      )}
                                    </p>
                                    <p className="text-[9px] text-muted-foreground uppercase opacity-70">
                                      {payment.secondPaymentMethod || "N/A"} •{" "}
                                      {formatDate(payment.secondPaymentDate)}
                                    </p>
                                  </div>
                                </div>
                                {payment.secondPaymentStatus === "Pago" ? (
                                  <div className="bg-green-100 p-0.5 rounded-full">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                                  </div>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="text-[9px] h-4 py-0 bg-orange-50 text-orange-600 border-orange-200 uppercase px-1"
                                  >
                                    Pendente
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {hasMore && (
              <div className="pt-2 text-center">
                <Button
                  variant="outline"
                  onClick={ () =>
                    setVisibleCount((prev) => prev + TRAININGS_PER_PAGE)
                  }
                  className="w-full sm:w-auto text-xs font-bold uppercase tracking-wider border-primary/20 hover:bg-primary/5 hover:text-primary transition-all shadow-sm"
                >
                  Carregar mais treinamentos
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
