import { MouseEvent, useEffect, useState } from "react";
import "./style/nav.css";
import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { useOutsideClick } from "./hooks/useOutsideClick";
import { InvoiceData } from "./Cart";

interface NavbarProps {
	handleJwt: (jwt: string, auth: boolean, userId?: number) => void;
	postData: (
		path: string,
		config?: AxiosRequestConfig,
	) => Promise<AxiosResponse<String>>;
	fetchData: <T>(
		path: string,
		config?: AxiosRequestConfig,
	) => Promise<AxiosResponse<T>>;
	deleteData: <T>(
		path: string,
		config?: AxiosRequestConfig,
	) => Promise<AxiosResponse<T>>;
	putData: <T>(
		path: string,
		config?: AxiosRequestConfig,
	) => Promise<AxiosResponse<T>>;
	userId: number | undefined;
}

interface DeleteUserProps {
	deleteData: <T>(
		path: string,
		config?: AxiosRequestConfig,
	) => Promise<AxiosResponse<T>>;
	handleJwt: (jwt: string, auth: boolean, userId?: number) => void;
	closeDialog: () => void;
	userId: number | undefined;
}

interface InvoiceHistoryProps {
	fetchData: (
		path: string,
		config?: AxiosRequestConfig,
	) => Promise<AxiosResponse<[]>>;
	userId: number | undefined;
}

interface UpdateUserProps {
	putData: <T>(
		path: string,
		config?: AxiosRequestConfig,
	) => Promise<AxiosResponse<T>>;
	userId: number | undefined;
}

interface UserData {
	id: number;
	dni_cif?: string;
	name?: string;
	email?: string;
	address?: string;
	phone?: string;
	password?: string;
	currency?: string;
	role?: Roles;
	language?: string;
}

type Roles = "USER" | "WORKER" | "ADMIN";
type NavDialogMode = "INVOICES" | "UPDATE" | "DELETE" | null;

const Navbar = ({
	handleJwt,
	postData,
	fetchData,
	deleteData,
	putData,
	userId,
}: NavbarProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isNav, setIsNav] = useState(true);
	const [dialogState, setDialogState] = useState(false);
	const [dialogMode, setDialogMode] = useState<NavDialogMode>();
	const [user, setUser] = useState<string>("");

	const ref = useOutsideClick(() => {
		setIsOpen(false);
	});

	const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		await postData("logout").catch((err: AxiosError) => console.error(err));
		handleJwt("", false);
	};

	const handleDialogClick = (mode: NavDialogMode) => {
		const dialogElement = document.querySelector(
			".dialog",
		) as HTMLDialogElement;

		if (dialogElement) {
			if (dialogState) {
				setDialogState(false);
				setDialogMode(null);
				dialogElement.close();
			} else {
				setDialogState(true);
				setDialogMode(mode);
				dialogElement.showModal();
			}
		}
	};

	const closeDialog = () => {
		const dialogElement = document.querySelector(
			".dialog",
		) as HTMLDialogElement;
		setDialogMode(null);
		setDialogState(false);
		dialogElement.close();
	};

	const dialogWindow = () => {
		switch (dialogMode) {
			case "INVOICES":
				return <InvoiceHistory userId={userId} fetchData={fetchData} />;
			case "DELETE":
				return (
					<DeleteUser
						userId={userId}
						deleteData={deleteData}
						handleJwt={handleJwt}
						closeDialog={closeDialog}
					/>
				);
			case "UPDATE":
				return <UpdateUser putData={putData} userId={userId} />;
			default:
				return null;
		}
	};

	const dialogClickHandler = (e: MouseEvent) => {
		const t = e.target as HTMLElement;
		if (t.tagName !== "DIALOG")
			//This prevents issues with forms
			return;

		const rect = t.getBoundingClientRect();

		const clickedInDialog =
			rect.top <= e.clientY &&
			e.clientY <= rect.top + rect.height &&
			rect.left <= e.clientX &&
			e.clientX <= rect.left + rect.width;

		if (clickedInDialog === false) {
			(t as HTMLDialogElement).close();
		}
	};

	useEffect(() => {
		const fetchUser = async () => {
			await fetchData<UserData>(`user/${userId}`)
				.then((res: AxiosResponse<UserData>) => {
					setUser(res.data.name as string);
				})
				.catch((err: AxiosError) => console.error(err));
		};

		fetchUser();
	}, [userId]);

	return (
		<nav ref={ref} className={`mainNav ${isOpen ? "open" : ""}`}>
			<button
				className="hamburger"
				onClick={() => {
					setIsOpen(!isOpen);
					setIsNav(true);
				}}
				type="button"
			>
				<div className={`top ${isOpen && isNav ? "open" : ""}`}></div>
				<div
					className={`middle ${isOpen && isNav ? "open" : ""}`}
				></div>
				<div
					className={`bottom ${isOpen && isNav ? "open" : ""}`}
				></div>
			</button>
			<img
				src="/images/user-alt-1-svgrepo-com.svg"
				alt=""
				className="userIcon"
				onClick={() => {
					setIsOpen(!isOpen);
					setIsNav(false);
				}}
			/>

			{isNav ? (
				<div className="navbar">
					<ul className={`navList ${isOpen ? "open" : ""}`}>
						<li className="navItem">
							<a
								href="http://localhost:8080/swagger-ui/index.html#/"
								target="_blank"
							>
								About
							</a>
						</li>
						<li className="navItem">
							<button
								className="logoutButton"
								type="button"
								onClick={handleLogout}
							>
								Logout
							</button>
						</li>
					</ul>
				</div>
			) : (
				<div className="userInfo">
					<ul className={`navList ${isOpen ? "open" : ""}`}>
						<li
							className="navItem"
							onClick={() => handleDialogClick("INVOICES")}
						>
							See previous invoices
						</li>
						<li
							className="navItem"
							onClick={() => handleDialogClick("UPDATE")}
						>
							Update user data
						</li>
						<li
							className="navItem"
							onClick={() => handleDialogClick("DELETE")}
						>
							Delete account
						</li>
						<p className="navItem">User: {user}</p>
					</ul>
					<dialog className="dialog" onClick={dialogClickHandler}>
						{dialogWindow()}
					</dialog>
				</div>
			)}
		</nav>
	);
};

const DeleteUser = ({
	deleteData,
	handleJwt,
	closeDialog,
	userId,
}: DeleteUserProps) => {
	const handleDelete = async () => {
		await deleteData(`user/${userId}`).catch((err: AxiosError) =>
			console.error(err),
		);
		handleJwt("", false);
	};

	return (
		<>
			<h2>Are you sure you wish to delete your user?</h2>
			<p>This action is irreversible</p>
			<button
				type="button"
				className="button accept"
				onClick={handleDelete}
			>
				Yes
			</button>
			<button
				type="button"
				className="button decline"
				onClick={() => closeDialog()}
			>
				No
			</button>
		</>
	);
};

const InvoiceHistory = ({ userId, fetchData }: InvoiceHistoryProps) => {
	const [invoices, setInvoices] = useState<InvoiceData[]>();

	const fetchInvoices = () => {
		fetchData(`invoice/user/${userId}`)
			.then((res: AxiosResponse) => setInvoices(res.data))
			.catch((err: AxiosError) => console.error(err));
	};

	useEffect(() => {
		fetchInvoices();
	}, [userId]);

	return (
		<div>
			{invoices ? (
				invoices.map((invoice) => (
					<div key={invoice.id}>
						<h2>{invoice.id}</h2>
						<p>
							Date:{" "}
							{new Date(invoice.invoiceDate).toLocaleDateString()}
						</p>
						<p>Total: ${invoice.totalPrice.toFixed(2)}</p>
					</div>
				))
			) : (
				<h2>No data</h2>
			)}
		</div>
	);
};

const UpdateUser = ({ putData, userId }: UpdateUserProps) => {
	const [userData, setUserData] = useState<UserData>({
		id: userId as number,
	});

	const handleFormData = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const data = new FormData(e.target as HTMLFormElement);

		data.forEach((value, key) => {
			setUserData((prevState) => ({
				...prevState,
				[key]: value as string,
			}));
		});

		const config: AxiosRequestConfig = { data: { userData } };

		await putData<UserData>("user", config)
			.then(() => {
				window.alert("User data updated sucessfully");
			})
			.catch((err: AxiosError) => console.error(err));
	};

	return (
		<form className="updateForm" onSubmit={handleFormData}>
			<div className="formElement">
				<label htmlFor="dni_cif">DNI/CIF</label>
				<input type="text" id="dni_cif" name="dni_cif" />
			</div>

			<div className="formElement">
				<label htmlFor="name">Name</label>
				<input type="text" id="name" name="name" />
			</div>

			<div className="formElement">
				<label htmlFor="email">Email</label>
				<input type="email" id="email" name="email" />
			</div>

			<div className="formElement">
				<label htmlFor="address">Address</label>
				<input type="text" id="address" name="address" />
			</div>

			<div className="formElement">
				<label htmlFor="phone">Phone</label>
				<input type="tel" id="phone" name="phone" />
			</div>

			<div className="formElement">
				<label htmlFor="password">Password</label>
				<input type="password" id="password" name="password" />
			</div>

			<div className="formElement">
				<label htmlFor="currency">Currency</label>
				<input type="text" id="currency" name="currency" />
			</div>

			<div className="formElement">
				<label htmlFor="role">Role</label>
				<select id="role" name="role">
					<option value="user">User</option>
					<option value="admin">Admin</option>
					<option value="worker">Worker</option>
				</select>
			</div>

			<div className="formElement">
				<label htmlFor="language">Language</label>
				<input type="text" id="language" name="language" />
			</div>

			<button className="button submit" type="submit">
				Submit
			</button>
		</form>
	);
};

export default Navbar;
