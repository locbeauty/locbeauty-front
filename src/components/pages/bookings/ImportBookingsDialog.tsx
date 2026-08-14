"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUp, FileDown, FileSpreadsheet, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { SelectFilial } from "@/components/shared/SelectFilial";
import { Controller, useForm } from "react-hook-form";
import { useAuth } from "@/contexts/auth-provider";
import { useAccess } from "@/contexts/access-provider";
import { USER_ROLES } from "@/utils/constants";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { ImportBookings } from "@/services/bookings.service";
import { GetAllCheckouts } from "@/services/checkouts.service";
import { Checkout } from "@/utils/@types/checkouts";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/app/(main)/layout";

interface ImportBookingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ExportFileType = "csv" | "xlsx";

interface ImportPreview {
  validCount: number;
  failedCount: number;
  errors: string[];
  totalValueCents: number;
}

const EXPORT_LIMIT = 100000;

const formatHour = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(
    minutes % 60,
  ).padStart(2, "0")}`;

const formatCurrency = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const EXPORT_HEADERS = [
  "Cliente",
  // Chave de identificação do cliente na importação — precisa sair no export
  // para que o ciclo exportar → editar → reimportar continue funcionando.
  "CPF/CNPJ",
  "Filial",
  "Cidade",
  "Equipamentos",
  "Data",
  "Hora Início",
  "Horário Final",
  "Duração (min)",
  "Status",
  "Pagamento",
  "Valor Total (R$)",
  "Observações",
];

function buildExportRows(items: Checkout[]): (string | number)[][] {
  return items.map((checkout) => [
    checkout.Customer?.fullname ?? "",
    checkout.Customer?.cpf || checkout.Customer?.cnpj || "",
    checkout.SourceFilial?.filialName ?? "",
    checkout.Address?.city ?? "",
    (checkout.Bookings ?? [])
      .filter((booking) => booking.status === "ACTIVE")
      .map((booking) => booking.Gear.gearName)
      .join(", "),
    new Date(checkout.date).toLocaleDateString("pt-BR"),
    formatHour(checkout.startHourInMinutes),
    formatHour(checkout.startHourInMinutes + checkout.totalDurationInMinutes),
    checkout.totalDurationInMinutes,
    String(checkout.checkoutStatus ?? "").replace(/_/g, " "),
    checkout.CheckoutPayment?.paymentStatus ?? "Pendente",
    checkout.totalPrice / 100,
    checkout.observations ?? "",
  ]);
}

/** Célula CSV: aspas quando o valor contém separador/aspas/quebra de linha. */
function toCsvCell(value: string | number): string {
  const text =
    typeof value === "number"
      ? value.toLocaleString("pt-BR", { useGrouping: false })
      : value;
  return /[";\n]/.test(text) ? `"${text.replace(/"/g, "\"\"")}"` : text;
}

/** Gera e baixa a planilha no formato escolhido. Usado pela exportação e pelo modelo. */
async function downloadSheet(
  headers: string[],
  rows: (string | number)[][],
  baseName: string,
  fileType: ExportFileType,
) {
  if (fileType === "xlsx") {
    const XLSX = await import("xlsx");
    const worksheet = XLSX.utils.aoa_to_sheet([ headers, ...rows ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Agendamentos");
    XLSX.writeFile(workbook, `${baseName}.xlsx`);
    return;
  }

  // CSV com BOM e separador ";" (compatível com Excel em pt-BR).
  const csv =
    "﻿" +
    [ headers, ...rows ].map((row) => row.map(toCsvCell).join(";")).join("\n");
  const blob = new Blob([ csv ], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${baseName}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

// O modelo NÃO traz a coluna "Filial": ela é ignorada na importação (a filial
// vem do seletor do diálogo), e oferecê-la só induziria a preenchê-la em vão.
// A exportação mantém a coluna porque ali ela é informação útil.
const TEMPLATE_HEADERS = EXPORT_HEADERS.filter(
  (header) => header !== "Filial",
);

// Linhas de exemplo: cobrem o caso de uma máquina e o de várias (por vírgula).
const TEMPLATE_ROWS: (string | number)[][] = [
  [
    "Maria Silva",
    "123.456.789-00",
    "Belém",
    "ACRUS",
    "15/08/2026",
    "08:00",
    "20:00",
    720,
    "Pendente",
    "Pendente",
    1300,
    "Exemplo — apague estas linhas antes de importar",
  ],
  [
    "Clínica Estética LTDA",
    "12.345.678/0001-90",
    "Ananindeua",
    "ACRUS, LAVIEEN",
    "16/08/2026",
    "09:00",
    "13:00",
    240,
    "Concluído",
    "Pago",
    2500,
    "CPF ou CNPJ — é o campo que identifica o cliente",
  ],
];

export function ImportBookingsDialog({
  open,
  onOpenChange,
}: ImportBookingsDialogProps) {
  const [ file, setFile ] = useState<File | null>(null);
  const [ isSubmitting, setIsSubmitting ] = useState(false);
  const [ isExporting, setIsExporting ] = useState(false);
  const [ preview, setPreview ] = useState<ImportPreview | null>(null);
  const [ filials, setFilials ] = useState<
    { filialId: string; filialName: string }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { getAccessibleFilialsForCreate } = useAccess();

  useEffect(() => {
    async function fetchFilials() {
      try {
        const { data } = await apiRequest<
          { filialId: string; filialName: string }[]
        >({
          endpoint: "filials",
          method: "GET",
        });
        if (data) {
          setFilials(data);
        }
      } catch (error) {
        console.error("Failed to fetch filials", error);
      }
    }
    fetchFilials();
  }, []);

  const accessibleFilialsObjects =
    user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER
      ? []
      : getAccessibleFilialsForCreate(SYSTEM_MODULES.BOOKINGS);

  const accessibleFilialsIds =
    accessibleFilialsObjects.length > 0
      ? accessibleFilialsObjects.map((f) => f.filialId)
      : user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER
        ? undefined
        : [];

  const { control, handleSubmit, reset, getValues } = useForm<{
    filialId?: string;
    fileType: ExportFileType;
  }>({
    defaultValues: {
      filialId: user?.sourceFilialId,
      fileType: "csv",
    },
  });

  const selectedFilialName = (filialId?: string) =>
    filials.find((filial) => filial.filialId === filialId)?.filialName ??
    "selecionada";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreview(null);
    }
  };

  const buildImportFormData = (filialId: string, dryRun: boolean) => {
    const formData = new FormData();
    formData.append("file", file!);
    formData.append("filialId", filialId);
    formData.append("dryRun", String(dryRun));
    return formData;
  };

  // Fase 1: valida a planilha (dry-run) e abre a confirmação.
  const onSubmit = async (data: { filialId?: string }) => {
    if (!file) {
      toast.warning("Por favor, selecione um arquivo.");
      return;
    }

    if (!data.filialId) {
      toast.warning("Por favor, selecione uma filial.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await ImportBookings(
        buildImportFormData(data.filialId, true),
      );

      if (response.validCount !== undefined) {
        setPreview({
          validCount: response.validCount,
          failedCount: response.failedCount,
          errors: response.errors ?? [],
          totalValueCents: response.totalValueCents ?? 0,
        });
      } else {
        toast.error(response.message || "Erro ao validar a planilha.");
      }
    } catch (error) {
      toast.error("Erro ao processar a planilha.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fase 2: confirmação — grava as linhas válidas.
  const handleConfirmImport = async () => {
    const { filialId } = getValues();
    if (!file || !filialId) return;

    setIsSubmitting(true);
    try {
      const response = await ImportBookings(
        buildImportFormData(filialId, false),
      );

      if (response.successCount !== undefined) {
        toast.success(
          `Importação concluída! ${response.successCount} agendamento(s) importado(s).`,
        );
        if (response.errors && response.errors.length > 0) {
          console.error("Import Errors:", response.errors);
          toast.error(
            `${response.errors.length} linha(s) falharam. Verifique o console para detalhes.`,
          );
        }
        queryClient.invalidateQueries({ queryKey: [ "get-all-checkouts" ] });
        onOpenChange(false);
        setFile(null);
        setPreview(null);
        reset();
      } else {
        toast.error(response.message || "Erro ao importar agendamentos.");
      }
    } catch (error) {
      toast.error("Erro ao processar importação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = async () => {
    const { filialId, fileType } = getValues();

    if (!filialId) {
      toast.warning("Por favor, selecione uma filial nos filtros.");
      return;
    }

    setIsExporting(true);
    try {
      const response = await GetAllCheckouts({
        queryParams: {
          filialIds: [ filialId ],
          page: 1,
          limit: EXPORT_LIMIT,
        },
      });

      const items = response.data?.items ?? [];
      if (items.length === 0) {
        toast.warning(
          "Nenhum agendamento encontrado para os filtros selecionados.",
        );
        return;
      }

      const filialSlug = (items[0]?.SourceFilial?.filialName ?? "filial")
        .toLocaleLowerCase("pt-BR")
        .replace(/\s+/g, "_");
      const baseName = `agendamentos_${filialSlug}_${new Date()
        .toISOString()
        .slice(0, 10)}`;

      await downloadSheet(
        EXPORT_HEADERS,
        buildExportRows(items),
        baseName,
        fileType,
      );

      toast.success(
        `${items.length} agendamento(s) exportado(s) em ${fileType.toUpperCase()}.`,
      );
    } catch (error) {
      console.error("Failed to export bookings", error);
      toast.error("Erro ao exportar agendamentos.");
    } finally {
      setIsExporting(false);
    }
  };

  // Baixa uma planilha vazia com o cabeçalho esperado e linhas de exemplo, no
  // mesmo formato escolhido nos filtros.
  const handleDownloadTemplate = async () => {
    const { fileType } = getValues();

    try {
      await downloadSheet(
        TEMPLATE_HEADERS,
        TEMPLATE_ROWS,
        "modelo_importacao_agendamentos",
        fileType,
      );
      toast.success(`Modelo baixado em ${fileType.toUpperCase()}.`);
    } catch (error) {
      console.error("Failed to download template", error);
      toast.error("Erro ao baixar o modelo.");
    }
  };

  return (
    <Dialog open={ open } onOpenChange={ onOpenChange }>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gerência de Arquivos</DialogTitle>
          <DialogDescription>
            Importe agendamentos em massa a partir de uma planilha ou exporte
            os registros.
          </DialogDescription>
        </DialogHeader>

        {preview ? (
          // Etapa de confirmação: resumo da validação antes de gravar.
          <div className="space-y-4 pt-2">
            <p className="text-sm font-semibold">Confirmar Importação</p>
            {preview.validCount > 0 ? (
              <p className="text-sm">
                Você está importando{" "}
                <span className="font-bold">
                  {preview.validCount} agendamento(s)
                </span>{" "}
                no valor total de{" "}
                <span className="font-bold">
                  {formatCurrency(preview.totalValueCents)}
                </span>{" "}
                para a filial{" "}
                <span className="font-bold">
                  {selectedFilialName(getValues().filialId)}
                </span>
                . Confirmar?
              </p>
            ) : (
              <p className="text-sm">
                Nenhuma linha válida para importar. Corrija os erros abaixo e
                tente novamente.
              </p>
            )}

            {preview.errors.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-destructive">
                  {preview.errors.length} linha(s) com erro (não serão
                  importadas):
                </p>
                <div className="max-h-36 space-y-0.5 overflow-y-auto rounded-md border border-destructive/30 bg-destructive/5 p-2">
                  {preview.errors.map((error) => (
                    <p key={ error } className="text-xs text-destructive">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={ isSubmitting }
                onClick={ () => setPreview(null) }
              >
                Cancelar
              </Button>
              {preview.validCount > 0 && (
                <Button
                  type="button"
                  className="flex-1"
                  disabled={ isSubmitting }
                  onClick={ handleConfirmImport }
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : (
                    <FileUp className="mr-2 h-4 w-4" />
                  )}
                  Confirmar Importação
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={ handleSubmit(onSubmit) } className="space-y-4 pt-2">
              {/* Filtros compartilhados: definem a filial e o tipo de arquivo
                  usados tanto na importação quanto na exportação. */}
              <div className="space-y-2">
                <p className="text-sm font-semibold">Filtros</p>
                <Label>Filial</Label>
                <SelectFilial
                  control={ control }
                  name="filialId"
                  accessibleFilials={ accessibleFilialsIds }
                  defaultFilial={ user?.sourceFilialId }
                />
                <Label>Tipo de arquivo</Label>
                <Controller
                  control={ control }
                  name="fileType"
                  render={ ({ field }) => (
                    <Select
                      value={ field.value }
                      onValueChange={ field.onChange }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de arquivo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="xlsx">XLSX (Excel)</SelectItem>
                      </SelectContent>
                    </Select>
                  ) }
                />
                <p className="text-xs text-muted-foreground">
                  Os filtros selecionados valem para a importação e a
                  exportação. A coluna &quot;Filial&quot; da planilha é
                  ignorada: os agendamentos são importados para a filial
                  selecionada acima.
                </p>
              </div>

              <div className="space-y-2 border-t pt-4">
                <p className="text-sm font-semibold">Importação</p>
                <Label htmlFor="file">Planilha (Excel/CSV)</Label>
                {/* Input nativo escondido: a área clicável fica restrita ao botão. */}
                <div className="flex items-center gap-3 rounded-md border border-input px-1.5 py-1.5 shadow-xs">
                  <Button
                    type="button"
                    size="sm"
                    className="shrink-0 bg-gray-200 font-medium text-gray-800 hover:bg-gray-300"
                    onClick={ () => fileInputRef.current?.click() }
                  >
                    Escolher arquivo
                  </Button>
                  <span className="truncate text-sm text-muted-foreground">
                    {file ? file.name : "Nenhum arquivo escolhido"}
                  </span>
                  <input
                    ref={ fileInputRef }
                    id="file"
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    className="hidden"
                    onChange={ handleFileChange }
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={ isSubmitting }
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin mr-2" />
                    ) : (
                      <FileUp className="mr-2 h-4 w-4" />
                    )}
                    Importar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0"
                    onClick={ handleDownloadTemplate }
                    title="Baixar planilha modelo com as colunas esperadas"
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Modelo
                  </Button>
                </div>
              </div>
            </form>

            <div className="space-y-2 border-t pt-4">
              <p className="text-sm font-semibold">Exportação</p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={ isExporting }
                onClick={ handleExport }
              >
                {isExporting ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  <FileDown className="mr-2 h-4 w-4" />
                )}
                Exportar Agendamentos
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
