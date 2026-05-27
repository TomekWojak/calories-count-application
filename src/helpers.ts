export const setClasses = (el: HTMLElement, classes: string[]) => {
	classes.forEach((cls) => {
		el.classList.add(cls);
	});
};
export const round = (num: number) => Math.round(num * 100) / 100;
