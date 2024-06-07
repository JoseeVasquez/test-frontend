import { useState } from "react";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import "./App.css";
import Form from "./Form";
import Users from "./Users";
import Product from "./Product";

const App = () => {
	const [jwtToken, setJwtToken] = useState<string>();
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const baseUrl: string = "http://localhost:8080/";

	const handleJwt = (jwt: string, auth: boolean) => {
		setJwtToken(jwt);
		setIsAuthenticated(auth);
	};

	const postData = async <T,>(
		path: string,
		config?: AxiosRequestConfig
	): Promise<AxiosResponse<T>> => {
		try {
			const response = await axios.post(
				`${baseUrl}${path}`,
				null,
				config
			);
			return response;
		} catch (e) {
			console.error(`An error occured during the request: ${e}`);
			throw e;
		}
	};

	const fetchData = async <T,>(
		path: string,
		config?: AxiosRequestConfig
	): Promise<AxiosResponse<T>> => {
		try {
			const response = await axios.get(`${baseUrl}${path}`, config);
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
			<Form handleJwt={handleJwt} postData={postData} />
			{isAuthenticated ? <Product fetchData={fetchData} /> : <></>}
			<Users fetchData={fetchData} />
		</>
	);
};

export default App;
