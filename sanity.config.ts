import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { media } from 'sanity-plugin-media'

import { schemaTypes } from './studio/schemas'

export default defineConfig({
  name: 'lnls-studio',
  title: 'LNLS Platform',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  basePath: '/studio',
  plugins: [structureTool(), visionTool(), media()],
  schema: {
    types: schemaTypes,
  },
})
