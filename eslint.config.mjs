import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

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
    rules: {
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
