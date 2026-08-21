import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
    medicine_id: string;
    name: string;
    price: number;
    mrp: number;
    quantity: number;
    prescription_required: boolean;
    image_url?: string;
}

interface CartContextType { 
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (medicine_id: string) => void;
    updateQuantity: (medicine_id: string, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
    requiresPrescription: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useState<CartItem[]>([]);

    const addToCart = (item: CartItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.medicine_id === item.medicine_id);
            if (existing) {
                return prev.map(i => i.medicine_id === item.medicine_id ? { ...i, quantity: i.quantity + item.quantity } : i);
            }
            return [...prev, item];
        });
    };

    const removeFromCart = (medicine_id: string) => {
        setCart(prev => prev.filter(i => i.medicine_id !== medicine_id));
    };

    const updateQuantity = (medicine_id: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(medicine_id);
            return;
        }
        setCart(prev => prev.map(i => i.medicine_id === medicine_id ? { ...i, quantity } : i));
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const requiresPrescription = cart.some(item => item.prescription_required);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, requiresPrescription }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
