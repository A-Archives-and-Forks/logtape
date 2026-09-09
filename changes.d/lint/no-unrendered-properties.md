---
links:
  '#214': https://github.com/dahlia/logtape/pull/214
---
 -  Added an opt-in `no-unrendered-properties` lint rule to
    *@logtape/lint* for finding properties that are not referenced by a
    message template and may be omitted by sinks that output only the
    message.  The rule is excluded from the `recommended` preset and the
    default Deno Lint plugin, and is included in
    `@logtape/lint/deno/strict`.  [[#214]]
