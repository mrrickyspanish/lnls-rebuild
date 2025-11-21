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
      name: 'avatar',
      title: 'Avatar',
      type: 'image',
      options: {
        hotspot: true,
      }
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 3
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'avatar'
    }
  }
})