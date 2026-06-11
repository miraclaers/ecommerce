import { describe, it, expect } from "vitest";
import { validateGraphQLQuery } from "./graphql-guard";
import { MAX_GRAPHQL_QUERY_LENGTH } from "./validate";

describe("validateGraphQLQuery", () => {
  it("accepts a simple query", () => {
    expect(validateGraphQLQuery("{ products { id title } }")).toBeNull();
  });

  it("rejects oversized queries", () => {
    const query = `{ products { id ${"x ".repeat(MAX_GRAPHQL_QUERY_LENGTH)} } }`;
    expect(validateGraphQLQuery(query)).toMatch(/maximum length/);
  });

  it("rejects deeply nested queries", () => {
    let nested = "{ __type(name: \"Product\") { fields { type { ";
    for (let i = 0; i < 15; i++) {
      nested += "ofType { ";
    }
    nested += "name";
    nested += " }".repeat(15);
    nested += " } } } }";
    expect(validateGraphQLQuery(nested)).toMatch(/maximum depth/);
  });
});
