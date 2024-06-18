import { useEffect, useState } from "react";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import Form from "./Form";
import Product from "./Product";
import Navbar from "./Navbar";
import Cart from "./Cart";
import "./style/main.css";
import { CartProvider } from "./CartContext";
import SearchBar from "./SearchBar";

export interface ErrorResponse {
	message: string;
	status: number;
}

type ParsedJwt = {
	sub: string;
	iat: number;
	exp: number;
};

const App = () => {
	const [jwtToken, setJwtToken] = useState<string | null>(
		localStorage.getItem("jwtToken"),
	);
	const [isAuthenticated, setIsAuthenticated] = useState(
		Boolean(localStorage.getItem("jwtToken")),
	);
	const storedId = localStorage.getItem("userId");

	const [userId, setUserId] = useState<number | null>(
		storedId ? parseInt(storedId) : null,
	);
	const [arg, setArg] = useState<string | null>(null);

	const baseUrl: string = "http://localhost:8080/";

	const handleJwt = (jwt: string, auth: boolean, userId?: number) => {
		localStorage.setItem("jwtToken", jwt);
		setJwtToken(jwt);
		setIsAuthenticated(auth);
		if (userId) {
			setUserId(userId);
			localStorage.setItem("userId", userId.toString());
		}
	};

	const parseJwt = (token: string | null): ParsedJwt | null => {
		if (!token) return null;
		try {
			return JSON.parse(atob(token.split(".")[1]));
		} catch (e) {
			return null;
		}
	};

	const postData = async <T, D = unknown>(
		path: string,
		data?: D,
		config?: AxiosRequestConfig,
	): Promise<AxiosResponse<T>> => {
		const response = await axios
			.post<T>(`${baseUrl}${path}`, data, config)
			.catch((err: AxiosError) => {
				console.error(err);
				throw err;
			});
		return response;
	};

	const fetchData = async <T,>(
		path: string,
		config?: AxiosRequestConfig,
	): Promise<AxiosResponse<T>> => {
		const response = await axios
			.get<T>(`${baseUrl}${path}`, config)
			.catch((err: AxiosError) => {
				console.error(err);
				throw err;
			});
		return response;
	};

	const deleteData = async <T,>(
		path: string,
		config?: AxiosRequestConfig,
	): Promise<AxiosResponse<T>> => {
		const response = await axios
			.delete<T>(`${baseUrl}${path}`, config)
			.catch((err: AxiosError) => {
				console.error(err);
				throw err;
			});
		return response;
	};

	const putData = async <T,>(
		path: string,
		config?: AxiosRequestConfig,
	): Promise<AxiosResponse<T>> => {
		const res = await axios
			.put(`${baseUrl}${path}`, config)
			.catch((err: AxiosError) => {
				throw err;
			});
		return res;
	};

	useEffect(() => {
		const parsedToken = parseJwt(jwtToken);
		if (!parsedToken || parsedToken.exp * 1000 < Date.now()) {
			localStorage.setItem("jwtToken", "");
			setIsAuthenticated(false);
            setJwtToken(null);
		}
	}, []);

	axios.defaults.headers.common = jwtToken
		? { Authorization: `Bearer ${jwtToken}` }
		: {};

	return (
		<>
			<Navbar
				handleJwt={handleJwt}
				postData={postData}
				fetchData={fetchData}
				deleteData={deleteData}
				putData={putData}
				userId={userId ? userId : undefined}
			/>
			{isAuthenticated ? (
				<>
					<CartProvider>
						<SearchBar
							fetchData={fetchData}
							setArg={setArg}
							arg={arg}
						/>
						<Product
							fetchData={fetchData}
							postData={postData}
							userId={userId ? userId : undefined}
							arg={arg}
						/>
						<Cart
							fetchData={fetchData}
							postData={postData}
							deleteData={deleteData}
							userId={userId ? userId : undefined}
						/>
					</CartProvider>
				</>
			) : (
				<Form handleJwt={handleJwt} postData={postData} />
			)}
		</>
	);
};

export default App;
