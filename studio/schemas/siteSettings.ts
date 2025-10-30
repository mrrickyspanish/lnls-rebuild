import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Site Title',
      type: 'string',
      initialValue: 'Late Night Lake Show',
    }),
    defineField({
      name: 'description',
      title: 'Site Description',
      type: 'text',
      initialValue: 'Where Lakers fans stay up talking ball.',
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'social',
      title: 'Social Links',
      type: 'object',
      fields: [
        {
          name: 'twitter',
          title: 'X/Twitter',
          type: 'url',
        },
        {
          name: 'instagram',
          title: 'Instagram',
          type: 'url',
        },
        {
          name: 'youtube',
          title: 'YouTube',
          type: 'url',
        },
        {
          name: 'tiktok',
          title: 'TikTok',
          type: 'url',
        },
      ],
    }),
    defineField({
      name: 'newsletter',
      title: 'Newsletter Settings',
      type: 'object',
      fields: [
        {
          name: 'enabled',
          title: 'Enable Newsletter',
          type: 'boolean',
          initialValue: true,
        },
        {
          name: 'heading',
          title: 'Heading',
          type: 'string',
          initialValue: 'Stay in the Loop',
        },
        {
          name: 'description',
          title: 'Description',
          type: 'text',
          initialValue: 'Get the latest Lakers news and LNLS updates delivered daily.',
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Settings',
      }
    },
  },
})
