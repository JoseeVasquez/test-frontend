import { AxiosRequestConfig, AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import "./style/product.css";

interface ProductResponse {
	id: number;
	name: number;
	price: number;
}

interface ProductProps {
	fetchData: (path: string) => Promise<AxiosResponse<ProductResponse[]>>;
	postData: (
		path: string,
		config?: AxiosRequestConfig,
	) => Promise<AxiosResponse<ProductResponse>>;
}

const Product = ({ fetchData }: ProductProps) => {
	const [products, setProducts] = useState<ProductResponse[]>();

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const response = await fetchData("products");
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
						<p>{product.name}</p>
						<p className="price">{product.price}</p>
						<button type="button" className="button add">
							Add to cart
						</button>
					</article>
				);
			})}
		</div>
	);
};

export default Product;
