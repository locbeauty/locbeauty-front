import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Employee } from "@/utils/@types/employee";
import { AccessControlManager } from "./AccessControlManager";
import { ShieldCheck } from "lucide-react";

interface AccessControlDialogProps {
  employee: Employee;
}

export function AccessControlDialog({ employee }: AccessControlDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 w-full justify-start border-dashed"
        >
          <ShieldCheck className="h-4 w-4" />
          Gerenciar Acessos e Permissões
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Gerenciar Acessos: {employee.fullname}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto py-4">
          <AccessControlManager employee={ employee } />
        </div>
      </DialogContent>
    </Dialog>
  );
}
