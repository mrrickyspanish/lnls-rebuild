module.exports = {
  root: true,
  extends: [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:import/typescript"
  ],
  plugins: ["unused-imports"],
  rules: {
    "import/order": [
      "error",
      {
        "alphabetize": { "order": "asc", "caseInsensitive": true },
        "newlines-between": "always",
        "groups": [["builtin", "external"], ["internal"], ["parent", "sibling", "index"]]
      }
    ],
    "unused-imports/no-unused-imports": "error"
  },
  settings: {
    next: {
      rootDir: ["apps/*/"]
    }
  }
};
