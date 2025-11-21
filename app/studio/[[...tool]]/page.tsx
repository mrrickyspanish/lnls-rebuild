'use client'

import { NextStudio } from 'next-sanity/studio'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'

const config = defineConfig({
  name: 'default',
  title: 'Late Night Lake Show',
  projectId: 'lvyw4h7w',
  dataset: 'production',
  basePath: '/studio',
  plugins: [structureTool(), visionTool()],
  schema: {
    types: [
      {
        name: 'article',
        title: 'Article',
        type: 'document',
        fields: [
          {
            name: 'title',
            title: 'Title',
            type: 'string',
          },
          {
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: { source: 'title' },
          },
          {
            name: 'content',
            title: 'Content', 
            type: 'text',
          },
        ],
      },
      {
        name: 'author',
        title: 'Author',
        type: 'document',
        fields: [
          {
            name: 'name',
            title: 'Name',
            type: 'string',
          },
          {
            name: 'bio',
            title: 'Bio',
            type: 'text',
          },
        ],
      },
    ],
  },
})

export default function StudioPage() {
  return <NextStudio config={config} />
}