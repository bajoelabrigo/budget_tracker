import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Reglas base de Next
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Ignorar ciertas carpetas
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },

  // 👇 Aquí agregas tus reglas personalizadas
  {
    rules: {
      "@typescript-eslint/no-explicit-any": ["error", { ignoreRestArgs: true }],
      "@typescript-eslint/no-empty-object-type": [
        "error",
        { allowObjectTypes: true },
      ],
      "@typescript-eslint/no-unsafe-function-type": "warn",
    },
  },

  // 👇 Y opcionalmente excepciones para carpetas generadas o legacy
  {
    files: ["**/*legacy*.ts", "**/*legacy*.tsx", "**/generated/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
];

export default eslintConfig;
