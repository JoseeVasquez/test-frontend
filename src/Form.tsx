import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { useState } from "react";
import "./style/main.css";
import "./style/form.css";
import { ErrorResponse } from "./App";

export interface LoginResponse {
	id: number;
	authorities: string[];
	jwt: string;
}

interface FormProps {
	handleJwt: (jwt: string, auth: boolean, userId: number) => void;
	postData: <T, D = unknown>(
		path: string,
		data?: D,
		config?: AxiosRequestConfig,
	) => Promise<AxiosResponse<T>>;
}

interface LoginProps {
	postData: <T, D = unknown>(
		path: string,
		data?: D,
		config?: AxiosRequestConfig,
	) => Promise<AxiosResponse<T>>;
	handleJwt: (jwt: string, auth: boolean, userId: number) => void;
	setIsLogin: (state: boolean) => void;
}

export interface UserData {
	dniCif: string;
	name: string;
	email: string;
	address: string;
	phone: string;
	password: string;
	currency: string;
	language: string;
}

interface RegisterProps {
	postData: <T, D = unknown>(
		path: string,
		data?: D,
		config?: AxiosRequestConfig,
	) => Promise<AxiosResponse<T>>;
	setIsLogin: (state: boolean) => void;
}

const Form = ({ handleJwt, postData }: FormProps) => {
	const [isLogin, setIsLogin] = useState(true);

	return (
		<>
			{isLogin ? (
				<LoginForm
					postData={postData}
					handleJwt={handleJwt}
					setIsLogin={setIsLogin}
				/>
			) : (
				<RegisterForm postData={postData} setIsLogin={setIsLogin} />
			)}
		</>
	);
};

const LoginForm = ({ postData, handleJwt, setIsLogin }: LoginProps) => {
	const [username, setUsername] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [errMsg, setErrMsg] = useState<string>("");

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			const response = await postData<LoginResponse>("login", null, {
				params: {
					email: username,
					password: password,
				},
			});
			console.log(response.data);
			handleJwt(response.data.jwt, true, response.data.id);
		} catch (error) {
			const e: AxiosError = error as AxiosError<ErrorResponse>;
			console.error(e);
			if (e.response && e.response.data) {
				const data = e.response.data as ErrorResponse;
				setErrMsg(data.message);
			}
		}
	};

	return (
		<form className="authForm" onSubmit={handleSubmit}>
			<label htmlFor="username">Username:</label>
			<input
				type="text"
				id="username"
				onChange={(e) => setUsername(e.target.value)}
				required
			/>
			<label htmlFor="password">Password:</label>
			<input
				type="password"
				id="password"
				onChange={(e) => setPassword(e.target.value)}
				required
			/>
			<button className="button" type="submit">
				Submit
			</button>
			{errMsg && <p className="error">{errMsg}</p>}
			<p className="error">{}</p>
			<span className="changeForm">
				No account?:{" "}
				<button
					className="button"
					type="button"
					onClick={() => setIsLogin(false)}
				>
					Register!!
				</button>
			</span>
		</form>
	);
};

const RegisterForm = ({ postData, setIsLogin }: RegisterProps) => {
	const [formData, setFormData] = useState<UserData>({
		dniCif: "",
		name: "",
		email: "",
		address: "",
		phone: "",
		password: "",
		currency: "",
		language: "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		try {
			await postData<UserData>("register", null, {
				params: formData,
			});
			window.alert("Registration successful!");
			setIsLogin(true);
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<form className="authForm" onSubmit={handleSubmit}>
			<div className="formGroup">
				<label htmlFor="dniCif">DNI/CIF:</label>
				<input
					type="text"
					id="dniCif"
					name="dniCif"
					value={formData.dniCif}
					onChange={handleChange}
				/>
			</div>

			<div className="formGroup">
				<label htmlFor="name">Name:</label>
				<input
					type="text"
					id="name"
					name="name"
					value={formData.name}
					onChange={handleChange}
				/>
			</div>

			<div className="formGroup">
				<label htmlFor="email">Email:</label>
				<input
					type="email"
					id="email"
					name="email"
					value={formData.email}
					onChange={handleChange}
				/>
			</div>

			<div className="formGroup">
				<label htmlFor="address">Address:</label>
				<input
					type="text"
					id="address"
					name="address"
					value={formData.address}
					onChange={handleChange}
				/>
			</div>

			<div className="formGroup">
				<label htmlFor="phone">Phone:</label>
				<input
					type="tel"
					id="phone"
					name="phone"
					value={formData.phone}
					onChange={handleChange}
				/>
			</div>

			<div className="formGroup">
				<label htmlFor="password">Password:</label>
				<input
					type="password"
					id="password"
					name="password"
					value={formData.password}
					onChange={handleChange}
				/>
			</div>

			<div className="formGroup">
				<label htmlFor="currency">Currency:</label>
				<input
					type="text"
					id="currency"
					name="currency"
					value={formData.currency}
					onChange={handleChange}
				/>
			</div>

			<div className="formGroup">
				<label htmlFor="language">Language:</label>
				<input
					type="text"
					id="language"
					name="language"
					value={formData.language}
					onChange={handleChange}
				/>
			</div>
			<button className="button" type="submit">
				Register
			</button>
			<span className="changeForm">
				Already have an account?
				<button
					className="button changeBtn"
					type="button"
					onClick={() => setIsLogin(true)}
				>
					Login!!
				</button>
			</span>
		</form>
	);
};

export default Form;
