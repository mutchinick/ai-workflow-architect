/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jest-environment-jsdom",
  setupFiles: ["<rootDir>/jest.env.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // Compile TS/TSX/JS/JSX with SWC (including ESM deps)
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          target: "es2021",
          transform: { react: { runtime: "automatic" } },
        },
        module: { type: "commonjs" }, // Jest expects CJS
      },
    ],
  },

  // Keep CSS-module optimization; otherwise do not ignore node_modules (so ESM deps are transformed)
  transformIgnorePatterns: ["^.+\\.module\\.(css|sass|scss)$"],

  // If you use "@/..." imports, map them (adjust to src/ if you use it)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^.+\\.(css|sass|scss)$":
      "<rootDir>/node_modules/next/dist/build/jest/__mocks__/styleMock.js",
    "^.+\\.module\\.(css|sass|scss)$":
      "<rootDir>/node_modules/next/dist/build/jest/object-proxy.js",
  },

  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],

  // Helps resolve ESM “exports” fields
  testEnvironmentOptions: {
    customExportConditions: ["node", "require", "default"],
  },
};

export default config;
