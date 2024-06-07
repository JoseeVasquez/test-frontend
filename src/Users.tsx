import { AxiosResponse } from "axios";
import { useState } from "react";

interface UserData {
	id: number;
	email: string;
	name: string;
	currency: string;
}

interface UserProps {
	fetchData: (path: string) => Promise<AxiosResponse<UserData[]>>;
}

const Users = ({ fetchData }: UserProps) => {
	const [users, setUsers] = useState<UserData[]>();

	const handleGet = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		try {
			const response = await fetchData("user");
			setUsers(response.data);
		} catch (e) {
			console.error(e);
		}
	};

	return (
		<>
			<button onClick={handleGet}>Get users</button>
			<ul>
				{users?.map((user) => {
					return (
						<li key={user.id}>
							<h2>{user.email}</h2>
							<span>name: {user.name}</span>
							<br />
							<span>currency: {user.currency}</span>
						</li>
					);
				})}
			</ul>
		</>
	);
};

export default Users;
