import { defineField, defineType } from "sanity";

export default defineType({
  name: "team",
  title: "Team",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string" }),
    defineField({ name: "slug", type: "slug", options: { source: "name" } }),
    defineField({ name: "abbreviation", type: "string" }),
    defineField({ name: "colors", type: "array", of: [{ type: "string" }] })
  ]
});
