import vuePlugin from "eslint-plugin-vue";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import vueParser from "vue-eslint-parser";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.ts", "**/*.vue"],
    languageOptions: {
      parser: vueParser, // ✅ Must be imported, not a string
      parserOptions: {
        parser: tsParser, // ✅ Must be imported object
        ecmaVersion: 2021,
        sourceType: "module",
        extraFileExtensions: [".vue"]
      },
    },
    plugins: {
      vue: vuePlugin,
      "@typescript-eslint": tsPlugin
    },
    rules: {
      // ESLint core rules
      "no-console": "warn",
      "no-unused-vars": "warn",

      // Vue plugin rules
      "vue/no-unused-components": "warn",

      // TypeScript plugin rules
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn"
    }
  }
];
