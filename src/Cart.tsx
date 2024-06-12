import { useState, useEffect } from "react";
import "./style/cart.css";
import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { useCart } from "./CartContext";
import { useOutsideClick } from "./hooks/useOutsideClick";
import { ProductResponse } from "./Product";

export interface CartItem {
	productId: number;
	stockSell: number;
}

export interface CartData {
	numCart: number;
	userId: number;
	allCarts: CartItem[];
	totalPrices: number;
}

export interface InvoiceData {
	id: number;
	userId: number;
	invoiceDate: Date;
	totalPrice: number;
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

	const handleCheckout = async () => {
		try {
			// create the invoice
			const invoiceRes = await postData<InvoiceData>(
				`invoice/${numCart}/user/${userId}`,
			);

			// retrieve the pdf blob
			const invoice = invoiceRes.data;
			const res = await fetchData<Blob>(`invoice/${invoice.id}`, {
				responseType: "blob",
			});

			// create blob from that
			const blob = new Blob([res.data], { type: "application/json" });

			// create link
			const link = document.createElement("a");
			link.href = window.URL.createObjectURL(blob);
			link.download = "invoice.pdf";

			// clicks the link and then removes it
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			window.location.reload();

			console.log(res.data);
		} catch (error) {
			console.error(error);
		}
	};

	const ref = useOutsideClick(() => {
		setIsOpen(false);
	});

	const calculateTotal = () => {
		if (cart && products.length) {
			const totalPrice = cart.allCarts.reduce((sum, item) => {
				const product = products.find(
					(product) => product.id === item.productId,
				);
				const vat = product ? product?.vat / 100 : 0;
				return product
					? (product.price + product.price * vat) * item.stockSell +
							sum
					: 0;
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
			const e: AxiosError = error as AxiosError;
			if (e.response && e.response.status === 404) {
				// Handle the case where the cart is empty
				setCart({ numCart, userId, allCarts: [], totalPrices: 0 });
			} else {
				console.error(error);
			}
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
				src="/images/shopping-cart-01-svgrepo-com.svg"
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

							const vatPer = product ? product.vat / 100 : 0;
							const price = product
								? product.price + product.price * vatPer
								: 0;
							return (
								<div
									key={item.productId}
									className={`cartItem ${isOpen ? "open" : ""}`}
								>
									<h2>{product?.name}</h2>
									<img
										src="/images/delete-svgrepo-com.svg"
										className="deleteBtn"
										onClick={() =>
											deleteProduct(item.productId)
										}
									/>
									<p>Price: {price}</p>
									<p>
										Total price:{" "}
										{(price * item.stockSell).toFixed(2)}
									</p>
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
				<button
					type="button"
					className={`checkout button ${isOpen ? "open" : ""}`}
					onClick={() => handleCheckout()}
				>
					Checkout
				</button>
			</div>
		</div>
	);
};

export default Cart;
