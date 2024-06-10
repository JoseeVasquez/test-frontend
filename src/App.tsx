import { useState } from "react";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import Form from "./Form";
import Product from "./Product";
import Navbar from "./Navbar";
import "./style/main.css"

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
            <Navbar handleJwt={handleJwt} postData={postData}/>
            {isAuthenticated 
                ? <Product fetchData={fetchData} /> 
                : <Form handleJwt={handleJwt} postData={postData} />}
		</>
	);
};

export default App;
