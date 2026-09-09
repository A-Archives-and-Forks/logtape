/**
 * Deno Lint plugin providing all LogTape lint rules, including opt-in rules.
 *
 * Use this entry point instead of `@logtape/lint/deno` when enabling
 * `logtape/no-dynamic-message` or `logtape/no-unrendered-properties`.
 * Both are enabled by this entry point; use `lint.rules.exclude` to disable
 * either rule individually.
 *
 * @module
 */

export { strictPlugin as default } from "./plugin.ts";
