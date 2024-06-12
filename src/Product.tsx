import { AxiosRequestConfig, AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import "./style/product.css";
import { useCart } from "./CartContext";
import { CartItem } from "./Cart";

export interface ProductResponse {
	id: number;
	name: number;
	price: number;
}

interface ProductProps {
	fetchData: <T>(path: string) => Promise<AxiosResponse<T[]>>;
	postData: <T, D = unknown>(
		path: string,
		data: D,
		config?: AxiosRequestConfig,
	) => Promise<AxiosResponse<T>>;
	userId: number;
}

const Product = ({ fetchData, postData, userId }: ProductProps) => {
	const [products, setProducts] = useState<ProductResponse[]>();
	const { setCart } = useCart();
	const numCart = 1;

	const addToCart = async (id: number) => {
		try {
			const res = await postData<CartItem>("shoppingCart", {
				numCart: numCart,
				userId: userId,
				productId: id,
				stockSell: 1,
			});
			setCart((prevState) => {
				if (!prevState) return null;
				return {
					...prevState,
					allCarts: [...prevState.allCarts, res.data],
				};
			});
		} catch (e) {
			console.error(e);
		}
	};

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const response = await fetchData<ProductResponse>("products");
				setProducts(response.data);
			} catch (err) {
				console.error(err);
			}
		};

		fetchProducts();
	}, []);

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
