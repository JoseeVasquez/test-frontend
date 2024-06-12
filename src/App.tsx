import { useState } from "react";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import Form from "./Form";
import Product from "./Product";
import Navbar from "./Navbar";
import Cart from "./Cart";
import "./style/main.css";
import { CartProvider } from "./CartContext";

export interface ErrorResponse {
	message: string;
	status: number;
}

const App = () => {
	const [jwtToken, setJwtToken] = useState<string | null>(
		localStorage.getItem("jwtToken"),
	);
	const [isAuthenticated, setIsAuthenticated] = useState(
		Boolean(localStorage.getItem("jwtToken")),
	);
	const baseUrl: string = "http://localhost:8080/";

	const handleJwt = (jwt: string, auth: boolean) => {
		localStorage.setItem("jwtToken", jwt);
		setJwtToken(jwt);
		setIsAuthenticated(auth);
	};

	const postData = async <T, D = unknown>(
		path: string,
		data?: D,
		config?: AxiosRequestConfig,
	): Promise<AxiosResponse<T>> => {
		try {
			const response = await axios.post<T>(
				`${baseUrl}${path}`,
				data,
				config,
			);
			return response;
		} catch (e) {
			console.error(`An error occured during the request: ${e}`);
			throw e;
		}
	};

	const fetchData = async <T,>(
		path: string,
		config?: AxiosRequestConfig,
	): Promise<AxiosResponse<T>> => {
		try {
			const response = await axios.get<T>(`${baseUrl}${path}`, config);
			return response;
		} catch (e) {
			console.error(e);
			throw e;
		}
	};

	const deleteData = async <T,>(
		path: string,
		config?: AxiosRequestConfig,
	): Promise<AxiosResponse<T>> => {
		try {
			const response = await axios.delete<T>(`${baseUrl}${path}`, config);
			return response;
		} catch (e) {
			console.error(e);
			throw e;
		}
	};

	axios.defaults.headers.common = jwtToken
		? { Authorization: `Bearer ${jwtToken}` }
		: {};

	return (
		<>
			<Navbar handleJwt={handleJwt} postData={postData} />
			{isAuthenticated ? (
				<CartProvider>
					<Product
						fetchData={fetchData}
						postData={postData}
						userId={11}
					/>
					<Cart
						fetchData={fetchData}
						postData={postData}
						deleteData={deleteData}
						userId={11}
					/>
				</CartProvider>
			) : (
				<Form handleJwt={handleJwt} postData={postData} />
			)}
		</>
	);
};

export default App;
