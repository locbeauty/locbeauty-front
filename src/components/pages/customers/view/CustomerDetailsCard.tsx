import {
  Clock,
  Ellipsis,
  FileText,
  Instagram,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";
import { CustomerStatusBadge } from "@/components/shared/CustomerStatusBadge";
import { Customer } from "@/utils/@types/customer";
import { format } from "date-fns";

interface CustomerDetailsCardProps {
  selectedCustomer: Customer | null;
}

export function CustomerDetailsCard({
  selectedCustomer,
}: CustomerDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Informações Pessoais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Nome do Responsável</span>
              <span>{selectedCustomer?.companyName}</span>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Filial:</span>
              <span>{selectedCustomer?.SourceFilial.filialName}</span>
            </div>

            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Número do documento:</span>
              <span className="font-mono">
                {selectedCustomer?.documentNumber}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Data de nascimento:</span>
              <span className="font-mono">
                {selectedCustomer?.birthdate
                  ? format(new Date(selectedCustomer.birthdate), "dd/MM/yyyy")
                  : "Não informado"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex flex-col">
                  <span className="font-medium">Email:</span>
                  <div className="flex flex-col">
                    <span className="text-blue-600">
                      {selectedCustomer?.email}{" "}
                      {selectedCustomer?.emailDescription && (
                        <span className="text-muted-foreground text-xs">
                          ({selectedCustomer.emailDescription})
                        </span>
                      )}
                    </span>
                    {selectedCustomer?.secondaryEmail && (
                      <span className="text-blue-600 text-sm">
                        {selectedCustomer.secondaryEmail}{" "}
                        {selectedCustomer?.secondaryEmailDescription && (
                          <span className="text-muted-foreground text-xs">
                            ({selectedCustomer.secondaryEmailDescription})
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex flex-col">
                  <span className="font-medium">Telefone:</span>
                  <div className="flex flex-col">
                    <span>
                      {selectedCustomer?.cellphone}{" "}
                      {selectedCustomer?.cellphoneDescription && (
                        <span className="text-muted-foreground text-xs">
                          ({selectedCustomer.cellphoneDescription})
                        </span>
                      )}
                    </span>
                    {selectedCustomer?.secondaryCellphone && (
                      <span className="text-sm">
                        {selectedCustomer.secondaryCellphone}{" "}
                        {selectedCustomer?.secondaryCellphoneDescription && (
                          <span className="text-muted-foreground text-xs">
                            ({selectedCustomer.secondaryCellphoneDescription})
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Instagram:</span>
              <span>
                {selectedCustomer?.instagram
                  ? selectedCustomer.instagram.startsWith("@")
                    ? selectedCustomer.instagram
                    : `@${selectedCustomer.instagram}`
                  : ""}
              </span>
            </div>

            {selectedCustomer && (
              <div className="flex items-center gap-2">
                <Ellipsis className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Status:</span>
                <CustomerStatusBadge status={ selectedCustomer.customerStatus } />
              </div>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            Último registro:{" "}
            {selectedCustomer?.lastBooking
              ? new Date(selectedCustomer?.lastBooking).toLocaleString()
              : "Não informado"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
