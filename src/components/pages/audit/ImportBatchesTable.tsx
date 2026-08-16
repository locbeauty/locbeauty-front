"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Copy, Eye, Loader2, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SelectFilials } from "@/components/shared/SelectFilials";
import { useAuth } from "@/contexts/auth-provider";
import { useAccess } from "@/contexts/access-provider";
import { useDebounce } from "@/hooks/use-debounce";
import { USER_ROLES } from "@/utils/constants";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { GetImportBatches, RevertImportBatch } from "@/services/imports.service";
import {
  IMPORT_STATUS_LABELS,
  IMPORT_TYPE_LABELS,
  ImportBatchListItem,
  ImportBatchStatus,
  ImportType,
} from "@/utils/@types/import-batch";
import { RevertImportDialog } from "./RevertImportDialog";
import { ImportBatchDetailsDialog } from "./ImportBatchDetailsDialog";
import {
  ListPagination,
  DEFAULT_PAGE_SIZE,
} from "@/components/shared/ListPagination";

/** ID curto exibido na tabela — mesmo formato usado no histórico de treinos. */
function shortId(batchId: string) {
  return `#${batchId.slice(-6)}`;
}

function statusVariant(status: ImportBatchStatus) {
  if (status === "Aplicado") return "default" as const;
  if (status === "Revertido") return "secondary" as const;
  return "outline" as const;
}

export function ImportBatchesTable() {
  const { user } = useAuth();
  const { accesses } = useAccess();
  const queryClient = useQueryClient();

  const [ typeFilter, setTypeFilter ] = useState<ImportType | "ALL">("ALL");
  const [ statusFilter, setStatusFilter ] = useState<ImportBatchStatus | "ALL">(
    "ALL",
  );
  const [ filialIds, setFilialIds ] = useState<string[]>([]);
  const [ employeeName, setEmployeeName ] = useState("");
  const [ fileName, setFileName ] = useState("");
  const [ batchIdSearch, setBatchIdSearch ] = useState("");
  const [ page, setPage ] = useState(1);
  const [ limit, setLimit ] = useState(DEFAULT_PAGE_SIZE);

  const debouncedEmployeeName = useDebounce(employeeName);
  const debouncedFileName = useDebounce(fileName);
  // O usuário costuma colar o ID curto (#abc123): o "#" não faz parte do id.
  const debouncedBatchId = useDebounce(batchIdSearch.replace(/^#/, "").trim());

  const [ batchToRevert, setBatchToRevert ] =
    useState<ImportBatchListItem | null>(null);
  const [ isReverting, setIsReverting ] = useState(false);
  const [ detailsBatchId, setDetailsBatchId ] = useState<string | null>(null);

  // Filiais que o usuário pode ver na Auditoria — restringe o seletor.
  const accessibleFilialIds = useMemo(() => {
    if (user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER) {
      return undefined;
    }

    const permissions = accesses
      .filter((a) => a.module === SYSTEM_MODULES.AUDITORIA && a.canView)
      .map((a) => a.filialId);

    return Array.from(new Set(permissions));
  }, [ user, accesses ]);

  // Excluir apaga registros de verdade — só Master, como as demais exclusões.
  const canDelete =
    user?.role === USER_ROLES.MASTER || user?.role === USER_ROLES.ADMIN;

  const hasActiveFilters =
    typeFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    filialIds.length > 0 ||
    employeeName !== "" ||
    fileName !== "" ||
    batchIdSearch !== "";

  // Qualquer mudança de filtro volta para a primeira página, senão o usuário
  // pode cair numa página vazia.
  useEffect(() => {
    setPage(1);
  }, [
    typeFilter,
    statusFilter,
    filialIds,
    debouncedEmployeeName,
    debouncedFileName,
    debouncedBatchId,
  ]);

  const { data, isLoading } = useQuery({
    queryKey: [
      "import-batches",
      typeFilter,
      statusFilter,
      filialIds,
      debouncedEmployeeName,
      debouncedFileName,
      debouncedBatchId,
      page,
      limit,
    ],
    queryFn: () =>
      GetImportBatches(
        {
          ...(typeFilter !== "ALL" ? { type: typeFilter } : {}),
          ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
          ...(filialIds.length > 0 ? { filialIds } : {}),
          ...(debouncedEmployeeName
            ? { employeeName: debouncedEmployeeName }
            : {}),
          ...(debouncedFileName ? { fileName: debouncedFileName } : {}),
          ...(debouncedBatchId ? { batchId: debouncedBatchId } : {}),
        },
        { page, limit },
      ),
  });

  const batches = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;

  function clearFilters() {
    setTypeFilter("ALL");
    setStatusFilter("ALL");
    setFilialIds([]);
    setEmployeeName("");
    setFileName("");
    setBatchIdSearch("");
  }

  async function copyBatchId(batchId: string) {
    try {
      await navigator.clipboard.writeText(batchId);
      toast.success("ID da importação copiado.");
    } catch {
      toast.error("Não foi possível copiar o ID.");
    }
  }

  async function handleRevert() {
    if (!batchToRevert) return;

    setIsReverting(true);

    try {
      const response = await RevertImportBatch(batchToRevert.batchId);

      if (response.statusCode >= 400) {
        toast.error(response.message ?? "Erro ao excluir importação.");
        return;
      }

      const result = response.data;

      if (result && result.preservedCount > 0) {
        toast.warning(
          `${result.removedCount} registro(s) excluído(s). ${result.preservedCount} preservado(s) — veja os detalhes.`,
        );
      } else {
        toast.success(
          `Importação excluída: ${result?.removedCount ?? 0} registro(s) removido(s).`,
        );
      }

      setBatchToRevert(null);
      await queryClient.invalidateQueries({ queryKey: [ "import-batches" ] });
    } catch {
      toast.error("Erro ao excluir importação.");
    } finally {
      setIsReverting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col flex-wrap gap-4 md:flex-row md:items-end">
        <div className="w-full space-y-1 md:w-[170px]">
          <Label className="text-xs">ID da importação</Label>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              type="search"
              placeholder="#a1b2c3"
              className="placeholder:text-placeholder pl-8 font-mono"
              value={ batchIdSearch }
              onChange={ (e) => setBatchIdSearch(e.target.value) }
            />
          </div>
        </div>

        <div className="w-full space-y-1 md:w-[240px]">
          <Label className="text-xs">Arquivo</Label>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              type="search"
              placeholder="Nome do arquivo..."
              className="placeholder:text-placeholder pl-8"
              value={ fileName }
              onChange={ (e) => setFileName(e.target.value) }
            />
          </div>
        </div>

        <div className="w-full space-y-1 md:w-[220px]">
          <Label className="text-xs">Usuário</Label>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              type="search"
              placeholder="Nome do funcionário..."
              className="placeholder:text-placeholder pl-8"
              value={ employeeName }
              onChange={ (e) => setEmployeeName(e.target.value) }
            />
          </div>
        </div>

        <div className="w-full space-y-1 md:w-[200px]">
          <Label className="text-xs">Filial</Label>
          <SelectFilials
            value={ filialIds }
            onChange={ setFilialIds }
            placeholder="Todas as filiais"
            accessibleFilials={ accessibleFilialIds }
          />
        </div>

        <div className="w-full space-y-1 md:w-[170px]">
          <Label className="text-xs">Tipo</Label>
          <Select
            value={ typeFilter }
            onValueChange={ (value) => setTypeFilter(value as ImportType | "ALL") }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="CUSTOMERS">Clientes</SelectItem>
              <SelectItem value="BOOKINGS">Agendamentos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full space-y-1 md:w-[200px]">
          <Label className="text-xs">Situação</Label>
          <Select
            value={ statusFilter }
            onValueChange={ (value) =>
              setStatusFilter(value as ImportBatchStatus | "ALL")
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas</SelectItem>
              <SelectItem value="Aplicado">Aplicado</SelectItem>
              <SelectItem value="Revertido">Excluído</SelectItem>
              <SelectItem value="Revertido_Parcial">
                  Excluído parcialmente
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={ clearFilters }
            className="h-9 px-2 md:ml-auto lg:px-3"
          >
              Limpar filtros
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Arquivo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Filial</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Registros</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={ 9 } className="py-8 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </TableCell>
              </TableRow>
            )}

            {!isLoading && batches.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={ 9 }
                  className="text-muted-foreground py-8 text-center"
                >
                  {hasActiveFilters
                    ? "Nenhuma importação encontrada com esses filtros."
                    : "Nenhuma importação registrada."}
                </TableCell>
              </TableRow>
            )}

            {batches.map((batch) => (
              <TableRow key={ batch.batchId }>
                <TableCell>
                  <button
                    type="button"
                    onClick={ () => copyBatchId(batch.batchId) }
                    title={ `${batch.batchId} — clique para copiar` }
                    className="text-muted-foreground hover:text-foreground group flex items-center gap-1 font-mono text-xs"
                  >
                    {shortId(batch.batchId)}
                    <Copy className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                </TableCell>
                <TableCell className="max-w-[220px] truncate font-medium">
                  {batch.fileName}
                </TableCell>
                <TableCell>{IMPORT_TYPE_LABELS[batch.type]}</TableCell>
                <TableCell>{batch.Filial?.filialName}</TableCell>
                <TableCell>{batch.employeeName}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(batch.createdAt), "dd/MM/yyyy HH:mm")}
                </TableCell>
                <TableCell className="text-right">
                  {batch.successCount}
                  {batch.skippedCount > 0 && (
                    <span className="text-muted-foreground text-xs">
                      { " " }
                      (+{batch.skippedCount} ignorado
                      {batch.skippedCount > 1 ? "s" : ""})
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={ statusVariant(batch.status) }>
                    {IMPORT_STATUS_LABELS[batch.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Visualizar conteúdo"
                      onClick={ () => setDetailsBatchId(batch.batchId) }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {canDelete && batch.status === "Aplicado" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Excluir importação"
                        className="text-destructive hover:text-destructive"
                        onClick={ () => setBatchToRevert(batch) }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ListPagination
        page={ page }
        limit={ limit }
        totalItems={ total }
        onPageChange={ setPage }
        onLimitChange={ (newLimit) => {
          setPage(1);
          setLimit(newLimit);
        } }
        itemLabel="importação(ões)"
      />

      <RevertImportDialog
        batch={ batchToRevert }
        isOpen={ !!batchToRevert }
        onOpenChange={ (open) => !open && setBatchToRevert(null) }
        onConfirm={ handleRevert }
        isReverting={ isReverting }
      />

      <ImportBatchDetailsDialog
        batchId={ detailsBatchId }
        isOpen={ !!detailsBatchId }
        onOpenChange={ (open) => !open && setDetailsBatchId(null) }
      />
    </div>
  );
}
