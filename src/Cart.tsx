import { useState, useEffect } from "react";
import "./style/cart.css";
import { AxiosRequestConfig, AxiosResponse } from "axios";

interface ProductResponse {
	id: number;
	name: number;
	price: number;
}

interface CartItem {
	productId: number;
	stockSell: number;
}

interface Cart {
	numCart: number;
	userId: number;
	allCarts: CartItem[];
}

interface CartProps {
	fetchData: (
		path: string,
		config?: AxiosRequestConfig,
	) => Promise<AxiosResponse<Cart>>;
	postData: (
		path: string,
		config?: AxiosRequestConfig,
	) => Promise<AxiosResponse<Cart>>;
	userId: number;
}

const Cart = ({ fetchData, postData, userId }: CartProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [cart, setCart] = useState<Cart | null>(null);
	const [numCart, setNumCart] = useState(1);
	const [productNames, setProductNames] = useState<Record<number, string>>(
		{},
	);

	useEffect(() => {
		const getCartData = async () => {
			try {
				const response = await fetchData(
					`shoppingCart/${numCart}/${userId}`,
				);
				setCart(response.data);
			} catch (error) {
				console.error(error);
			}
		};

		getCartData();
	}, []);

	useEffect(() => {
		const fetchProductNames = async () => {
			if (cart) {
				const names: Record<number, string> = {};
				for (const item of cart.allCarts) {
					try {
						const response = await fetchData(
							`products/${item.productId}`,
						);
						names[item.productId] = response.data.name;
					} catch (error) {
						console.error(error);
						names[item.productId] = "N/A";
					}
				}
				setProductNames(names);
			}
		};

		fetchProductNames();
	}, [cart, fetchData]);

	return (
		<div className="cart">
			<img
				src="/images/react.svg"
				className="cartIcon"
				onClick={() => setIsOpen(!isOpen)}
				alt="Cart Icon"
			/>
			{isOpen && (
				<div className="cartItems">
					{cart ? (
						cart.allCarts.length > 0 ? (
							cart.allCarts.map((item) => (
								<div key={item.productId} className="cartItem">
									<p>{productNames[item.productId]}</p>
									<p>Stock: {item.stockSell}</p>
								</div>
							))
						) : (
							<p>No items in the cart.</p>
						)
					) : (
						<p>Loading...</p>
					)}
				</div>
			)}
		</div>
	);
};

export default Cart;
