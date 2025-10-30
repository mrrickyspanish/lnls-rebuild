import { defineType } from "sanity";

export default defineType({
  name: "metaState",
  title: "Workflow Meta",
  type: "object",
  fields: [
    {
      name: "status",
      type: "string",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "In Review", value: "inReview" },
          { title: "Approved", value: "approved" },
          { title: "Scheduled", value: "scheduled" },
          { title: "Published", value: "published" }
        ]
      },
      initialValue: "draft"
    },
    { name: "approvedBy", type: "reference", to: [{ type: "author" }] },
    { name: "scheduledAt", type: "datetime" },
    { name: "lastReviewedAt", type: "datetime" }
  ]
});
