import { defineField, defineType } from "sanity";

export default defineType({
  name: "video",
  title: "Video",
  type: "document",
  fields: [
    defineField({ name: "youtubeId", type: "string" }),
    defineField({ name: "title", type: "string" }),
    defineField({ name: "description", type: "text" }),
    defineField({ name: "playlist", type: "string" }),
    defineField({ name: "publishedAt", type: "datetime" }),
    defineField({ name: "tags", type: "array", of: [{ type: "reference", to: [{ type: "tag" }] }] }),
    defineField({ name: "teams", type: "array", of: [{ type: "reference", to: [{ type: "team" }] }] }),
    defineField({ name: "meta", type: "metaState" }),
    defineField({
      name: "visibility",
      type: "string",
      options: { list: [ { title: "Public", value: "public" }, { title: "Private", value: "private" } ] },
      initialValue: "public"
    })
  ]
});
