import { AxiosRequestConfig, AxiosResponse } from "axios";
import './style/searchBar.css'

interface SearchBarProps {
	fetchData: <T>(
		path: string,
		config?: AxiosRequestConfig,
	) => Promise<AxiosResponse<T>>;
	setArg: (arg: string | null) => void;
	arg: string | null;
}

const SearchBar = ({ setArg }: SearchBarProps) => {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setArg(e.target.value);
	};

	return (
		<form className="searchBar"
			onSubmit={(e: React.FormEvent<HTMLFormElement>) =>
				e.preventDefault()
			}
		>
			<input
				type="text"
				id="searchBar"
				name="term"
				onChange={handleChange}
				placeholder="Search"
			/>
		</form>
	);
};

export default SearchBar;
