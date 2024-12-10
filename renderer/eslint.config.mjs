import pluginVue from "eslint-plugin-vue";
import vueTsEslintConfig from "@vue/eslint-config-typescript";
import prettier from "@vue/eslint-config-prettier";

export default [
	{
		name: "app/files-to-lint",
		files: ["**/*.{ts,mts,tsx,vue}"],
	},
	{
		name: "app/files-to-ignore",
		ignores: ["**/dist/**", "**/dist-ssr/**", "**/coverage/**"],
	},
	...pluginVue.configs["flat/essential"],
	{
		rules: {
			"vue/no-mutating-props": "off",
			"vue/multi-word-component-names": "off",
			"vue/require-v-for-key": "off",
		},
	},
	...vueTsEslintConfig(),
	prettier,
];
