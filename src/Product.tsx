import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import "./style/product.css";
import { useCart } from "./CartContext";
import { CartItem } from "./Cart";

export interface ProductResponse {
	id: number;
	name: number;
	price: number;
	vat: number;
}

interface ProductProps {
	fetchData: <T>(
		path: string,
		config?: AxiosRequestConfig,
	) => Promise<AxiosResponse<T[]>>;
	postData: <T, D = unknown>(
		path: string,
		data: D,
		config?: AxiosRequestConfig,
	) => Promise<AxiosResponse<T>>;
	userId: number | undefined;
	arg: string | null;
	category: string | null;
}

export interface CategoryData {
	id: number;
	name: string;
}

const Product = ({
	fetchData,
	postData,
	userId,
	arg,
	category,
}: ProductProps) => {
	const [products, setProducts] = useState<ProductResponse[]>();
	const { setCart } = useCart();
	const numCart = 1;

	const addToCart = async (id: number) => {
		await postData<CartItem>("shoppingCart", {
			numCart: numCart,
			userId: userId,
			productId: id,
			stockSell: 1,
		})
			.then((res) => {
				setCart((prevState) => {
					if (!prevState) return null;
					return {
						...prevState,
						allCarts: [...prevState.allCarts, res.data],
					};
				});
			})
			.catch((err: AxiosError) => {
				switch (err.response?.status) {
					case 409:
						window.alert("That product is already in the cart");
						break;
					default:
						console.error(err);
				}
			});
	};

	useEffect(() => {
		const fetchProducts = async () => {
			const path: string =
				category && !arg ? "products/term" : "products";
			let config: AxiosRequestConfig = {};
			if (arg) {
				config = { params: { arg: arg } };
			} else if (!arg && category) {
				config = { params: { category } };
			} else {
				config = {};
			}
			await fetchData<ProductResponse>(path, config)
				.then((res) => {
					setProducts(res.data);
				})
				.catch((err: AxiosError) => {
					switch (err.response?.status) {
						case 404:
							setProducts([]);
							break;
						default:
							console.error(err);
							break;
					}
				});
		};

		fetchProducts();
	}, [arg, category]);

	return (
		<div className="productContainer">
			{(products?.length as number) > 0 ? (
				products?.map((product) => {
					return (
						<article className="product" key={product.id}>
							<h2>{product.name}</h2>
							<p className="price">{product.price}</p>
							<button
								type="button"
								className="button add"
								onClick={() => addToCart(product.id)}
							>
								Add to cart
							</button>
						</article>
					);
				})
			) : (
				<h2>No products found</h2>
			)}
		</div>
	);
};

export default Product;
