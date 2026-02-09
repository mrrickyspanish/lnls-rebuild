"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { EditorContent, JSONContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import HardBreak from '@tiptap/extension-hard-break'

import { VideoEmbed } from '@/lib/tiptap/video-extension'
import { CalloutCard } from '@/lib/tiptap/callout-card-extension'
import { TwitterEmbed } from '@/lib/tiptap/twitter-extension'

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
  onReady?: (helpers: { insertImage: (url: string, caption?: string) => void }) => void
}

export default function RichTextEditor({ value, onChange, onReady }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const MAX_MB = 4

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
        hardBreak: false,
      }),
      HardBreak.extend({
        addKeyboardShortcuts() {
          return {
            'Shift-Enter': () => this.editor.commands.setHardBreak(),
          }
        },
      }),
      Underline,
      Image.configure({
        inline: false,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4',
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        HTMLAttributes: {
          class: 'text-red-400 underline hover:text-red-300 transition-colors',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Placeholder.configure({
        placeholder: 'Tell the story of this article...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      VideoEmbed,
      TwitterEmbed,
      CalloutCard,
    ],
    content: value ?? DEFAULT_CONTENT,
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-base md:prose-lg max-w-none focus:outline-none min-h-[400px] px-4 py-3 prose-headings:text-white prose-headings:text-xl md:prose-headings:text-2xl prose-p:text-neutral-300 prose-p:leading-relaxed prose-p:my-4 md:prose-p:my-6 prose-a:text-red-400 prose-a:underline hover:prose-a:text-red-300 prose-strong:text-white prose-ul:text-neutral-300 prose-ol:text-neutral-300 prose-hr:border-white/10 prose-hr:my-6 md:prose-hr:my-8 prose-blockquote:border-l-red-600 prose-blockquote:text-neutral-300 prose-[.callout-card]:border-l-orange-500 prose-[.callout-card]:text-neutral-200',
      },
    },
    onUpdate({ editor }) {
      const json = editor.getJSON()
      onChange(json)
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    if (!editor || !value) return
    const current = editor.getJSON()
    if (JSON.stringify(current) === JSON.stringify(value)) return
    editor.commands.setContent(value)
  }, [editor, value])

  // Expose helper back to parent once editor is ready
  useEffect(() => {
    if (!editor || !onReady) return

    const insertImage = (url: string, caption?: string) => {
      editor.chain().focus().setImage({ src: url }).run()
      if (caption) {
        editor.chain().focus().insertContent(`<p><em>${caption}</em></p>`).run()
      }
    }

    onReady({ insertImage })
  }, [editor, onReady])

  const addLink = useCallback(() => {
    if (!editor) return

    const previousUrl = editor.getAttributes('link').href
    const input = window.prompt('Enter URL:', previousUrl)

    if (input === null) return

    const url = input.trim()

    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    if (editor.state.selection.empty) {
      editor.chain().focus().insertContent({
        type: 'text',
        text: url,
        marks: [{ type: 'link', attrs: { href: url } }],
      }).run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const addImage = useCallback(() => {
    if (uploadingImage) return
    fileInputRef.current?.click()
  }, [uploadingImage])

  const addImageByUrl = useCallback(() => {
    if (!editor) return

    const url = window.prompt('Enter image URL:')?.trim()
    if (!url) return

    editor.chain().focus().setImage({ src: url }).run()

    const caption = window.prompt('Enter image caption (optional):')?.trim()
    if (caption) {
      editor.chain().focus().insertContent(`<p><em>${caption}</em></p>`).run()
    }
  }, [editor])

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    if (file.size > MAX_MB * 1024 * 1024) {
      window.alert(`File must be under ${MAX_MB}MB (current ${(file.size / 1024 / 1024).toFixed(1)}MB)`)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      let data: any
      try {
        data = await response.json()
      } catch (parseErr) {
        const text = await response.text()
        throw new Error(text || 'Upload failed')
      }

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      editor.chain().focus().setImage({ src: data.path }).run()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload image'
      window.alert(message)
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [editor])

  const addVideo = useCallback(() => {
    if (!editor) return

    const url = window.prompt('Enter video URL (YouTube, Vimeo, Streamable, or direct .mp4/.webm/.mov):')
    if (!url) return

    const sizeChoice = window.prompt('Choose size:\nType: small, medium, or full (default: medium)')?.toLowerCase().trim()
    const size = sizeChoice === 'small' || sizeChoice === 'medium' || sizeChoice === 'full' ? sizeChoice : 'medium'

    // @ts-expect-error - custom command from VideoEmbed extension
    editor.chain().focus().setVideoEmbed(url, size).run()
  }, [editor])

  const addTweet = useCallback(() => {
    if (!editor) return

    const url = window.prompt('Enter tweet URL (x.com or twitter.com):')?.trim()
    if (!url) return

    // @ts-expect-error - custom command from TwitterEmbed extension
    editor.chain().focus().setTwitterEmbed(url).run()
  }, [editor])

  const addHardBreak = useCallback(() => {
    if (!editor) return
    editor.chain().focus().setHardBreak().run()
  }, [editor])

  const addHorizontalRule = useCallback(() => {
    if (!editor) return
    editor.chain().focus().setHorizontalRule().run()
  }, [editor])

  const setParagraph = useCallback(() => {
    if (!editor) return
    editor.chain().focus().setParagraph().run()
  }, [editor])

  if (!editor) {
    return <div className="text-neutral-400">Loading editor...</div>
  }

  return (
    <div className="border border-neutral-700 rounded-md bg-neutral-900">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-neutral-700 bg-neutral-800 overflow-x-auto">
        {/* Block Types */}
        <button
          type="button"
          onClick={setParagraph}
          className={`px-3 py-1.5 rounded text-sm transition-colors ${
            editor.isActive('paragraph')
              ? 'bg-red-600 text-white'
              : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
          }`}
          title="Paragraph"
        >
          P
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1.5 rounded text-sm font-bold transition-colors ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-red-600 text-white'
              : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
          }`}
          title="Heading 2"
        >
          H2
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-3 py-1.5 rounded text-sm font-bold transition-colors ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-red-600 text-white'
              : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
          }`}
          title="Heading 3"
        >
          H3
        </button>

        <div className="w-px h-8 bg-neutral-600 mx-1" />

        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors ${
            editor.isActive('bold')
              ? 'bg-red-600 text-white'
              : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
          }`}
          title="Bold (Ctrl+B)"
        >
          B
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`px-3 py-1.5 rounded text-sm italic transition-colors ${
            editor.isActive('italic')
              ? 'bg-red-600 text-white'
              : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
          }`}
          title="Italic (Ctrl+I)"
        >
          I
        </button>

        <div className="w-px h-8 bg-neutral-600 mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1.5 rounded text-sm transition-colors ${
            editor.isActive('bulletList')
              ? 'bg-red-600 text-white'
              : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
          }`}
          title="Bullet List"
        >
          •
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1.5 rounded text-sm transition-colors ${
            editor.isActive('orderedList')
              ? 'bg-red-600 text-white'
              : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
          }`}
          title="Numbered List"
        >
          1.
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-3 py-1.5 rounded text-sm transition-colors ${
            editor.isActive('blockquote')
              ? 'bg-red-600 text-white'
              : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
          }`}
          title="Quote"
        >
          &quot;
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCalloutCard().run()}
          className={`px-3 py-1.5 rounded text-sm transition-colors ${
            editor.isActive('calloutCard')
              ? 'bg-red-600 text-white'
              : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
          }`}
          title="Callout Card"
        >
          💡
        </button>

        <button
          type="button"
          onClick={addHorizontalRule}
          className="px-3 py-1.5 rounded text-sm bg-neutral-700 text-neutral-300 hover:bg-neutral-600 transition-colors"
          title="Divider"
        >
          ―
        </button>

        <div className="w-px h-8 bg-neutral-600 mx-1" />

        {/* Media */}
        <button
          type="button"
          onClick={addLink}
          className={`px-3 py-1.5 rounded text-sm transition-colors ${
            editor.isActive('link')
              ? 'bg-red-600 text-white'
              : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
          }`}
          title="Add Link"
        >
          🔗
        </button>

        <button
          type="button"
          onClick={addTweet}
          className="px-3 py-1.5 rounded text-sm bg-neutral-700 text-neutral-300 hover:bg-neutral-600 transition-colors"
          title="Embed Tweet"
        >
          X
        </button>

        <button
          type="button"
          onClick={addVideo}
          className="px-3 py-1.5 rounded text-sm bg-neutral-700 text-neutral-300 hover:bg-neutral-600 transition-colors"
          title="Embed video"
        >
          🎬
        </button>

        <button
          type="button"
          onClick={addImage}
          disabled={uploadingImage}
          className="px-3 py-1.5 rounded text-sm bg-neutral-700 text-neutral-300 hover:bg-neutral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Upload image"
        >
          {uploadingImage ? '…' : '🖼️'}
        </button>

        <button
          type="button"
          onClick={addImageByUrl}
          className="px-3 py-1.5 rounded text-sm bg-neutral-700 text-neutral-300 hover:bg-neutral-600 transition-colors"
          title="Insert image by URL"
        >
          🔗🖼️
        </button>

        <div className="w-px h-8 bg-neutral-600 mx-1" />

        {/* Special */}
        <button
          type="button"
          onClick={addHardBreak}
          className="px-3 py-1.5 rounded text-sm bg-neutral-700 text-neutral-300 hover:bg-neutral-600 transition-colors"
          title="Line Break (Shift+Enter)"
        >
          ↵
        </button>

        <div className="w-px h-8 bg-neutral-600 mx-1" />

        {/* Undo/Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="px-3 py-1.5 rounded text-sm bg-neutral-700 text-neutral-300 hover:bg-neutral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo"
        >
          ↶
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="px-3 py-1.5 rounded text-sm bg-neutral-700 text-neutral-300 hover:bg-neutral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo"
        >
          ↷
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="bg-neutral-950" />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )

}

