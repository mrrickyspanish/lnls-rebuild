"use client"

import { useCallback } from 'react'
import { EditorContent, JSONContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'

import { VideoEmbed } from '@/lib/tiptap/video-extension'

const DEFAULT_CONTENT: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: '',
        },
      ],
    },
  ],
}

interface RichTextEditorProps {
  value: JSONContent | null
  onChange: (content: JSONContent) => void
}

const BUTTON_BASE =
  'px-3 py-2 rounded-md text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors'

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Underline,
      Image.configure({ inline: false, HTMLAttributes: { class: 'rounded-lg' } }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'text-red-400 underline',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Placeholder.configure({ placeholder: 'Tell the story...' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      VideoEmbed,
    ],
    editorProps: {
      attributes: {
        class:
          'prose prose-invert max-w-none min-h-[400px] focus:outline-none text-lg leading-relaxed',
      },
    },
    content: value ?? DEFAULT_CONTENT,
    onUpdate({ editor }) {
      const json = editor.getJSON()
      onChange(json)
    },
    immediatelyRender: false,
  })

  const promptForValue = useCallback((label: string) => {
    if (typeof window === 'undefined') return null
    const response = window.prompt(label)
    return response && response.trim().length > 0 ? response.trim() : null
  }, [])

  const handleLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href
    const url = promptForValue('Enter URL') || previousUrl

    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url, target: '_blank' }).run()
  }, [editor, promptForValue])

  const handleImage = useCallback(() => {
    if (!editor) return
    const src = promptForValue('Paste image URL (including GIFs)')
    if (!src) return
    editor.chain().focus().setImage({ src, alt: '' }).run()
  }, [editor, promptForValue])

  const handleVideo = useCallback(() => {
    if (!editor) return
    const src = promptForValue('Paste YouTube or Vimeo URL')
    if (!src) return
    editor.chain().focus().setVideo({ src }).run()
  }, [editor, promptForValue])

  if (!editor) {
    return (
      <div className="w-full rounded-lg border border-neutral-800 bg-neutral-900 p-6 text-neutral-500">
        Loading editor...
      </div>
    )
  }

  const isActive = (action: () => boolean) => {
    try {
      return action()
    } catch {
      return false
    }
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl">
      <div className="flex flex-wrap gap-2 border-b border-neutral-800 bg-black/30 px-4 py-3">
        <button
          type="button"
          className={`${BUTTON_BASE} ${isActive(() => editor.isActive('bold')) ? 'bg-white/10 text-white' : ''}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </button>
        <button
          type="button"
          className={`${BUTTON_BASE} ${isActive(() => editor.isActive('italic')) ? 'bg-white/10 text-white' : ''}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </button>
        <button
          type="button"
          className={`${BUTTON_BASE} ${isActive(() => editor.isActive('underline')) ? 'bg-white/10 text-white' : ''}`}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          Underline
        </button>
        <button
          type="button"
          className={`${BUTTON_BASE} ${isActive(() => editor.isActive('heading', { level: 2 })) ? 'bg-white/10 text-white' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </button>
        <button
          type="button"
          className={`${BUTTON_BASE} ${isActive(() => editor.isActive('heading', { level: 3 })) ? 'bg-white/10 text-white' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </button>
        <button
          type="button"
          className={`${BUTTON_BASE} ${isActive(() => editor.isActive('bulletList')) ? 'bg-white/10 text-white' : ''}`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          Bullets
        </button>
        <button
          type="button"
          className={`${BUTTON_BASE} ${isActive(() => editor.isActive('orderedList')) ? 'bg-white/10 text-white' : ''}`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          Numbers
        </button>
        <button
          type="button"
          className={`${BUTTON_BASE} ${isActive(() => editor.isActive('blockquote')) ? 'bg-white/10 text-white' : ''}`}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          Quote
        </button>
        <button type="button" className={BUTTON_BASE} onClick={handleLink}>
          Link
        </button>
        <button type="button" className={BUTTON_BASE} onClick={handleImage}>
          Image/GIF
        </button>
        <button type="button" className={BUTTON_BASE} onClick={handleVideo}>
          Video
        </button>
        <button type="button" className={BUTTON_BASE} onClick={() => editor.chain().focus().undo().run()}>
          Undo
        </button>
        <button type="button" className={BUTTON_BASE} onClick={() => editor.chain().focus().redo().run()}>
          Redo
        </button>
      </div>
      <div className="px-4 py-6">
        <EditorContent editor={editor} className="richtext-editor" />
      </div>
    </div>
  )
}
