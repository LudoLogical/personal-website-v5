import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import jsdoc from "eslint-plugin-jsdoc";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { jsdoc },
    rules: { "jsdoc/no-undefined-types": "warn" }, // flags {@link}s to names not in scope; counts the rest as uses
  },
  prettier, // disables ESLint rules that conflict w/ Prettier
]);

export default eslintConfig;
