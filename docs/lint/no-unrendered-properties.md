`no-unrendered-properties`
==========================

*This rule is introduced in LogTape 2.4.0.*

Find properties that are not referenced by a log message template.

| Severity | Fixable | Category                   |
| -------- | ------- | -------------------------- |
| off      | no      | `no-unrendered-properties` |

This rule is opt-in and is not part of the `recommended` preset.  Use `warn`
when enabling it in ESLint or Oxlint.


Rationale
---------

Some sinks and log bridges forward only the rendered message.  A property
passed alongside that message can then disappear from the output:

~~~~ typescript
logger.error("{operation} failed", { operation, error });
~~~~

Here, `error` is available in the log record but is not part of the message.
If the sink only writes the message, the error details may be lost.  Include
what you need to read in the template:

~~~~ typescript
logger.error("{operation} failed: {error.message}", { operation, error });
~~~~

Unreferenced properties are valid structured logging data.  JSON Lines,
logfmt, and other sinks or formatters can retain them separately from the
message.  Leave this rule disabled if that matches your project's convention.
The rule does not inspect your sink configuration or guarantee that a value
will be printed usefully.

This rule was inspired by [cmdr's `no-unrendered-log-fields` rule], which caught
error details omitted by a frontend log bridge.

[cmdr's `no-unrendered-log-fields` rule]: https://github.com/vdavid/cmdr/commit/8e24eb2a62362287d33c640c5a820d5bbc462d1d


Examples
--------

With this rule enabled, these calls produce a diagnostic:

~~~~ typescript
logger.info("Started", { id });
logger.error("{operation} failed", () => ({ operation, error }));
logger.info("{{id}}", { id }); // Escaped braces do not reference id.
~~~~

These calls reference their properties:

~~~~ typescript
logger.info("Started {id}", { id });
logger.error("{operation} failed: {error.message}", () => ({ operation, error }));
logger.info("First item: {items[0].name}", { items });
logger.info("User: {user?.name}", { user });
logger.info("Details: {*}", { id, operation });
~~~~

`{*}` references the whole properties bag unless a property named `"*"`
overrides it.  If a wildcard placeholder contains whitespace, a key matching
that whitespace takes precedence over `"*"`.

`{error.message}` counts as a reference to `error`; it does not mean that the
whole error, including its stack or cause, appears in the message.  Choose the
fields your output needs.  There is no automatic fix because adding a
placeholder or removing a property requires that judgment.


Analysis boundaries
-------------------

The rule checks static string literals and template literals without `${}`
interpolation.  Properties must be an object literal or an expression-bodied
arrow function returning one, including an async arrow.  TypeScript assertions
and `satisfies` wrappers are supported.

Static string and numeric keys are checked, including computed literal keys.
An object containing a spread or an unknown key is skipped.  Variables,
function calls, block-bodied callbacks, and general function expressions are
not followed.  Dynamic messages, properties-only calls, Error overloads,
first-argument callbacks, and tagged templates are outside this rule's scope.

Only fields supplied at the call site are checked.  Fields inherited from
`logger.with()` or implicit contexts need not appear in every message.  The
rule uses the same logger recognition as the other LogTape rules, including
import aliases and child loggers; custom logger factories are not tracked.

The analysis favors avoiding false positives.  A direct key such as
`"error.message"` and the nested root `error` both count as referenced when
the template uses `{error.message}`.  The rule does not evaluate which lookup
will succeed or validate the remainder of a nested path.  A `"*"` property
hidden in a context can also override `{*}` without this rule detecting the
resulting omission.


Configuration
-------------

ESLint v9 flat config:

~~~~ javascript
import logtape from "@logtape/lint/eslint";

export default [
  logtape.configs.recommended,
  {
    rules: {
      "logtape/no-unrendered-properties": "warn",
    },
  },
];
~~~~

Oxlint (`.oxlintrc.json`):

~~~~ json
{
  "jsPlugins": [
    { "name": "logtape", "specifier": "@logtape/lint/eslint" }
  ],
  "rules": {
    "logtape/no-unrendered-properties": "warn"
  }
}
~~~~

Deno Lint (`deno.json`), enabling this rule alongside the recommended rules:

~~~~ json
{
  "lint": {
    "plugins": ["jsr:@logtape/lint/deno/strict"],
    "rules": {
      "exclude": ["logtape/no-dynamic-message"]
    }
  }
}
~~~~

The default `/deno` entry point omits this rule.  `/deno/strict` enables all
LogTape rules, including both opt-in rules.  Remove the `exclude` setting to
use both.  To keep only `no-dynamic-message` alongside the recommended rules,
exclude `logtape/no-unrendered-properties` instead.  An `include` list does not
disable other plugin rules.

Deno Lint does not provide ESLint-style warning severity for this rule;
violations make `deno lint` exit unsuccessfully.  Use the host linter's ignore
directives for intentional exceptions.
