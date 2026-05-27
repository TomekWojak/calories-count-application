export const setClasses = (el, classes) => {
    classes.forEach((cls) => {
        el.classList.add(cls);
    });
};
export const round = (num) => Math.round(num * 100) / 100;
