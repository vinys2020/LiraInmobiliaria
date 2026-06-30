export const parseExpression = (value) => {
    if (!value) return 0;

    const clean = String(value)
        .replace(/,/g, ".")
        .replace(/[^0-9+\-*/(). ]/g, "");

    try {
        const result = Function(`"use strict"; return (${clean})`)();
        return Number(result) || 0;
    } catch (error) {
        return 0;
    }
};