import { defineField, defineType } from "sanity";

export default defineType({
  name: "gameday",
  title: "Game Day",
  type: "document",
  fields: [
    defineField({ name: "opponentTeam", type: "reference", to: [{ type: "team" }] }),
    defineField({ name: "gameDateTime", type: "datetime" }),
    defineField({ name: "venue", type: "string" }),
    defineField({ name: "tv", type: "string" }),
    defineField({ name: "radio", type: "string" }),
    defineField({ name: "bettingLine", type: "string" }),
    defineField({ name: "injuries", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "preview", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "recapUrl", type: "url" }),
    defineField({ name: "status", type: "string" })
  ]
});
