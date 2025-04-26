import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.config({
        extends: ["next/core-web-vitals", "next/typescript"],
        rules: {
            "semi": ["warn", "always"],
            "indent": ["error", 4],
            "quotes": ["error", "double"],
            "no-trailing-spaces": "error",
            "no-mixed-spaces-and-tabs": "error",
            "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],  // Ignora args que começam com _

            "camelcase": ["error", { properties: "always" }],
            "no-multiple-empty-lines": ["error", { max: 1 }],
            "react/jsx-curly-spacing": ["error", { "when": "always", "children": true }],
            "object-curly-spacing": ["error", "always"],
        }
    }),
];

export default eslintConfig;
