import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'

import { schemaTypes } from './studio/schemas'

export default defineConfig({
  name: 'lnls-studio',
  title: 'LNLS Platform',
  projectId: 'lvyw4h7w',
  dataset: 'production',
  basePath: '/studio',
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
})
