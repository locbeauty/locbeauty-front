"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUp, Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SelectFilial } from "@/components/shared/SelectFilial";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/auth-provider";
import { useAccess } from "@/contexts/access-provider";
import { USER_ROLES } from "@/utils/constants";
import { SYSTEM_MODULES } from "@/utils/@types/access";
import { ImportCustomers } from "@/services/customers.service";
import { queryClient } from "@/app/(main)/layout";

interface ImportCustomersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportCustomersDialog({
  open,
  onOpenChange,
}: ImportCustomersDialogProps) {
  const [ file, setFile ] = useState<File | null>(null);
  const [ isSubmitting, setIsSubmitting ] = useState(false);
  const { user } = useAuth();
  const { getAccessibleFilialsForCreate } = useAccess();

  const accessibleFilialsObjects =
    user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER
      ? []
      : getAccessibleFilialsForCreate(SYSTEM_MODULES.CUSTOMERS);

  const accessibleFilialsIds =
    accessibleFilialsObjects.length > 0
      ? accessibleFilialsObjects.map((f) => f.filialId)
      : user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MASTER
        ? undefined
        : [];

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      filialId: user?.sourceFilial.filialId,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const downloadTemplate = () => {
    // Create a simple CSV template
    const headers = [
      "Nome",
      "CPF/CNPJ",
      "Email",
      "Celular",
      "Instagram",
      "Aniversário",
      "Empresa",
      "Último agendamento",
    ];
    const rows = [
      [
        "Exemplo Silva",
        "12345678901",
        "exemplo@email.com",
        "11999999999",
        "@exemplosilva",
        "1990-01-01",
        "Empresa Exemplo",
        "2023-01-01",
      ],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_importacao_clientes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

    const formData = new FormData();
    formData.append("file", file);
    formData.append("filialId", data.filialId);

    try {
      const response = await ImportCustomers(formData);

      if (response.successCount !== undefined) {
        toast.success(
          `Importação concluída! Sucesso: ${response.successCount}, Falhas: ${response.failedCount}`
        );
        if (response.errors && response.errors.length > 0) {
          console.error("Import Errors:", response.errors);
          toast.error(
            "Alguns registros falharam. Verifique o console para detalhes."
          );
        }
        queryClient.invalidateQueries({ queryKey: [ "get-all-customers" ] });
        onOpenChange(false);
        setFile(null);
        reset();
      } else {
        toast.error(response.message || "Erro ao importar clientes.");
      }
    } catch (error) {
      toast.error("Erro ao processar importação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={ open } onOpenChange={ onOpenChange }>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Importar Clientes em Massa</DialogTitle>
          <DialogDescription>
            Selecione a filial e o arquivo Excel/CSV para importar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={ handleSubmit(onSubmit) } className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Filial de Destino</Label>
            <SelectFilial
              control={ control }
              name="filialId"
              accessibleFilials={ accessibleFilialsIds }
              defaultFilial={ user?.sourceFilial.filialId }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Arquivo de Importação</Label>
            <div className="flex gap-2">
              <Input
                id="file"
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={ handleFileChange }
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={ downloadTemplate }
            >
              <Download className="mr-2 h-4 w-4" /> Baixar Modelo CSV
            </Button>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={ isSubmitting }>
              {isSubmitting ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <FileUp className="mr-2 h-4 w-4" />
              )}
              Importar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
