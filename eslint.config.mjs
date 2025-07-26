// import { dirname } from "path";
// import { fileURLToPath } from "url";
// import { FlatCompat } from "@eslint/eslintrc";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const compat = new FlatCompat({
//     baseDirectory: __dirname,
// });

// const eslintConfig = [
//     {
//         ignores: [ "**/node_modules/**", "**/build/**", "**/.next/**", "**/components/ui/**" ], // tira o components/ui daqui!
//     },
//     ...compat.config({
//         extends: [
//             "./.eslint.js", // <- Aqui vai puxar os resolvers do plugin import
//         ],
//         rules: {
//             "semi": [ "warn", "always" ],
//             "indent": [ "error", 4 ],
//             "quotes": [ "error", "double" ],
//             "no-trailing-spaces": "error",
//             "no-mixed-spaces-and-tabs": "error",
//             "no-unused-vars": [ "error", { argsIgnorePattern: "^_" } ],  // Ignora args que começam com _

//             "camelcase": [ "error", { properties: "always" } ],
//             "no-multiple-empty-lines": [ "error", { max: 1 } ],
//             "react/jsx-curly-spacing": [
//                 "error",
//                 {
//                     "when": "always",
//                     "children": false,
//                     "allowMultiline": true,
//                     "spacing": {
//                         "objectLiterals": "always"
//                     }
//                 }
//             ],
//             "object-curly-spacing": [ "error", "always" ],
//             "array-bracket-spacing": [ "error", "always" ]
//         }
//     }),

// ];

// export default eslintConfig;

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tseslint from "@typescript-eslint/eslint-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    {
        ignores: [ "**/node_modules/**", "**/build/**", "**/.next/**" ], // removido components/ui
    },
    {
        files: [ "**/*.ts", "**/*.tsx" ],
        languageOptions: {
            parser: "@typescript-eslint/parser",
            parserOptions: {
                project: "./tsconfig.json",
                tsconfigRootDir: __dirname,
                sourceType: "module"
            }
        },
        plugins: {
            "@typescript-eslint": tseslint,
        },
        rules: {
            "@typescript-eslint/no-unused-vars": [ "error", { argsIgnorePattern: "^_" } ],
            "@typescript-eslint/explicit-function-return-type": "warn",
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/explicit-function-return-type": "off"
        }
    },
    ...compat.config({
        extends: [ "./.eslint.js" ],
        rules: {
            "semi": [ "warn", "always" ],
            "indent": [ "error", 4 ],
            "quotes": [ "error", "double" ],
            "no-trailing-spaces": "error",
            "no-mixed-spaces-and-tabs": "error",
            "no-unused-vars": [ "error", { argsIgnorePattern: "^_" } ],
            "camelcase": [ "error", { properties: "always" } ],
            "no-multiple-empty-lines": [ "error", { max: 1 } ],
            "react/jsx-curly-spacing": [
                "error",
                {
                    "when": "always",
                    "children": false,
                    "allowMultiline": true,
                    "spacing": {
                        "objectLiterals": "always"
                    }
                }
            ],
            "object-curly-spacing": [ "error", "always" ],
            "array-bracket-spacing": [ "error", "always" ]
        }
    }),
];

export default eslintConfig;
