import { defineField, defineType } from "sanity";

export default defineType({
  name: "article",
  title: "Article",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string" }),
    defineField({ name: "slug", type: "slug", options: { source: "title" } }),
    defineField({ name: "dek", type: "text" }),
    defineField({ name: "heroImage", type: "image", options: { hotspot: true } }),
    defineField({ name: "body", type: "array", of: [{ type: "block" }, { type: "image" }] }),
    defineField({ name: "author", type: "reference", to: [{ type: "author" }] }),
    defineField({ name: "coAuthors", type: "array", of: [{ type: "reference", to: [{ type: "author" }] }] }),
    defineField({ name: "tags", type: "array", of: [{ type: "reference", to: [{ type: "tag" }] }] }),
    defineField({ name: "teams", type: "array", of: [{ type: "reference", to: [{ type: "team" }] }] }),
    defineField({ name: "players", type: "array", of: [{ type: "reference", to: [{ type: "player" }] }] }),
    defineField({ name: "series", type: "reference", to: [{ type: "series" }] }),
    defineField({ name: "publishAt", type: "datetime" }),
    defineField({ name: "seo", type: "seo" }),
    defineField({ name: "meta", type: "metaState" }),
    defineField({
      name: "visibility",
      type: "string",
      options: {
        list: [
          { title: "Public", value: "public" },
          { title: "Private", value: "private" }
        ]
      },
      initialValue: "public"
    })
  ]
});
