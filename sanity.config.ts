import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { media } from 'sanity-plugin-media'

import { schemaTypes } from './schemas'

export default defineConfig({
  name: 'lnls-studio',
  title: 'LNLS Content Studio',
  
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  
  basePath: '/studio',
  
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Articles')
              .child(
                S.documentTypeList('article')
                  .title('Articles')
                  .filter('_type == "article"')
              ),
            S.divider(),
            S.listItem()
              .title('Podcast Episodes')
              .child(
                S.documentTypeList('episode')
                  .title('Episodes')
                  .filter('_type == "episode"')
              ),
            S.divider(),
            S.listItem()
              .title('Authors')
              .child(
                S.documentTypeList('author')
                  .title('Authors')
                  .filter('_type == "author"')
              ),
            S.divider(),
            S.listItem()
              .title('Settings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
              ),
          ]),
    }),
    visionTool(),
    media(),
  ],
  
  schema: {
    types: schemaTypes,
  },
})
