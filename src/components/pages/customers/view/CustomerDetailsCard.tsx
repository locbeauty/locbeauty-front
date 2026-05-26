import {
  Building,
  Clock,
  Ellipsis,
  FileText,
  Instagram,
  Mail,
  MapPin,
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
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Identity Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Identificação
            </h3>
            <div className="space-y-3">
              {selectedCustomer?.companyName && (
                <div className="flex items-start gap-3">
                  <Building className="h-4 w-4 text-primary mt-1 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-muted-foreground">
                      Nome da empresa
                    </span>
                    <span
                      className="font-medium truncate"
                      title={ selectedCustomer.companyName }
                    >
                      {selectedCustomer.companyName}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-primary mt-1 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-muted-foreground">
                    Nome do Responsável
                  </span>
                  <span
                    className="font-medium truncate"
                    title={ selectedCustomer?.fullname }
                  >
                    {selectedCustomer?.fullname}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building className="h-4 w-4 text-primary mt-1 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-muted-foreground">
                    Filial
                  </span>
                  <span className="truncate">
                    {selectedCustomer?.SourceFilial?.filialName}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 text-primary mt-1 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-muted-foreground">
                    CPF
                  </span>
                  <span className="font-mono truncate">
                    {selectedCustomer?.cpf || "--"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 text-primary mt-1 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-muted-foreground">
                    CNPJ
                  </span>
                  <span className="font-mono truncate">
                    {selectedCustomer?.cnpj || "--"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-primary mt-1 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-muted-foreground">
                    Data de nascimento
                  </span>
                  <span className="font-mono">
                    {selectedCustomer?.birthdate
                      ? format(
                        new Date(
                          new Date(selectedCustomer.birthdate).getTime() +
                              new Date(
                                selectedCustomer.birthdate,
                              ).getTimezoneOffset() *
                                60000,
                        ),
                        "dd/MM/yyyy",
                      )
                      : "Não informado"}
                  </span>
                </div>
              </div>

              {selectedCustomer && (
                <div className="flex items-start gap-3">
                  <Ellipsis className="h-4 w-4 text-primary mt-1 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-muted-foreground">
                      Status
                    </span>
                    <div className="pt-1">
                      <CustomerStatusBadge
                        status={ selectedCustomer.customerStatus }
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {selectedCustomer?.observations && (
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-primary mt-1 shrink-0" />
                  <div className="flex flex-col min-w-0 w-full">
                    <span className="text-sm font-medium text-muted-foreground">
                      Observações
                    </span>
                    <p className="text-sm whitespace-pre-wrap text-foreground mt-1">
                      {selectedCustomer.observations}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Contact Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Contato
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-primary mt-1 shrink-0" />
                <div className="flex flex-col min-w-0 w-full">
                  <span className="text-sm font-medium text-muted-foreground">
                    Email
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span
                      className="text-blue-600 truncate block"
                      title={ selectedCustomer?.email || "" }
                    >
                      {selectedCustomer?.email || "--"}
                      {selectedCustomer?.emailDescription && (
                        <span className="text-muted-foreground text-xs ml-1 font-normal">
                          ({selectedCustomer.emailDescription})
                        </span>
                      )}
                    </span>
                    {selectedCustomer?.secondaryEmail && (
                      <span
                        className="text-blue-600 text-sm truncate block mt-0.5"
                        title={ selectedCustomer.secondaryEmail }
                      >
                        {selectedCustomer.secondaryEmail}
                        {selectedCustomer?.secondaryEmailDescription && (
                          <span className="text-muted-foreground text-xs ml-1 font-normal">
                            ({selectedCustomer.secondaryEmailDescription})
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-primary mt-1 shrink-0" />
                <div className="flex flex-col min-w-0 w-full">
                  <span className="text-sm font-medium text-muted-foreground">
                    Telefone
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="truncate block">
                      {selectedCustomer?.cellphone || "--"}
                      {selectedCustomer?.cellphoneDescription && (
                        <span className="text-muted-foreground text-xs ml-1 font-normal">
                          ({selectedCustomer.cellphoneDescription})
                        </span>
                      )}
                    </span>
                    {selectedCustomer?.secondaryCellphone && (
                      <span className="text-sm truncate block mt-0.5">
                        {selectedCustomer.secondaryCellphone}
                        {selectedCustomer?.secondaryCellphoneDescription && (
                          <span className="text-muted-foreground text-xs ml-1 font-normal">
                            ({selectedCustomer.secondaryCellphoneDescription})
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {selectedCustomer?.instagram && (
                <div className="flex items-start gap-3">
                  <Instagram className="h-4 w-4 text-primary mt-1 shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-muted-foreground">
                      Instagram
                    </span>
                    <span className="truncate text-blue-600">
                      {selectedCustomer.instagram.startsWith("@")
                        ? selectedCustomer.instagram
                        : `@${selectedCustomer.instagram}`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedCustomer?.Addresses &&
          selectedCustomer.Addresses.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Endereços
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedCustomer.Addresses.map((address) => (
                  <div
                    key={ address.addressId }
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card text-card-foreground shadow-sm"
                  >
                    <MapPin className="h-4 w-4 text-primary mt-1 shrink-0" />
                    <div className="flex flex-col min-w-0 text-sm">
                      <span className="font-medium truncate">
                        {address.street}, {address.buildingNumber}
                      </span>
                      {address.addressComplement && (
                        <span className="text-muted-foreground truncate">
                          {address.addressComplement}
                        </span>
                      )}
                      <span className="text-muted-foreground truncate">
                        {address.neighborhood} - {address.city}/
                        {address.state}
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                          CEP: {address.zipCode}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />

        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded-md">
          <Clock className="h-3 w-3" />
          <span>
            Última atualização / registro no sistema:{" "}
            {selectedCustomer?.lastBooking
              ? new Date(selectedCustomer.lastBooking).toLocaleString()
              : "Nenhuma atividade recente"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
