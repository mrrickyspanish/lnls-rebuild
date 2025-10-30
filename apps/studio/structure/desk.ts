import type { StructureResolver } from "sanity/desk";

const deskStructure: StructureResolver = (S) =>
  S.list()
    .title("Late Night Lake Show")
    .items([
      S.listItem()
        .title("My Drafts")
        .child(
          S.documentList()
            .title("My Drafts")
            .filter("_type in ['article','podEpisode','video'] && meta.status != 'published'")
        ),
      S.listItem()
        .title("Needs Review")
        .child(
          S.documentList()
            .title("Needs Review")
            .filter("_type == 'article' && meta.status == 'inReview'")
        ),
      S.listItem()
        .title("Scheduled")
        .child(S.documentList().title("Scheduled").filter("meta.status == 'scheduled'")),
      S.listItem()
        .title("Recently Published")
        .child(
          S.documentList()
            .title("Recently Published")
            .filter("meta.status == 'published'")
            .defaultOrdering([{ field: "_updatedAt", direction: "desc" }])
        ),
      S.divider(),
      S.documentTypeListItem("article"),
      S.documentTypeListItem("podEpisode"),
      S.documentTypeListItem("video"),
      S.documentTypeListItem("gameday"),
      S.documentTypeListItem("siteSettings")
    ]);

export default deskStructure;
