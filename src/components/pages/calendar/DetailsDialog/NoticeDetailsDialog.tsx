import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Notice } from "@/utils/@types/notice";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { minutesToHHMM } from "@/utils/minutesToHHMM";
import { Calendar, Clock, User, Building, StickyNote } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface NoticeDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notice: Notice | null;
}

export function NoticeDetailsDialog({
  open,
  onOpenChange,
  notice,
}: NoticeDetailsDialogProps) {
  if (!notice) return null;

  return (
    <Dialog open={ open } onOpenChange={ onOpenChange }>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <StickyNote className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">Detalhes do Aviso</DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          {/* Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg border">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Início
              </span>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">
                  {format(new Date(notice.startDate), "dd/MM/yyyy")}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {minutesToHHMM(notice.startHourInMinutes)}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Fim
              </span>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">
                  {format(new Date(notice.endDate), "dd/MM/yyyy")}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {minutesToHHMM(notice.endHourInMinutes)}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" />
                Filial
              </span>
              <div className="flex flex-col">
                <span
                  className="font-semibold text-sm truncate"
                  title={ notice.filial?.filialName }
                >
                  {notice.filial?.filialName || "-"}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Criado Por
              </span>
              <div className="flex flex-col">
                <span
                  className="font-semibold text-sm truncate"
                  title={ notice.createdBy?.fullname }
                >
                  {notice.createdBy?.fullname || "-"}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase">
              Conteúdo
            </h4>
            <div className="p-4 rounded-lg bg-card border shadow-sm min-h-[120px]">
              <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground">
                {notice.description}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
