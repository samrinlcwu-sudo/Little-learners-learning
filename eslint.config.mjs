import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // eslint-config-next already registers the jsx-a11y plugin with a partial
  // rule set — extend it with the plugin's full recommended rules instead of
  // re-registering the plugin (which errors as a duplicate).
  { rules: jsxA11y.flatConfigs.recommended.rules },
  // Override default ignores of eslint-config-next. Anchored with a "**/"
  // prefix (not just ".next/**") so a build/output directory nested
  // anywhere — e.g. inside a git worktree under .claude/worktrees/ — is
  // still excluded, not just one at the repo root (Prompt 68 checkpoint:
  // `eslint .` was reporting 100+ false-positive errors from another
  // session's worktree's own compiled .next output).
  globalIgnores([
    // Default ignores of eslint-config-next:
    "**/.next/**",
    "**/out/**",
    "**/build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
