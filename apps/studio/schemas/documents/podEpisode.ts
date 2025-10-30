import { defineField, defineType } from "sanity";

export default defineType({
  name: "podEpisode",
  title: "Podcast Episode",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string" }),
    defineField({ name: "slug", type: "slug", options: { source: "title" } }),
    defineField({ name: "episodeNumber", type: "number" }),
    defineField({ name: "audioUrl", type: "url" }),
    defineField({ name: "duration", type: "string" }),
    defineField({ name: "publishedAt", type: "datetime" }),
    defineField({ name: "showNotes", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "guests", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "youtubeId", type: "string" }),
    defineField({ name: "externalGuid", type: "string" }),
    defineField({ name: "meta", type: "metaState" }),
    defineField({
      name: "visibility",
      type: "string",
      options: { list: [ { title: "Public", value: "public" }, { title: "Private", value: "private" } ] },
      initialValue: "public"
    })
  ]
});
