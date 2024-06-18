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
}

const Product = ({ fetchData, postData, userId, arg }: ProductProps) => {
	const [products, setProducts] = useState<ProductResponse[]>();
	const { setCart } = useCart();
	const numCart = 1;

	const addToCart = async (id: number) => {
		console.log(userId);
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
			const config: AxiosRequestConfig = arg
				? { params: { arg: arg } }
				: {};
			console.log(config);
			await fetchData<ProductResponse>("products", config)
				.then((res) => {
					setProducts(res.data);
				})
				.catch((err: AxiosError) => console.error(err));
		};

		fetchProducts();
	}, [arg]);

	return (
		<div className="productContainer">
			{products?.map((product) => {
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
			})}
		</div>
	);
};

export default Product;
