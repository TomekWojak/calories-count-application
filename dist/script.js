import { setClasses, round } from "./helpers.js";
document.addEventListener("DOMContentLoaded", function () {
    const customSelect = document.querySelector(".custom-select-panel");
    const chooseProductInput = document.querySelector(".custom-select-input-box input");
    const quantityInput = document.querySelector(".quantity");
    const productsList = document.querySelector(".custom-select-panel-body");
    const calculateBtn = document.querySelector(".calculate-btn");
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
        products.forEach((product) => {
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
    const getSelectedProduct = async (selectedValue) => {
        const products = await getProducts();
        const selectedProduct = products.find((prod) => prod.name === selectedValue);
        return selectedProduct;
    };
    const clearInputs = () => {
        if (chooseProductInput && quantityInput) {
            chooseProductInput.value = "Wybierz produkt";
            quantityInput.value = "";
        }
    };
    const changeValueOfDailyProgress = (calories, protein, fats) => {
        const proteinsValue = document.querySelector(".current-protein");
        const caloriesValue = document.querySelector(".current-calories");
        const fatsValue = document.querySelector(".current-fats");
        const targetProteins = document.querySelector(".target-protein");
        const targetFats = document.querySelector(".target-fats");
        const targetCalories = document.querySelector(".target-calories");
        if (proteinsValue &&
            caloriesValue &&
            fatsValue &&
            targetCalories &&
            targetFats &&
            targetProteins) {
            let currentProtein = Number(proteinsValue.textContent);
            let currentCalories = Number(caloriesValue.textContent);
            let currentFats = Number(fatsValue.textContent);
            currentProtein = round(currentProtein + protein);
            currentCalories = round(currentCalories + calories);
            currentFats = round(currentFats + fats);
            proteinsValue.textContent = String(currentProtein);
            caloriesValue.textContent = String(currentCalories);
            fatsValue.textContent = String(currentFats);
            setDataToStorage(currentCalories, currentFats, currentProtein);
            changeProgressBar([targetProteins, targetFats, targetCalories]);
        }
    };
    const changeProgressBar = (targets) => {
        targets.forEach((target) => {
            const parent = target.closest(".app-stat");
            const targetValue = Number(parent?.querySelector(".target")?.textContent);
            const currentValue = Number(parent?.querySelector(".current")?.textContent);
            const progressBar = parent?.querySelector(".progress-bar");
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
    const setDataToStorage = (calories, fats, protein) => {
        const data = JSON.stringify({ calories, fats, protein });
        localStorage.setItem("foodData", data);
    };
    const getDataFromStorage = () => {
        const data = localStorage.getItem("foodData");
        if (data) {
            const dataParsed = JSON.parse(data);
            changeValueOfDailyProgress(dataParsed.calories, dataParsed.protein, dataParsed.fats);
        }
    };
    getDataFromStorage();
    const calculate = async () => {
        const quantity = getQuantityFromInput();
        const userSelectedOption = checkSelection();
        let calories, protein, fats;
        if (quantity == null || !userSelectedOption)
            return;
        const selectedProduct = await getSelectedProduct(userSelectedOption);
        if (selectedProduct.type === "g") {
            calories = round((quantity / 100) * selectedProduct.calories);
            protein = round((quantity / 100) * selectedProduct.protein);
            fats = round((quantity / 100) * selectedProduct.fat);
        }
        else if (selectedProduct.type === "ml") {
            calories = round((quantity / 250) * selectedProduct.calories);
            protein = round((quantity / 250) * selectedProduct.protein);
            fats = round((quantity / 250) * selectedProduct.fat);
        }
        else {
            calories = quantity * selectedProduct.calories;
            protein = quantity * selectedProduct.protein;
            fats = quantity * selectedProduct.fat;
        }
        changeValueOfDailyProgress(calories, protein, fats);
        clearInputs();
    };
    loadProductsInfo();
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
    calculateBtn?.addEventListener("click", calculate);
    chooseProductInput?.addEventListener("click", handleFoodPanel);
});
