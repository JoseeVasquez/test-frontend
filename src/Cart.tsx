import { useState, useEffect, useRef } from "react";
import "./style/cart.css";
import { AxiosRequestConfig, AxiosResponse } from "axios";
import { useCart } from "./CartContext";
import { useOutsideClick } from "./hooks/useOutsideClick";

interface ProductResponse {
	id: number;
	name: string;
	price: number;
}

interface CartItem {
	productId: number;
	stockSell: number;
}

export interface CartData {
	numCart: number;
	userId: number;
	allCarts: CartItem[];
	totalPrices: number;
}

interface CartProps {
	fetchData: <T>(
		path: string,
		config?: AxiosRequestConfig,
	) => Promise<AxiosResponse<T>>;
	postData: <T, D = unknown>(
		path: string,
		data?: D,
		config?: AxiosRequestConfig,
	) => Promise<AxiosResponse<T>>;
	deleteData: <T>(
		path: string,
		config?: AxiosRequestConfig,
	) => Promise<AxiosResponse<T>>;
	userId: number;
}
const Cart = ({ fetchData, postData, deleteData, userId }: CartProps) => {
	const { cart, setCart } = useCart();
	const [isOpen, setIsOpen] = useState(false);
	const [products, setProducts] = useState<ProductResponse[]>([]);
	const [total, setTotal] = useState<number>();
	const numCart = 1;

	const ref = useOutsideClick(() => {
		setIsOpen(false);
	});

	const getProductPrice = (p: number): number => {
		const product = products.find((product) => product.id === p);
		return product ? product.price : 0;
	};

	const calculateTotal = () => {
		if (cart && products.length) {
			const totalPrice = cart.allCarts.reduce((sum, item) => {
				const productPrice = getProductPrice(item.productId);
				return sum + item.stockSell * productPrice;
			}, 0);
			setTotal(parseFloat(totalPrice.toFixed(2)));
		}
	};

	const deleteProduct = async (id: number) => {
		try {
			const res = await deleteData<undefined>(
				`shoppingCart/${numCart}/${userId}`,
				{
					params: {
						productId: id,
					},
				},
			);

			setCart((prevCart: CartData | null) => {
				if (!prevCart) return prevCart;

				const updatedCarts = prevCart.allCarts.filter(
					(cartItem) => cartItem.productId !== id,
				);

				return {
					...prevCart,
					allCarts: updatedCarts,
				};
			});
			console.log(res);
			return;
		} catch (error) {
			console.error(error);
		}
	};

	const updateAmount = async (id: number, increase: boolean) => {
		console.log(id, increase);
		try {
			if (!increase) {
				const currentItem = cart?.allCarts.find(
					(item) => item.productId === id,
				);

				if (currentItem && currentItem.stockSell === 1) {
					// If stockSell is 1 and we're decreasing, delete the item from the cart
					deleteProduct(id);
				}
			}

			// Call postData for both increasing and decreasing
			const res = await postData<CartItem>(
				`shoppingCart/${numCart}/${increase ? "increase" : "decrease"}/${userId}`,
				null,
				{
					params: {
						productId: id,
						amount: 1,
					},
				},
			);
			console.log(res);

			// Update the cart state
			setCart((prevCart: CartData | null) => {
				if (!prevCart) return prevCart;

				const updatedCarts = prevCart.allCarts.map((cartItem) => {
					if (cartItem.productId === id) {
						return {
							...cartItem,
							stockSell: increase
								? cartItem.stockSell + 1
								: cartItem.stockSell - 1,
						};
					}
					return cartItem;
				});

				return {
					...prevCart,
					allCarts: updatedCarts,
				};
			});
		} catch (e) {
			console.error(e);
		}
	};

	const clearCart = async () => {
		try {
			await deleteData(`shoppingCart/${numCart}/clear/${userId}`);
			setCart((prevCart) => ({
				...prevCart!,
				allCarts: [],
			}));
			setProducts([]);
			setTotal(0);
		} catch (e) {
			throw e;
		}
	};

	const getCartData = async () => {
		try {
			const response = await fetchData<CartData>(
				`shoppingCart/${numCart}/${userId}`,
			);
			console.log(response.data);
			setCart(response.data);
		} catch (error) {
			console.error(error);
		}
	};

	const fetchProductData = async () => {
		if (cart) {
			const productRequests = cart.allCarts.map((item) =>
				fetchData<ProductResponse>(`products/${item.productId}`),
			);
			try {
				const responses = await Promise.all(productRequests);
				const products = responses.map((response) => response.data);
				console.log(products);
				setProducts(products);
			} catch (error) {
				console.error(error);
			}
		}
	};

	useEffect(() => {
		getCartData();
	}, []);

	useEffect(() => {
		fetchProductData();
	}, [cart]);

	useEffect(() => {
		calculateTotal();
	}, [cart, products]);

	return (
		<div ref={ref} className={`cart ${isOpen ? "open" : ""}`}>
			<img
				src="/images/react.svg"
				className="cartIcon"
				onClick={() => setIsOpen(!isOpen)}
				alt="CartData Icon"
			/>
			<div className="cartItems">
				{cart ? (
					cart.allCarts.length > 0 ? (
						cart.allCarts.map((item) => {
							const product = products.find(
								(p) => p.id === item.productId,
							);
							return (
								<div
									key={item.productId}
									className={`cartItem ${isOpen ? "open" : ""}`}
								>
									<h2>{product?.name}</h2>
									<span
										className="deleteBtn"
										onClick={() =>
											deleteProduct(item.productId)
										}
									>
										D
									</span>
									<p>Price: {product?.price.toFixed(2)}</p>
									<div className="amountContainer">
										<button
											type="button"
											className="updateStock decrease"
											onClick={() =>
												updateAmount(
													item.productId,
													false,
												)
											}
										>
											{"-"}
										</button>
										<span>{item.stockSell}</span>
										<button
											type="button"
											className="updateStock increase"
											onClick={() =>
												updateAmount(
													item.productId,
													true,
												)
											}
										>
											{"+"}
										</button>
									</div>
								</div>
							);
						})
					) : (
						<p
							className={`cartPlaceHolder ${isOpen ? "open" : ""}`}
						>
							CartData Empty
						</p>
					)
				) : (
					<p className={`cartPlaceHolder ${isOpen ? "open" : ""}`}>
						CartData Empty
					</p>
				)}
				<span className={`total ${isOpen ? "open" : ""}`}>
					Total: {total}
				</span>
				<button
					type="button"
					className={`clearCart ${isOpen ? "open" : ""}`}
					onClick={clearCart}
				>
					Clear cart
				</button>
			</div>
		</div>
	);
};

export default Cart;
