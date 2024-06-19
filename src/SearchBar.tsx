import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import "./style/searchBar.css";
import { useState } from "react";
import { CategoryData } from "./Product";

interface SearchBarProps {
	fetchData: <T>(
		path: string,
		config?: AxiosRequestConfig,
	) => Promise<AxiosResponse<T>>;
	setArg: (arg: string | null) => void;
	setCategory: (category: string | null) => void;
}

const SearchBar = ({ fetchData, setArg, setCategory }: SearchBarProps) => {
	const [categories, setCategories] = useState<CategoryData[] | null>(null);

	const fetchCategories = async () => {
		await fetchData<CategoryData[]>("categories")
			.then((res) => setCategories(res.data))
			.catch((err: AxiosError) => console.error(err));
	};

	const handleButtonClick = () => {
		if (categories) {
			setCategories(null);
		} else {
			fetchCategories();
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setArg(e.target.value);
	};

	return (
		<form
			className="searchBar"
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

			<button
				className="button categoriesBtn"
				type="button"
				onClick={() => handleButtonClick()}
			>
				See Categories
			</button>
			{categories && (
				<fieldset className="categories">
					{categories?.map((category) => (
						<div className="categoryInput">
							<label htmlFor={category.id.toString()}>
								{category.name}
							</label>
							<input
								id={category.id.toString()}
								type="radio"
								name="category"
								value={category.name}
								onChange={(e) => setCategory(e.target.value)}
							/>
						</div>
					))}
					<div className="categoryInput">
						<label htmlFor="clear">Clear</label>
						<input
							id="clear"
							type="radio"
							name="category"
							onChange={() => setCategory(null)}
						/>
					</div>
				</fieldset>
			)}
		</form>
	);
};

export default SearchBar;
