import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "branding", title: "Branding" },
    { name: "contact", title: "Contact" }
  ],
  fields: [
    defineField({ name: "siteName", type: "string", group: "branding" }),
    defineField({ name: "tagline", type: "string", group: "branding" }),
    defineField({ name: "contactEmail", type: "string", group: "contact" }),
    defineField({ name: "socials", type: "array", of: [{ type: "object", fields: [{ name: "platform", type: "string" }, { name: "url", type: "url" }] }], group: "contact" }),
    defineField({ name: "podcastOwnerEmail", type: "string", group: "contact" }),
    defineField({ name: "rssSource", type: "url", group: "contact" })
  ]
});
