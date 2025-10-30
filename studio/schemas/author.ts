import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: [],
        },
      ],
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      options: {
        list: [
          { title: 'Editor', value: 'editor' },
          { title: 'Staff Writer', value: 'writer' },
          { title: 'Contributor', value: 'contributor' },
          { title: 'Host', value: 'host' },
        ],
      },
    }),
    defineField({
      name: 'social',
      title: 'Social Links',
      type: 'object',
      fields: [
        {
          name: 'twitter',
          title: 'X/Twitter Handle',
          type: 'string',
        },
        {
          name: 'instagram',
          title: 'Instagram Handle',
          type: 'string',
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
      role: 'role',
    },
    prepare(selection) {
      const { role } = selection
      return {
        ...selection,
        subtitle: role || 'Author',
      }
    },
  },
})
