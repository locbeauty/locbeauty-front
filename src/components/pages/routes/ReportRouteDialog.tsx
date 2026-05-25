"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateCheckout } from "@/services/checkouts.service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ReportRouteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checkoutId: string;
  customerName?: string;
}

export function ReportRouteDialog({
  open,
  onOpenChange,
  checkoutId,
  customerName,
}: ReportRouteDialogProps) {
  const [ observation, setObservation ] = useState("");
  const queryClient = useQueryClient();

  const { mutate: sendReport, isPending } = useMutation({
    mutationFn: () =>
      UpdateCheckout({
        checkoutId,
        body: { observations: observation },
      }),
    onSuccess: () => {
      toast.success("Ocorrência reportada com sucesso!");
      queryClient.invalidateQueries({ queryKey: [ "checkout", checkoutId ] });
      setObservation("");
      onOpenChange(false);
    },
    onError: () => toast.error("Erro ao reportar ocorrência. Tente novamente."),
  });

  function handleSubmit() {
    if (!observation.trim()) {
      toast.error("Descreva a ocorrência antes de enviar.");
      return;
    }
    sendReport();
  }

  return (
    <Dialog open={ open } onOpenChange={ onOpenChange }>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reportar Ocorrência</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {customerName && (
            <p className="text-sm text-muted-foreground">
              Rota: <span className="font-medium text-foreground">{customerName}</span>
            </p>
          )}
          <div className="space-y-1.5">
            <Label>Descreva a ocorrência</Label>
            <Textarea
              placeholder="Ex: Endereço não encontrado, cliente ausente, problema no veículo..."
              value={ observation }
              onChange={ (e) => setObservation(e.target.value) }
              rows={ 4 }
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={ () => onOpenChange(false) } disabled={ isPending }>
            Cancelar
          </Button>
          <Button onClick={ handleSubmit } disabled={ isPending }>
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Enviar Relatório
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
