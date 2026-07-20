import base from "@chinta/config/eslint/base";
import nextVitals from "eslint-config-next/core-web-vitals";

export default [
  ...base,
  ...nextVitals,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
