import * as path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: [
			{
				find: /^@tomhhealy\/contracts$/,
				replacement: path.resolve(import.meta.dirname, "./packages/contracts/src/index.ts"),
			},
			{
				find: /^@tomhhealy\/shared$/,
				replacement: path.resolve(import.meta.dirname, "./packages/shared/src/index.ts"),
			},
		],
	},
});
