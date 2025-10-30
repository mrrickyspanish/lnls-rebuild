import { defineType } from "sanity";

export default defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    { name: "title", type: "string" },
    { name: "description", type: "text" },
    { name: "keywords", type: "array", of: [{ type: "string" }] }
  ]
});
