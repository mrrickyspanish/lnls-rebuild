import { defineField, defineType } from "sanity";

export default defineType({
  name: "player",
  title: "Player",
  type: "document",
  fields: [
    defineField({ name: "fullName", type: "string" }),
    defineField({ name: "slug", type: "slug", options: { source: "fullName" } }),
    defineField({ name: "team", type: "reference", to: [{ type: "team" }] })
  ]
});
