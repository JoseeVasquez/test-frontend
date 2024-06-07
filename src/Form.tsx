import { AxiosRequestConfig, AxiosResponse } from "axios";
import { useState } from "react";

interface LoginResponse {
	user: string;
	authorities: string[];
	jwt: string;
}

interface FormProps {
	handleJwt: (jwt: string, auth: boolean) => void;
	postData: (
		path: string,
		config?: AxiosRequestConfig
	) => Promise<AxiosResponse<LoginResponse>>;
}

interface LoginProps {
	postData: (
		path: string,
		config?: AxiosRequestConfig
	) => Promise<AxiosResponse<LoginResponse>>;
	handleJwt: (jwt: string, auth: boolean) => void;
	setIsAuth: (auth: boolean) => void;
	setIsLogin: (state: boolean) => void;
}

interface RegisterData {
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
	postData: (
		path: string,
		body: AxiosRequestConfig
	) => Promise<AxiosResponse<LoginResponse>>;
	setIsLogin: (state: boolean) => void;
}

const Form = ({ handleJwt, postData }: FormProps) => {
	const [isLogin, setIsLogin] = useState(true);
	const [isAuth, setIsAuth] = useState(false);

	const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		try {
			const response = postData("logout");
			handleJwt("", false);
			setIsAuth(false);
			console.log((await response).data);
		} catch (error) {
			console.error(error);
		}
	};
	return (
		<>
			{!isAuth ? (
				isLogin ? (
					<LoginForm
						postData={postData}
						handleJwt={handleJwt}
						setIsAuth={setIsAuth}
						setIsLogin={setIsLogin}
					/>
				) : (
					<RegisterForm postData={postData} setIsLogin={setIsLogin} />
				)
			) : (
				<button type="button" onClick={handleLogout}>
					Logout
				</button>
			)}
		</>
	);
};

const LoginForm = ({
	postData,
	handleJwt,
	setIsAuth,
	setIsLogin,
}: LoginProps) => {
	const [username, setUsername] = useState<string>("");
	const [password, setPassword] = useState<string>("");

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			const response = await postData("login", {
				params: {
					email: username,
					password: password,
				},
			});
			handleJwt(response.data.jwt, true);
			setIsAuth(true);
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
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
			<button type="submit">Submit</button>
			<br />
			<br />
			<span>
				No account?:{" "}
				<button type="button" onClick={() => setIsLogin(false)}>
					Register!!
				</button>
			</span>
		</form>
	);
};

const RegisterForm = ({ postData, setIsLogin }: RegisterProps) => {
	const [formData, setFormData] = useState<RegisterData>({
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
			const response = await postData("register", {
				params: formData,
			});
			console.log(response);
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<label>
				DNI/CIF:
				<input
					type="text"
					name="dniCif"
					value={formData.dniCif}
					onChange={handleChange}
				/>
			</label>
			<br />
			<br />
			<label>
				Name:
				<input
					type="text"
					name="name"
					value={formData.name}
					onChange={handleChange}
				/>
			</label>
			<br />
			<br />
			<label>
				Email:
				<input
					type="email"
					name="email"
					value={formData.email}
					onChange={handleChange}
				/>
			</label>
			<br />
			<br />
			<label>
				Address:
				<input
					type="text"
					name="address"
					value={formData.address}
					onChange={handleChange}
				/>
			</label>
			<br />
			<br />
			<label>
				Phone:
				<input
					type="tel"
					name="phone"
					value={formData.phone}
					onChange={handleChange}
				/>
			</label>
			<br />
			<br />
			<label>
				Password:
				<input
					type="password"
					name="password"
					value={formData.password}
					onChange={handleChange}
				/>
			</label>
			<br />
			<br />
			<label>
				Currency:
				<input
					type="text"
					name="currency"
					value={formData.currency}
					onChange={handleChange}
				/>
			</label>
			<br />
			<br />
			<label>
				Language:
				<input
					type="text"
					name="language"
					value={formData.language}
					onChange={handleChange}
				/>
			</label>
			<br />
			<br />
			<button type="submit">Register</button>
			<br />
			<br />
			<span>
				Already have an account?
				<button type="button" onClick={() => setIsLogin(true)}>
					Login!!
				</button>
			</span>
		</form>
	);
};

export default Form;
