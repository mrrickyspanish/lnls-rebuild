import { createClient } from "@sanity/client";

export const sanityClient = () => {
  const projectId = process.env.SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET ?? "production";
  const token = process.env.SANITY_API_READ_TOKEN;

  if (!projectId) {
    console.warn("SANITY_PROJECT_ID missing - returning null client");
    return null;
  }

  return createClient({
    projectId,
    dataset,
    apiVersion: "2024-05-01",
    useCdn: true,
    token
  });
};
