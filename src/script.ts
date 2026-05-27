document.addEventListener("DOMContentLoaded", function () {
	const customSelect = document.querySelector(".custom-select-panel");
	const chooseProductInput = document.querySelector(
		".custom-select-input-box input",
	);

	const showFoodPanel = () => {
		const parent = chooseProductInput?.closest(".custom-select-input-box");
		const arrow = parent?.querySelector(".custom-select-arrow");

		arrow?.classList.toggle("rotate-180");
		customSelect?.classList.toggle("hidden");
	};

	chooseProductInput?.addEventListener("click", showFoodPanel);
});
