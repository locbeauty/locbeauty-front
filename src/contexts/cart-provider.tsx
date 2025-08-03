"use client";

import { CreateBookingFormSchemaType, CustomBookingFormSchemaType } from "@/lib/zod/CreateBookingValidation";
import { PaymentModes, PaymentStatuses } from "@/utils/@types/bookings";
import { parseStringToCents } from "@/utils/parseStringToCents";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

interface CartContextType {
  paymentStatus: PaymentStatuses
  paymentMode: PaymentModes
  items: CustomBookingFormSchemaType[]
  addItem: (item: CreateBookingFormSchemaType) => void
  changePaymentStatus: (paymentStatus: PaymentStatuses) => void
  changePaymentMode: (paymentMode: PaymentModes) => void
  removeItem: (id: string) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
  handleCheckout: () => void
  partialPaymentValue: string,
  changePartialPaymentValue: (value: string) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [ items, setItems ] = useState<CustomBookingFormSchemaType[]>([
        // {
        //     customer: {
        //         customerId: "cmdiregdv000018ylygtzx83o",
        //         fullname: "Antonio Marcelo Barreto",
        //         documentNumber: "***.***.864-99",
        //     },
        //     gear: {
        //         gearId: "813626b8-04ef-4e44-8544-ee1e0302e4fd",
        //         gearName: "depilador"
        //     },
        //     filialId: "cmdis1kod0000183a1ud1w2f6",
        //     gearAmount: 1,
        //     date: new Date("2025-07-30T03:00:00.000Z"),
        //     startHourInMinutes: 300,
        //     totalDurationInMinutes: 240,
        //     price: 333331,
        //     bookingStatus: "Pendente",
        //     paymentStatus: "Pendente",
        //     observations: "",
        //     addressId: "cmdiregeh000118ylaj5pl9w6",
        //     // id: "1753833685193"
        // }
    ]
    );

    const [ paymentStatus, setPaymentStatus ] = useState<PaymentStatuses>("Pendente");
    const [ paymentMode, setPaymentMode ] = useState<PaymentModes | undefined>(undefined);
    const [ partialPaymentValue, setPartialPaymentValue ] = useState("0");

    const addItem = (item: CreateBookingFormSchemaType) => {
        setItems((prev) => [ ...prev, { ...item, id: Date.now().toString(), price: parseStringToCents(item.price) } ]);
    };

    const changePartialPaymentValue = (value: string) => {
        setPartialPaymentValue(value);
    };

    const changePaymentStatus = (paymentStatus: PaymentStatuses) => {
        setPaymentStatus(paymentStatus);
    };

    const changePaymentMode = (paymentMode: PaymentModes) => {
        setPaymentMode(paymentMode);
    };

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((item) => item.gear.gearId !== id));
    };

    const clearCart = () => {
        setItems([]);
    };

    const getTotalPrice = () => {
        return items.reduce((total, item) => total + item.price, 0);
    };

    const getTotalItems = () => {
        return items.reduce((total, item) => total + item.gearAmount, 0);
    };

    async function handleCheckout() {
        try {
            const response = await fetch("http://localhost:3333/api/bookings/create", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(items),
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

    useEffect(() => {
        console.log("items: ", items);
    }, [ items ]);

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
                changePaymentMode,
                paymentMode,
                paymentStatus,
                partialPaymentValue,
                changePartialPaymentValue
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
