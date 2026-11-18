import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Customer } from "@/utils/@types/customer";

interface NewCustomerSinceProps {
  customer: Customer;
  className?: string;
}

/**
 * Data que coloca o cliente em "Novos do mês": a primeira locação ou, para
 * quem ainda não locou, o cadastro.
 */
export function NewCustomerSince({ customer, className }: NewCustomerSinceProps) {
  let date = format(new Date(customer.createdAt), "dd/MM/yyyy");
  let reason = "cadastro";

  if (customer.firstBooking) {
    // Campo só-dia, gravado à meia-noite (UTC ou Brasília): o dia UTC é o
    // mesmo nos dois casos, já o fuso local mostraria o dia anterior.
    date = new Date(customer.firstBooking).toLocaleDateString("pt-BR", {
      timeZone: "UTC",
    });
    reason = "1ª locação";
  }

  return (
    <div className={ cn("flex flex-col", className) }>
      <span>{date}</span>
      <span className="text-xs text-muted-foreground">{reason}</span>
    </div>
  );
}
