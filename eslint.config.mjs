import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import importPlugin from "eslint-plugin-import";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // 型チェック（parserOptions.project）は TypeScript ファイルのみに限定する。
    // 全ファイル対象にすると、tsconfig.json の include に含まれない
    // eslint.config.mjs / postcss.config.mjs 自身が Parsing error になる。
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      // 型チェック強化（@typescript-eslint）
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/consistent-type-imports": ["error", { "prefer": "type-imports" }],
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          pathGroups: [
            {
              pattern: "react",
              group: "external",
              position: "before",
            },
            {
              pattern: "next/**",
              group: "external",
              position: "before",
            },
            {
              pattern: "@/**",
              group: "internal",
            },
          ],
          pathGroupsExcludedImportTypes: ["react", "next/**"],
          "newlines-between": "never",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExportNamedDeclaration[source!=null]",
          message: "再エクスポート (export { ... } from '...') は禁止です。直接インポートして使用してください。",
        },
        {
          selector: "ExportAllDeclaration",
          message: "再エクスポート (export * from '...') は禁止です。直接インポートして使用してください。",
        },
      ],
    },
  },
]);

export default eslintConfig;
