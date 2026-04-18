import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  js.configs.recommended,

  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node
      }
    },

    rules: {
      // Engineering-friendly rules
      "no-unused-vars": "warn",
      "no-console": "off", // CLI app needs console
      "no-undef": "error"
    }
  }
]);