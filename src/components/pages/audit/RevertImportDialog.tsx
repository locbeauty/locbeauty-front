import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IMPORT_TYPE_LABELS,
  ImportBatchListItem,
} from "@/utils/@types/import-batch";

interface RevertImportDialogProps {
  batch: ImportBatchListItem | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isReverting: boolean;
}

export function RevertImportDialog({
  batch,
  isOpen,
  onOpenChange,
  onConfirm,
  isReverting,
}: RevertImportDialogProps) {
  if (!batch) return null;

  const entityLabel =
    batch.type === "CUSTOMERS" ? "cliente(s)" : "agendamento(s)";

  return (
    <Dialog open={ isOpen } onOpenChange={ onOpenChange }>
      <DialogContent className="max-w-[480px] space-y-4">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Excluir importação
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3 text-sm">
              <p>
                Isso vai <strong>apagar definitivamente</strong> os{ " " }
                {batch._count.Items} {entityLabel} criados pela importação{ " " }
                <span className="text-foreground font-mono font-bold">
                  #{batch.batchId.slice(-6)}
                </span>{ " " }
                —{ " " }
                <span className="text-foreground font-bold">
                  {batch.fileName}
                </span>{ " " }
                ({IMPORT_TYPE_LABELS[batch.type]},{ " " }
                {batch.Filial?.filialName}).
              </p>
              <p>
                Registros que ganharam movimento depois da importação (por
                exemplo, um cliente importado que já recebeu agendamentos) são
                preservados e listados ao final, em &quot;Visualizar
                conteúdo&quot;.
              </p>
              <p className="text-destructive font-medium">
                Esta ação não pode ser desfeita.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={ () => onOpenChange(false) }
            disabled={ isReverting }
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={ onConfirm }
            disabled={ isReverting }
          >
            {isReverting ? "Excluindo..." : "Confirmar exclusão"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
