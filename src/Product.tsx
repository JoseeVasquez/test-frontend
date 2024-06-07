import { AxiosResponse } from "axios";
import { useState } from "react";

interface ProductResponse {
	id: number;
	name: number;
	price: number;
}

interface ProductProps {
	fetchData: (path: string) => Promise<AxiosResponse<ProductResponse[]>>;
}

const Product = ({ fetchData }: ProductProps) => {
	const [products, setProducts] = useState<ProductResponse[]>();

	const handleGet = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		try {
			const response = await fetchData("products");
			setProducts(response.data);
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<>
			<button type="button" onClick={handleGet}>
				Get products
			</button>
			{products?.map((product) => {
				return (
					<article key={product.id}>
						<h2>{product.name}</h2>
						<span>{product.name}</span>
						<br />
						<span>{product.price}</span>
					</article>
				);
			})}
		</>
	);
};

export default Product;
