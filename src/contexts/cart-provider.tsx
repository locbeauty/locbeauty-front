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
    const [ items, setItems ] = useState<CreateBookingFormSchemaType[]>([]
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
