"use client";

import { CreateBookingFormSchemaType } from "@/lib/zod/CreateBookingValidation";
import { PaymentModes, PaymentStatuses } from "@/utils/@types/bookings";
import { parseStringToCents } from "@/utils/parseStringToCents";
import { createContext, useContext, useState, type ReactNode } from "react";
import { toast } from "sonner";

interface CartContextType {
  paymentStatus: PaymentStatuses
  paymentMode: PaymentModes
  items: CreateBookingFormSchemaType[]
  addItem: (item: CreateBookingFormSchemaType) => void
  changePaymentStatus: (paymentStatus: PaymentStatuses) => void
  changePaymentModes: (paymentMode: PaymentModes) => void
  removeItem: (id: string) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
  handleCheckout: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [ items, setItems ] = useState<CreateBookingFormSchemaType[]>([
        // {
        //     customer: {
        //         customerId: "cmd400u5r000018wfn10xqhem",
        //         fullname: "Antonio Marcelo Barreto",
        //         documentNumber: "**.***.***/3123-12"
        //     },
        //     gear: {
        //         gearId: "7c4d7883-dedb-477d-9547-2b1d735de56e",
        //         gearName: "Ultraformer"
        //     },
        //     filialId: "cmd1whtk2001018ys2pasxjr8",
        //     gearAmount: 1,
        //     date: new Date("2025-07-25T03:00:00.000Z"),
        //     startHourInMinutes: 300,
        //     totalDuration: 120,
        //     price: "12,33",
        //     bookingStatus: "Pendente",
        //     paymentStatus: "Pendente",
        //     observations: "",
        //     // id: "1753102938860"
        // },
        // {
        //     "customer": {
        //         "customerId": "cmd400u5r000018wfn10xqhem",
        //         "fullname": "Antonio Marcelo Barreto",
        //         "documentNumber": "**.***.***/3123-12"
        //     },
        //     "gear": {
        //         "gearId": "1fb27bf4-2737-4d60-9849-1d1c14e3ecb9",
        //         "gearName": "Ultraformer 2"
        //     },
        //     filialId: "cmd1whtk2001018ys2pasxjr8",
        //     gearAmount: 2,
        //     date: new Date("2025-07-26T03:00:00.000Z"),
        //     startHourInMinutes: 300,
        //     totalDuration: 240,
        //     price: "2,34",
        //     bookingStatus: "Pendente",
        //     paymentStatus: "Pendente",
        //     observations: "",
        //     // id: "1753102949020"
        // },
        // {
        //     customer: {
        //         "customerId": "cmd400u5r000018wfn10xqhem",
        //         "fullname": "Antonio Marcelo Barreto",
        //         "documentNumber": "**.***.***/3123-12"
        //     },
        //     gear: {
        //         "gearId": "21ebd956-29c4-4429-86c5-56376b64b7ba",
        //         "gearName": "Lavieen"
        //     },
        //     filialId: "cmd1whtk2001018ys2pasxjr8",
        //     gearAmount: 2,
        //     date: new Date("2025-07-25T03:00:00.000Z"),
        //     startHourInMinutes: 480,
        //     totalDuration: 120,
        //     price: "12,33",
        //     bookingStatus: "Pendente",
        //     paymentStatus: "Pendente",
        //     observations: "",
        //     // id: "1753102958968"
        // }
    ]
    );

    const [ paymentStatus, setPaymentStatus ] = useState<PaymentStatuses>("Pendente");
    const [ paymentMode, setPaymentMode ] = useState<PaymentModes>("PIX");

    const addItem = (item: CreateBookingFormSchemaType) => {
        setItems((prev) => [ ...prev, { ...item, id: Date.now().toString() } ]);
    };

    const changePaymentStatus = (paymentStatus: PaymentStatuses) => {
        setPaymentStatus(paymentStatus);
    };

    const changePaymentModes = (paymentMode: PaymentModes) => {
        setPaymentMode(paymentMode);
    };

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((item) => item.gear.gearId !== id));
    };

    const clearCart = () => {
        setItems([]);
    };

    const getTotalPrice = () => {
        return items.reduce((total, item) => total + parseStringToCents(item.price), 0);
    };

    const getTotalItems = () => {
        return items.reduce((total, item) => total + item.gearAmount, 0);
    };

    async function handleCheckout() {
        const bookingsArray = items.map(booking => ({ ...booking, price: parseStringToCents(booking.price) }));
        try {
            const response = await fetch("http://localhost:3333/api/bookings/create", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(bookingsArray),
            });
            const data = await response.json();

            if (!response.ok) {
                toast.warning(data.message, { style: { fontSize: "1rem" } });
                window.scroll({ top: 0 });
            } else {
                toast.success("Agendamento criado com sucesso!", {
                    style: { fontSize: "1rem" },
                });
                clearCart();
            }
        } catch {
            toast.error("Erro ao criar agendamento.");
        }
    }

    // useEffect(() => {
    //     console.log("items: ", items);
    // }, [ items ]);

    return (
        <CartContext.Provider
            value={ {
                items,
                addItem,
                removeItem,
                clearCart,
                getTotalPrice,
                getTotalItems,
                handleCheckout,
                changePaymentStatus,
                changePaymentModes,
                paymentMode,
                paymentStatus
            } }
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
