"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GetImportBatchDetails } from "@/services/imports.service";
import { IMPORT_TYPE_LABELS } from "@/utils/@types/import-batch";

interface ImportBatchDetailsDialogProps {
  batchId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportBatchDetailsDialog({
  batchId,
  isOpen,
  onOpenChange,
}: ImportBatchDetailsDialogProps) {
  const { data, isLoading } = useQuery({
    queryKey: [ "import-batch", batchId ],
    queryFn: () => GetImportBatchDetails(batchId as string),
    enabled: isOpen && !!batchId,
  });

  const batch = data?.data;

  return (
    <Dialog open={ isOpen } onOpenChange={ onOpenChange }>
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Detalhes da importação</DialogTitle>
          <DialogDescription>
            {batch
              ? `${batch.fileName} — ${IMPORT_TYPE_LABELS[batch.type]}`
              : "Carregando..."}
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {batch && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-md px-3 py-2">
              <p className="text-muted-foreground text-xs">ID da importação</p>
              <p className="font-mono text-sm break-all">{batch.batchId}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div>
                <p className="text-muted-foreground text-xs">Importado por</p>
                <p className="font-medium">{batch.employeeName}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Data</p>
                <p className="font-medium">
                  {format(new Date(batch.createdAt), "dd/MM/yyyy HH:mm")}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Filial</p>
                <p className="font-medium">{batch.Filial?.filialName}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Criados</p>
                <p className="font-medium">{batch.successCount}</p>
              </div>
            </div>

            {(batch.skippedCount > 0 || batch.failedCount > 0) && (
              <div className="text-muted-foreground flex gap-4 text-xs">
                {batch.skippedCount > 0 && (
                  <span>{batch.skippedCount} ignorado(s) por já existirem</span>
                )}
                {batch.failedCount > 0 && (
                  <span>{batch.failedCount} com erro</span>
                )}
              </div>
            )}

            {batch.revertNotes && (
              <div className="border-destructive/40 bg-destructive/5 rounded-md border p-3">
                <p className="mb-1 text-xs font-medium">
                  Preservados na exclusão
                </p>
                <pre className="text-muted-foreground max-h-32 overflow-auto whitespace-pre-wrap text-xs">
                  {batch.revertNotes}
                </pre>
              </div>
            )}

            <div>
              <p className="mb-2 text-sm font-medium">
                Registros criados ({batch.Items.length})
              </p>
              <ScrollArea className="h-64 rounded-md border">
                <div className="divide-y">
                  {batch.Items.map((item) => (
                    <div
                      key={ item.itemId }
                      className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {item.entityLabel ?? item.entityId}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Linha {item.rowNumber}
                        </p>
                      </div>
                      {item.revertedAt ? (
                        <Badge variant="secondary">Excluído</Badge>
                      ) : item.revertSkipReason ? (
                        <Badge
                          variant="outline"
                          title={ item.revertSkipReason }
                          className="max-w-[220px] truncate"
                        >
                          {item.revertSkipReason}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Ativo</Badge>
                      )}
                    </div>
                  ))}

                  {batch.Items.length === 0 && (
                    <p className="text-muted-foreground p-4 text-center text-sm">
                      Esta importação não criou nenhum registro.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
