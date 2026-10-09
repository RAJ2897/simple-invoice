export const numericTransformer = {
    to: (value) => value,
    from: (value) => value === null || value === undefined ? value : Number(value),
};
//# sourceMappingURL=numeric.transformer.js.map