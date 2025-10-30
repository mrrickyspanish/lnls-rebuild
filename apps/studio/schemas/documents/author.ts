import { defineField, defineType } from "sanity";

export default defineType({
  name: "author",
  title: "Author",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string" }),
    defineField({ name: "slug", type: "slug", options: { source: "name" } }),
    defineField({ name: "avatar", type: "image", options: { hotspot: true } }),
    defineField({ name: "bio", type: "array", of: [{ type: "block" }] }),
    defineField({
      name: "socials",
      type: "array",
      of: [{ type: "object", fields: [{ name: "platform", type: "string" }, { name: "url", type: "url" }] }]
    }),
    defineField({ name: "email", type: "string" })
  ]
});
