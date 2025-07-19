"use client";

import { CreateBookingFormSchemaType } from "@/lib/zod/CreateBookingValidation";
import { parseStringToCents } from "@/utils/parseStringToCents";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface CartContextType {
  items: CreateBookingFormSchemaType[]
  addItem: (item: CreateBookingFormSchemaType) => void
  removeItem: (id: string) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [ items, setItems ] = useState<CreateBookingFormSchemaType[]>([]);

    const addItem = (item: CreateBookingFormSchemaType) => {
        setItems((prev) => [ ...prev, { ...item, id: Date.now().toString() } ]);
    };

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((item) => item.gearId !== id));
    };

    const clearCart = () => {
        setItems([]);
    };

    const getTotalPrice = () => {
        return items.reduce((total, item) => total + parseStringToCents(item.price) * item.gearAmount, 0);
    };

    const getTotalItems = () => {
        return items.reduce((total, item) => total + item.gearAmount, 0);
    };

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
