import type { Config } from "tailwindcss";
import preset from "@lnls/config/tailwind";

const config: Config = {
  presets: [preset],
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"]
};

export default config;
