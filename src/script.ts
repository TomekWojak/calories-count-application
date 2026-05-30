import { setClasses, round } from "./helpers.js";

document.addEventListener("DOMContentLoaded", function () {
	const customSelect = document.querySelector(".custom-select-panel");
	const chooseProductInput = document.querySelector<HTMLInputElement>(
		".custom-select-input-box input",
	);
	const quantityInput = document.querySelector<HTMLInputElement>(".quantity");
	const productsList = document.querySelector(".custom-select-panel-body");
	const calculateBtn =
		document.querySelector<HTMLButtonElement>(".calculate-btn");
	const searchEngine = document.querySelector<HTMLInputElement>(
		".custom-select-search-engine input",
	);
	const clearStorageBtn =
		document.querySelector<HTMLButtonElement>(".clear-storage");
	const history = document.querySelector<HTMLUListElement>(".history");
	const overlay = document.querySelector<HTMLElement>(".overlay");
	const saveBtn = document.querySelector<HTMLButtonElement>(".save-btn");

	const handleFoodPanel = () => {
		const parent = chooseProductInput?.closest(".custom-select-input-box");
		const arrow = parent?.querySelector(".custom-select-arrow");

		arrow?.classList.toggle("rotate-180");
		customSelect?.classList.toggle("hidden");
	};

	const getProducts = async () => {
		const response = await fetch("./src/produkty_baza.json");
		const products = await response.json();

		return products;
	};

	const loadProductsInfo = async () => {
		const products = await getProducts();
		products.forEach((product: { name: string }) => {
			const pr = document.createElement("li");
			pr.setAttribute("role", "option");
			pr.setAttribute("tabindex", "0");
			pr.textContent = product?.name;

			setClasses(pr, [
				"custom-select-food",
				"py-3",
				"px-2",
				"hover:bg-[#333]/20",
				"transition-colors",
				"rounded-lg",
				"cursor-pointer",
				"focus-visible:bg-[#333]/20",
				"focus-visible:outline-0",
			]);

			productsList?.append(pr);
		});
	};

	const getQuantityFromInput = () => {
		if (quantityInput && quantityInput.value !== "") {
			const quantity = Math.abs(Number(quantityInput.value));

			return quantity;
		}
	};
	const checkSelection = () => {
		if (chooseProductInput) {
			if (chooseProductInput.value === "Wybierz produkt") {
				return false;
			}

			return chooseProductInput.value;
		}
	};
	const getSelectedProduct = async (selectedValue: string) => {
		const products = await getProducts();
		const selectedProduct = products.find(
			(prod: { name: string }) => prod.name === selectedValue,
		);

		return selectedProduct;
	};
	const clearInputs = () => {
		const products = document.querySelectorAll<HTMLLIElement>(
			".custom-select-food",
		);
		if (chooseProductInput && quantityInput && searchEngine) {
			chooseProductInput.value = "Wybierz produkt";
			quantityInput.value = "";
			searchEngine.value = "";
			products.forEach((product) => product.classList.remove("hidden"));
		}
	};

	const changeValueOfDailyProgress = (
		calories: number,
		protein: number,
		fats: number,
	) => {
		const proteinsValue = document.querySelector(".current-protein");
		const caloriesValue = document.querySelector(".current-calories");
		const fatsValue = document.querySelector(".current-fats");

		const targetProteins =
			document.querySelector<HTMLElement>(".target-protein");
		const targetFats = document.querySelector<HTMLElement>(".target-fats");
		const targetCalories =
			document.querySelector<HTMLElement>(".target-calories");

		if (
			proteinsValue &&
			caloriesValue &&
			fatsValue &&
			targetCalories &&
			targetFats &&
			targetProteins
		) {
			let currentProtein = Number(proteinsValue.textContent);
			let currentCalories = Number(caloriesValue.textContent);
			let currentFats = Number(fatsValue.textContent);

			currentProtein = round(currentProtein + protein);
			currentCalories = round(currentCalories + calories);
			currentFats = round(currentFats + fats);

			proteinsValue.textContent = String(currentProtein);
			caloriesValue.textContent = String(currentCalories);
			fatsValue.textContent = String(currentFats);

			setDataToStorage(
				currentCalories,
				currentFats,
				currentProtein,
				"foodData",
			);
			changeProgressBar([targetProteins, targetFats, targetCalories]);
		}
	};

	const changeProgressBar = (targets: HTMLElement[]) => {
		targets.forEach((target) => {
			const parent = target.closest(".app-stat");
			const targetValue = Number(parent?.querySelector(".target")?.textContent);
			const currentValue = Number(
				parent?.querySelector(".current")?.textContent,
			);
			const progressBar =
				parent?.querySelector<HTMLSpanElement>(".progress-bar");

			if (progressBar) {
				progressBar.style.width = `${(100 * currentValue) / targetValue}%`;

				const width = parseFloat(progressBar.style.width);
				const challengeCompleted = width >= 100;

				if (challengeCompleted) {
					const finishedIcon = parent?.querySelector(".finished-icon");
					finishedIcon?.classList.remove("hidden");
				}
			}
		});
	};

	const setDataToStorage = (
		calories: number,
		fats: number,
		protein: number,
		keyName: string,
		seen?: boolean,
	) => {
		const data = JSON.stringify({ calories, fats, protein, seen });
		localStorage.setItem(keyName, data);
	};
	const setProductDataToStorage = (
		calories: number,
		fats: number,
		protein: number,
		productName: string,
		quantity: number,
	) => {
		const key = "products";

		const existingData = localStorage.getItem(key);

		const parsed = existingData ? JSON.parse(existingData) : {};

		if (Object.hasOwn(parsed, productName)) {
			parsed[productName][0] += protein;
			parsed[productName][1] += calories;
			parsed[productName][2] += fats;
			parsed[productName][3] += quantity;
		} else {
			parsed[productName] = [protein, calories, fats, quantity];
		}

		localStorage.setItem(key, JSON.stringify(parsed));
	};
	const getDataFromStorage = () => {
		const data = localStorage.getItem("foodData");
		if (data) {
			const dataParsed: { calories: number; fats: number; protein: number } =
				JSON.parse(data);
			changeValueOfDailyProgress(
				dataParsed.calories,
				dataParsed.protein,
				dataParsed.fats,
			);
		}
	};

	const clearStorage = () => {
		localStorage.removeItem("foodData");
		localStorage.removeItem("products");
		localStorage.removeItem("popupData");
		window.location.reload();
	};

	const handleProductSearchEngine = (e: Event) => {
		const products = document.querySelectorAll<HTMLLIElement>(
			".custom-select-food",
		);
		if (e.currentTarget instanceof HTMLInputElement) {
			const input = e.currentTarget;

			const searchEngineValue = input.value.trim().toLowerCase();

			products.forEach((product) => {
				const productName = product.textContent.toLowerCase();
				if (productName.includes(searchEngineValue)) {
					product.classList.remove("hidden");
				} else {
					product.classList.add("hidden");
				}
			});
			const allHidden = [...products].every((product) =>
				product.classList.contains("hidden"),
			);
			const emptyInfo = document.querySelector<HTMLLIElement>(".empty-info");

			if (allHidden && emptyInfo) {
				emptyInfo.classList.remove("hidden");
			} else {
				emptyInfo?.classList.add("hidden");
			}
		}
	};
	const calculate = async () => {
		const quantity = getQuantityFromInput();
		const userSelectedOption = checkSelection();
		let calories: number, protein: number, fats: number;

		if (quantity == null || !userSelectedOption) return;

		const selectedProduct: {
			name: string;
			type: "g" | "ml" | "pcs";
			calories: number;
			protein: number;
			fat: number;
		} = await getSelectedProduct(userSelectedOption);

		if (selectedProduct.type === "g") {
			calories = round((quantity / 100) * selectedProduct.calories);
			protein = round((quantity / 100) * selectedProduct.protein);
			fats = round((quantity / 100) * selectedProduct.fat);
		} else if (selectedProduct.type === "ml") {
			calories = round((quantity / 250) * selectedProduct.calories);
			protein = round((quantity / 250) * selectedProduct.protein);
			fats = round((quantity / 250) * selectedProduct.fat);
		} else {
			calories = quantity * selectedProduct.calories;
			protein = quantity * selectedProduct.protein;
			fats = quantity * selectedProduct.fat;
		}
		addItemToHistory(selectedProduct.name, protein, calories, fats, quantity);
		setProductDataToStorage(
			calories,
			fats,
			protein,
			selectedProduct.name,
			quantity,
		);
		changeValueOfDailyProgress(calories, protein, fats);
		clearInputs();
	};
	const addItemToHistory = (
		productName: string,
		protein: number,
		calories: number,
		fats: number,
		quantity: number,
	) => {
		const existingItem = history?.querySelector<HTMLLIElement>(
			`[data-product="${productName}"]`,
		);

		const html = `
		<p>
			<span class="product-name font-semibold">${productName}</span>
			-
			<span class="quant">${quantity}</span>
		</p>

		<div class="history-item-stats flex gap-4 mt-3">
			<p class="p-1 border border-(--accent) bg-(--accent)/30">
				🍗<span class="history-item-protein ml-1">
					${protein.toFixed(1)}
				</span>g
			</p>

			<p class="p-1 border border-(--accent) bg-(--accent)/30">
				🔥<span class="history-item-calories ml-1">
					${calories.toFixed(1)}
				</span>kcal
			</p>

			<p class="p-1 border border-(--accent) bg-(--accent)/30">
				🥑<span class="history-item-fats ml-1">
					${fats.toFixed(1)}
				</span>g
			</p>
		</div>
	`;

		if (existingItem) {
			const quantityElement =
				existingItem.querySelector<HTMLSpanElement>(".quant");
			const proteinElement = existingItem.querySelector<HTMLSpanElement>(
				".history-item-protein",
			);
			const caloriesElement = existingItem.querySelector<HTMLSpanElement>(
				".history-item-calories",
			);
			const fatsElement =
				existingItem.querySelector<HTMLSpanElement>(".history-item-fats");

			if (quantityElement && proteinElement && caloriesElement && fatsElement) {
				let currentQuantity = Number(quantityElement.textContent);
				let currentProtein = Number(proteinElement.textContent);
				let currentCalories = Number(caloriesElement.textContent);
				let currentFats = Number(fatsElement.textContent);

				quantity += currentQuantity;
				protein += currentProtein;
				calories += currentCalories;
				fats += currentFats;

				quantityElement.textContent = String(quantity);
				proteinElement.textContent = String(protein);
				caloriesElement.textContent = String(calories);
				fatsElement.textContent = String(fats);
			}

			return;
		}

		const li = document.createElement("li");

		li.dataset.product = productName;

		setClasses(li, ["history-item", "px-2", "py-3", "bg-[#3333339a]"]);

		li.innerHTML = html;

		history?.append(li);
	};

	const loadHistory = () => {
		const products = localStorage.getItem("products");

		if (products) {
			const dataParsed = JSON.parse(products);
			for (const product in dataParsed) {
				const protein = dataParsed[product][0];
				const calories = dataParsed[product][1];
				const fats = dataParsed[product][2];
				const quantity = dataParsed[product][3];

				addItemToHistory(product, protein, calories, fats, quantity);
			}
		}
	};
	const handlePopup = () => {
		const overlay = document.querySelector<HTMLElement>(".overlay");
		overlay?.classList.toggle("hidden");
	};

	const handlePopupInfo = (e: Event) => {
		e.preventDefault();

		const proteinInput =
			document.querySelector<HTMLInputElement>(".set-protein");
		const caloriesInput =
			document.querySelector<HTMLInputElement>(".set-calories");
		const fatsInput = document.querySelector<HTMLInputElement>(".set-fats");

		let protein = Math.abs(Number(proteinInput?.value));
		let calories = Math.abs(Number(caloriesInput?.value));
		let fats = Math.abs(Number(fatsInput?.value));

		assignUserSettings(protein, calories, fats);
		setDataToStorage(calories, fats, protein, "popupData", true);
		handlePopup();
	};
	const assignUserSettings = (
		protein: number,
		calories: number,
		fats: number,
	) => {
		const targetProtein =
			document.querySelector<HTMLSpanElement>(".target-protein");
		const targetCalories =
			document.querySelector<HTMLSpanElement>(".target-calories");
		const targetFats = document.querySelector<HTMLSpanElement>(".target-fats");

		if (
			targetCalories &&
			targetProtein &&
			targetFats &&
			protein != null &&
			calories != null &&
			fats != null
		) {
			targetProtein.textContent = String(protein.toFixed(2));
			targetCalories.textContent = String(calories.toFixed(2));
			targetFats.textContent = String(fats.toFixed(2));
		}
	};
	const loadUserSettings = () => {
		const data = localStorage.getItem("popupData");
		const parsed = data ? JSON.parse(data) : {};

		if (parsed?.seen) {
			handlePopup();
		}
		assignUserSettings(parsed?.protein, parsed?.calories, parsed?.fats);
	};

	loadHistory();
	loadProductsInfo();
	getDataFromStorage();
	loadUserSettings();
	productsList?.addEventListener("click", (e) => {
		if (e.target instanceof HTMLElement) {
			if (e.target.closest(".custom-select-food")) {
				if (chooseProductInput) {
					chooseProductInput.value = e.target.textContent;
					handleFoodPanel();
				}
			}
		}
	});

	saveBtn?.addEventListener("click", handlePopupInfo);
	searchEngine?.addEventListener("keyup", handleProductSearchEngine);
	calculateBtn?.addEventListener("click", calculate);
	chooseProductInput?.addEventListener("click", handleFoodPanel);
	clearStorageBtn?.addEventListener("click", clearStorage);
});
