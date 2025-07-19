module.exports = {
    extends: [
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
        "next/core-web-vitals",
        "next",
        "next/typescript",
    ],
    plugins: [ "import" ],
    settings: {
        "import/resolver": {
            typescript: {
                project: "./tsconfig.json",
            },
        },
    },
};
