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
    // Flag `@link`s to names not in scope; count the rest as uses
    rules: { "jsdoc/no-undefined-types": "warn" },
  },
  {
    // Enforce preferred import order (see AGENTS.md -> Conventions -> Imports)
    // Usable because `eslint-config-next` includes `eslint-plugin-import`
    rules: {
      "import/order": [
        "warn",
        {
          groups: [["builtin", "external"], "internal", ["parent", "sibling"]],
          pathGroups: [
            { pattern: "@/**", group: "internal" },
            { pattern: "./*.module.css", group: "sibling", position: "after" },
          ],
          "newlines-between": "never",
          alphabetize: { order: "asc", caseInsensitive: true },
          named: { enabled: true, types: "types-last" },
        },
      ],
      // Works like `import/consistent-type-specifier-style` but
      // allows inline `type` specifiers iff they are mixed with values
      "custom-type-specifier-style": [
        "warn",
        {
          selector:
            'ImportDeclaration[importKind="value"]:has(ImportSpecifier[importKind="type"]):not(:has(ImportSpecifier[importKind="value"], ImportDefaultSpecifier, ImportNamespaceSpecifier))',
          message:
            "Use `import type { … }` when every imported name is a type.",
        },
        {
          selector:
            'ExportNamedDeclaration[exportKind="value"]:has(ExportSpecifier[exportKind="type"]):not(:has(ExportSpecifier[exportKind="value"]))',
          message:
            "Use `export type { … }` when every exported name is a type.",
        },
      ],
    },
  },
  prettier, // disables ESLint rules that conflict w/ Prettier
]);

export default eslintConfig;
