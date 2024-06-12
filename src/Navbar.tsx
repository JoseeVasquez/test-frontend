import { useState } from "react";
import "./style/nav.css";
import { AxiosRequestConfig, AxiosResponse } from "axios";
import { useOutsideClick } from "./hooks/useOutsideClick";

interface NavbarProps {
	handleJwt: (jwt: string, auth: boolean) => void;
	postData: (
		path: string,
		config?: AxiosRequestConfig,
	) => Promise<AxiosResponse<String>>;
}

const Navbar = ({ handleJwt, postData }: NavbarProps) => {
	const [isOpen, setIsOpen] = useState(false);

	const ref = useOutsideClick(() => {
		setIsOpen(false);
	});

	const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		try {
			const response = postData("logout");
			handleJwt("", false);
			console.log((await response).data);
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<nav ref={ref} className={`mainNav ${isOpen ? "open" : ""}`}>
			<button
				className="hamburger"
				onClick={() => setIsOpen(!isOpen)}
				type="button"
			>
				<div className={`top ${isOpen ? "open" : ""}`}></div>
				<div className={`middle ${isOpen ? "open" : ""}`}></div>
				<div className={`bottom ${isOpen ? "open" : ""}`}></div>
			</button>
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
		</nav>
	);
};

export default Navbar;
