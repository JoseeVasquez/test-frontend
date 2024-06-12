import React, { createContext, useContext, useState, ReactNode } from "react";
import { CartData } from "./Cart";

interface CartContextType {
	cart: CartData | null;
	setCart: React.Dispatch<React.SetStateAction<CartData | null>>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
	const context = useContext(CartContext);
	if (!context) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
};

interface CartProviderProps {
	children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
	const [cart, setCart] = useState<CartData | null>(null);

	return (
		<CartContext.Provider value={{ cart, setCart }}>
			{children}
		</CartContext.Provider>
	);
};
