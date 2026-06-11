import { parse, visit } from "graphql";
import { MAX_GRAPHQL_QUERY_DEPTH, MAX_GRAPHQL_QUERY_LENGTH } from "@/lib/validate";

export function validateGraphQLQuery(query: string): string | null {
  if (query.length > MAX_GRAPHQL_QUERY_LENGTH) {
    return `Query exceeds maximum length of ${MAX_GRAPHQL_QUERY_LENGTH}`;
  }

  let maxDepth = 0;
  const depthStack: number[] = [0];

  try {
    const document = parse(query);
    visit(document, {
      Field: {
        enter() {
          depthStack[depthStack.length - 1]++;
          maxDepth = Math.max(maxDepth, depthStack.length);
          depthStack.push(0);
        },
        leave() {
          depthStack.pop();
        },
      },
    });
  } catch {
    return "Invalid GraphQL query";
  }

  if (maxDepth > MAX_GRAPHQL_QUERY_DEPTH) {
    return `Query exceeds maximum depth of ${MAX_GRAPHQL_QUERY_DEPTH}`;
  }

  return null;
}
