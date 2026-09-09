import type { Rule } from "eslint";
import {
  findUnrenderedProperties,
  LOG_METHODS,
  logMethodName,
} from "../core/ast.ts";
import { createLogtapeScope } from "../utils.ts";

/**
 * Find call-site properties not referenced by a static message template.
 * This opt-in rule is intended for message-only outputs.  Structured sinks
 * can retain these properties without including them in the message.
 */
export const noUnrenderedProperties: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Find properties not referenced by a log message template",
      recommended: false,
      url: "https://logtape.org/lint/no-unrendered-properties",
    },
    schema: [],
    messages: {
      unrenderedProperty:
        "Property '{{name}}' is not referenced by the message template and " +
        "may be omitted by sinks that output only the message.",
    },
  },
  create(context) {
    const scope = createLogtapeScope(context);
    return {
      ImportDeclaration: scope.ImportDeclaration,
      CallExpression(node) {
        if (!scope.isLogtapeCall(node.callee, node)) return;
        const method = logMethodName(node.callee);
        if (!method || !LOG_METHODS.has(method)) return;
        for (const property of findUnrenderedProperties(node.arguments)) {
          context.report({
            node: property.node,
            messageId: "unrenderedProperty",
            data: { name: property.key },
          });
        }
      },
    };
  },
};
