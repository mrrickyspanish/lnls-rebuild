import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { visionTool } from "@sanity/vision";
import { workflowPlugin } from "sanity-plugin-workflow";
import deskStructure from "./structure/desk";
import { schemaTypes } from "./schemas";
import {
  approveAction,
  lnlsBotAction,
  publishNowAction,
  schedulePublishAction,
  submitForReviewAction,
  unpublishAction
} from "./actions/statusActions";

const contentTypes = ["article", "podEpisode", "video"];

export default defineConfig({
  name: "lnls-studio",
  title: "Late Night Lake Show Studio",
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || "",
  dataset: process.env.SANITY_STUDIO_DATASET || "production",
  basePath: "/",
  plugins: [
    deskTool({ structure: deskStructure }),
    visionTool(),
    workflowPlugin({
      schemaTypes: contentTypes,
      states: [
        { id: "draft", title: "Draft", color: "gray" },
        { id: "inReview", title: "In Review", color: "orange" },
        { id: "approved", title: "Approved", color: "blue" },
        { id: "scheduled", title: "Scheduled", color: "purple" },
        { id: "published", title: "Published", color: "green" }
      ],
      roles: [
        { name: "contributor", title: "Contributor" },
        { name: "writer", title: "Writer" },
        { name: "editor", title: "Editor" },
        { name: "admin", title: "Admin" }
      ]
    })
  ],
  schema: { types: schemaTypes },
  document: {
    actions: (prev, context) => {
      if (!contentTypes.includes(context.schemaType)) {
        return prev;
      }
      return [
        submitForReviewAction,
        approveAction,
        schedulePublishAction,
        publishNowAction,
        unpublishAction,
        lnlsBotAction,
        ...prev
      ];
    }
  }
});
