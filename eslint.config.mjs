import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ["src/**/*.{js,ts,jsx,tsx}"]
  }, {
    ignores: ["*.min.js", "src/models/", "src/static/", "src/public/"],
  }, {
    rules: {
      "no-undef": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/triple-slash-reference": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          "ignoreRestSiblings": true,
          "argsIgnorePattern": "(^_|^req$|^request$|^res$|^next$|^h$)",
          "varsIgnorePattern": "(^_|^req$|^request$|^res$|^next$|^h$)"
        }
      ],
      "@typescript-eslint/ban-ts-comment": "warn",
      "no-async-promise-executor": "off"
    },
  }
);
