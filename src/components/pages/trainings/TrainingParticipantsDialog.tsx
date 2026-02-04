import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Training } from "@/utils/@types/training";
import { BookingPaymentStatusBadge } from "@/components/pages/bookings/common/BookingPaymentStatusBadge";
import { User, GraduationCap, FileText, Phone } from "lucide-react";

interface TrainingParticipantsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  training: Training | null;
}

export function TrainingParticipantsDialog({
  open,
  onOpenChange,
  training,
}: TrainingParticipantsDialogProps) {
  if (!training) return null;

  return (
    <Dialog open={ open } onOpenChange={ onOpenChange }>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            Participantes do Treinamento
          </DialogTitle>
          <DialogDescription>
            Lista completa de alunos e modelos inscritos neste treinamento.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Column 1: Trainees */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wider border-b pb-2">
              <GraduationCap className="h-4 w-4" />
              Alunos ({training.Trainees?.length || 0})
            </h3>

            <div className="space-y-3">
              {training.Trainees && training.Trainees.length > 0 ? (
                training.Trainees.map((trainee) => {
                  const payment = training.TrainingPayment?.find(
                    (p) =>
                      p.payerType === "TRAINEE" &&
                      (p.traineeId === trainee.customerId ||
                        p.customerId === trainee.customerId),
                  );

                  // Correct logic for "Pago" status on partially fully paid
                  const isPartialFullyPaid =
                    payment?.paymentStatus === "Parcial" &&
                    payment?.firstPaymentStatus === "Pago" &&
                    payment?.secondPaymentStatus === "Pago";

                  const status = isPartialFullyPaid
                    ? "Pago"
                    : payment?.paymentStatus || "Pendente";

                  return (
                    <div
                      key={ trainee.customerId }
                      className="p-4 rounded-lg border bg-card/50 flex flex-col gap-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-base">
                            {trainee.fullname}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <FileText className="h-3 w-3" />
                            <span>
                              {trainee.cpf || trainee.cnpj || "Sem documento"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                            <Phone className="h-3 w-3" />
                            <span>{trainee.cellphone || "Sem contato"}</span>
                          </div>
                        </div>
                        <BookingPaymentStatusBadge
                          status={ status }
                          isCourtesy={ payment?.isCourtesy }
                          wasRefunded={ payment?.wasRefunded }
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center border dashed rounded-lg text-muted-foreground text-sm">
                  Nenhum aluno inscrito.
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Volunteers */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wider border-b pb-2">
              <User className="h-4 w-4" />
              Modelos ({training.Volunteers?.length || 0})
            </h3>

            <div className="space-y-3">
              {training.Volunteers && training.Volunteers.length > 0 ? (
                training.Volunteers.map((volunteer) => {
                  const payment = training.TrainingPayment?.find(
                    (p) =>
                      p.payerType === "VOLUNTEER" &&
                      p.volunteerId === volunteer.volunteerId,
                  );

                  // Correct logic for "Pago" status on partially fully paid
                  const isPartialFullyPaid =
                    payment?.paymentStatus === "Parcial" &&
                    payment?.firstPaymentStatus === "Pago" &&
                    payment?.secondPaymentStatus === "Pago";

                  const status = isPartialFullyPaid
                    ? "Pago"
                    : payment?.paymentStatus || "Pendente";

                  return (
                    <div
                      key={ volunteer.volunteerId }
                      className="p-4 rounded-lg border bg-card/50 flex flex-col gap-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-base">
                            {volunteer.name}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <FileText className="h-3 w-3" />
                            <span>
                              {volunteer.documentNumber || "Sem documento"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                            <Phone className="h-3 w-3" />
                            <span>{volunteer.cellphone || "Sem contato"}</span>
                          </div>
                        </div>
                        <BookingPaymentStatusBadge
                          status={ status }
                          isCourtesy={ payment?.isCourtesy }
                          wasRefunded={ payment?.wasRefunded }
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center border dashed rounded-lg text-muted-foreground text-sm">
                  Nenhum modelo inscrito.
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
