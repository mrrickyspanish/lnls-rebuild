"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { EditorContent, JSONContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import HardBreak from '@tiptap/extension-hard-break'
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table'

import { VideoEmbed } from '@/lib/tiptap/video-extension'
import { CalloutCard } from '@/lib/tiptap/callout-card-extension'
import { TwitterEmbed, parseTweetUrl } from '@/lib/tiptap/twitter-extension'
import { ArticleImage, type ImageSize } from '@/lib/tiptap/article-image-extension'
import { StatBlock, cleanStats } from '@/lib/tiptap/stat-block-extension'
import { KeyTakeaways, DEFAULT_TAKEAWAYS_TITLE } from '@/lib/tiptap/key-takeaways-extension'
import { topicFamily } from '@/lib/topics'
import {
  ImageDialog,
  StatDialog,
  TakeawaysDialog,
  type ImageDialogValue,
  type StatDialogValue,
} from '@/components/admin/editor/BlockDialogs'

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
  /** The article's topic, so stat numbers and rules preview in its color. */
  topic?: string
}

type DialogState =
  | { kind: 'image'; mode: 'insert' | 'edit'; askForUrl: boolean; initial: ImageDialogValue }
  | { kind: 'stats'; mode: 'insert' | 'edit'; initial: StatDialogValue }
  | { kind: 'takeaways'; mode: 'insert' | 'edit'; title: string }
  | null

const NO_ACTIVE_STATE = {
  paragraph: false, h2: false, h3: false, bold: false, italic: false, bulletList: false,
  orderedList: false, blockquote: false, callout: false, link: false, image: false,
  stats: false, takeaways: false, table: false, canUndo: false, canRedo: false,
}

const EMPTY_IMAGE: ImageDialogValue = { src: '', caption: '', alt: '', size: 'wide' }

function ToolButton({
  label,
  title,
  onClick,
  active = false,
  disabled = false,
  className = '',
}: {
  label: React.ReactNode
  title: string
  onClick: () => void
  active?: boolean
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`min-h-[36px] px-3 py-1.5 rounded text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        active
          ? 'bg-[var(--neon-orange)] text-black font-semibold'
          : 'bg-neutral-700 text-neutral-200 hover:bg-neutral-600'
      } ${className}`}
    >
      {label}
    </button>
  )
}

const Divider = () => <div className="w-px h-8 bg-neutral-600 mx-1" aria-hidden="true" />

export default function RichTextEditor({ value, onChange, onReady, topic }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [dialog, setDialog] = useState<DialogState>(null)
  // The editor's event handlers are bound once, so they call through this
  // ref to reach the current render's function.
  const editSelectionRef = useRef<() => void>(() => {})
  const MAX_MB = 4

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
        hardBreak: false,
        // Disable built-ins that are registered separately below
        // to prevent the "Duplicate extension names" TipTap warning.
        link: false,
        underline: false,
      }),
      HardBreak.extend({
        addKeyboardShortcuts() {
          return {
            'Shift-Enter': () => this.editor.commands.setHardBreak(),
          }
        },
      }),
      Underline,
      // Same image, stat, takeaways and table nodes the article page renders
      // (components/article/ArticleBody.tsx), so the editor previews them.
      ArticleImage,
      StatBlock,
      KeyTakeaways,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        HTMLAttributes: {
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
        // The article page's own body styles, so writers see real line
        // length, subheads, quotes and figures while they write.
        class: 'tdd-prose tdd-prose--editor',
      },
      handleDoubleClickOn: (_view, _pos, node) => {
        if (node.type.name === 'image' || node.type.name === 'statBlock') {
          // Let the click select the node first, then open its dialog.
          setTimeout(() => editSelectionRef.current(), 0)
          return true
        }
        return false
      },
    },
    onUpdate({ editor }) {
      const json = editor.getJSON()
      onChange(json)
    },
    immediatelyRender: false,
  })

  // Tiptap v3 does not re-render on selection changes by default, so the
  // toolbar's active states and the context bar read from this. It yields
  // nothing until the editor's first transaction, and an article saved by
  // this editor loads without one, so the toolbar must not wait on it.
  const activeState = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            paragraph: e.isActive('paragraph'),
            h2: e.isActive('heading', { level: 2 }),
            h3: e.isActive('heading', { level: 3 }),
            bold: e.isActive('bold'),
            italic: e.isActive('italic'),
            bulletList: e.isActive('bulletList'),
            orderedList: e.isActive('orderedList'),
            blockquote: e.isActive('blockquote'),
            callout: e.isActive('calloutCard'),
            link: e.isActive('link'),
            image: e.isActive('image'),
            stats: e.isActive('statBlock'),
            takeaways: e.isActive('keyTakeaways'),
            table: e.isActive('table'),
            canUndo: e.can().undo(),
            canRedo: e.can().redo(),
          }
        : null,
  })
  const active = activeState ?? NO_ACTIVE_STATE

  const openImageDialog = useCallback((initial: Partial<ImageDialogValue>, askForUrl: boolean) => {
    setDialog({ kind: 'image', mode: 'insert', askForUrl, initial: { ...EMPTY_IMAGE, ...initial } })
  }, [])

  function openEditForSelection() {
    if (!editor) return
    if (editor.isActive('image')) {
      const attrs = editor.getAttributes('image')
      setDialog({
        kind: 'image',
        mode: 'edit',
        askForUrl: false,
        initial: {
          src: attrs.src || '',
          caption: attrs.caption || '',
          alt: attrs.alt || '',
          size: (attrs.size as ImageSize) || 'wide',
        },
      })
    } else if (editor.isActive('statBlock')) {
      const attrs = editor.getAttributes('statBlock')
      setDialog({ kind: 'stats', mode: 'edit', initial: { stats: cleanStats(attrs.stats), source: attrs.source || '' } })
    }
  }

  editSelectionRef.current = openEditForSelection

  const closeDialog = useCallback(() => {
    setDialog(null)
    editor?.commands.focus()
  }, [editor])

  const saveImage = (image: ImageDialogValue, mode: 'insert' | 'edit') => {
    if (!editor) return
    const attrs = { src: image.src, caption: image.caption || null, alt: image.alt || null, size: image.size }
    if (mode === 'edit') {
      editor.chain().focus().updateAttributes('image', attrs).run()
    } else {
      editor.chain().focus().setArticleImage(attrs).run()
    }
    setDialog(null)
  }

  const saveStats = (stats: StatDialogValue, mode: 'insert' | 'edit') => {
    if (!editor) return
    if (mode === 'edit') {
      editor.chain().focus().updateAttributes('statBlock', { stats: cleanStats(stats.stats), source: stats.source }).run()
    } else {
      editor.chain().focus().setStatBlock(stats).run()
    }
    setDialog(null)
  }

  const saveTakeaways = (title: string, mode: 'insert' | 'edit') => {
    if (!editor) return
    if (mode === 'edit') {
      editor.chain().focus().updateAttributes('keyTakeaways', { title }).run()
    } else {
      editor.chain().focus().insertKeyTakeaways(title).run()
    }
    setDialog(null)
  }

  useEffect(() => {
    if (!editor || !value) return
    const current = editor.getJSON()
    if (JSON.stringify(current) === JSON.stringify(value)) return
    try {
      editor.commands.setContent(value)
    } catch (error) {
      console.error('Failed to apply editor content, falling back to default doc:', error)
      editor.commands.setContent(DEFAULT_CONTENT)
    }
  }, [editor, value])

  // Expose helper back to parent once editor is ready. Images uploaded from
  // the form's "article image" picker open the same dialog as the toolbar.
  useEffect(() => {
    if (!editor || !onReady) return

    const insertImage = (url: string, caption?: string) => {
      openImageDialog({ src: url, caption: caption ?? '' }, false)
    }

    onReady({ insertImage })
  }, [editor, onReady, openImageDialog])

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

      openImageDialog({ src: data.path }, false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload image'
      window.alert(message)
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [editor, openImageDialog])

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

    const attributes = parseTweetUrl(url)
    if (!attributes) {
      window.alert('Unsupported tweet URL.')
      return
    }

    if (editor.isActive('calloutCard')) {
      const { $from } = editor.state.selection
      for (let depth = $from.depth; depth > 0; depth -= 1) {
        if ($from.node(depth).type.name === 'calloutCard') {
          const insertPos = $from.after(depth)
          editor
            .chain()
            .focus()
            .insertContentAt(insertPos, {
              type: 'twitterEmbed',
              attrs: attributes,
            })
            .run()
          return
        }
      }
    }

    editor
      .chain()
      .focus()
      .insertContent({
        type: 'twitterEmbed',
        attrs: attributes,
      })
      .run()
  }, [editor])

  if (!editor) {
    return <div className="text-neutral-400">Loading editor...</div>
  }

  const chain = () => editor.chain().focus()

  return (
    <div className="border border-neutral-700 rounded-md bg-neutral-900" data-family={topicFamily(topic)}>
      {/* Toolbar */}
      {/* From tablet width up, parks just under the site nav (64px, 72px from
          1024px, plus its 1px rule). On phones it wraps to five rows, too
          tall to pin over the text. */}
      <div className="md:sticky md:top-[65px] lg:top-[73px] z-10 flex flex-wrap gap-1 p-2 border-b border-neutral-700 bg-neutral-800 rounded-t-md">
        {/* Block Types */}
        <ToolButton label="P" title="Paragraph" active={active.paragraph} onClick={() => chain().setParagraph().run()} />
        <ToolButton label="H2" title="Section heading" active={active.h2} className="font-bold" onClick={() => chain().toggleHeading({ level: 2 }).run()} />
        <ToolButton label="H3" title="Sub-heading" active={active.h3} className="font-bold" onClick={() => chain().toggleHeading({ level: 3 }).run()} />

        <Divider />

        {/* Text Formatting */}
        <ToolButton label="B" title="Bold (Ctrl+B)" active={active.bold} className="font-semibold" onClick={() => chain().toggleBold().run()} />
        <ToolButton label="I" title="Italic (Ctrl+I)" active={active.italic} className="italic" onClick={() => chain().toggleItalic().run()} />

        <Divider />

        {/* Lists and story blocks */}
        <ToolButton label="•" title="Bullet list" active={active.bulletList} onClick={() => chain().toggleBulletList().run()} />
        <ToolButton label="1." title="Numbered list" active={active.orderedList} onClick={() => chain().toggleOrderedList().run()} />
        <ToolButton label="&quot; Quote" title="Pull quote" active={active.blockquote} onClick={() => chain().toggleBlockquote().run()} />
        <ToolButton label="💡 Callout" title="Callout box" active={active.callout} onClick={() => chain().toggleCalloutCard().run()} />
        <ToolButton
          label="# Stats"
          title={active.stats ? 'Edit stats' : 'Add stats (big numbers)'}
          active={active.stats}
          onClick={() =>
            active.stats
              ? openEditForSelection()
              : setDialog({ kind: 'stats', mode: 'insert', initial: { stats: [], source: '' } })
          }
        />
        <ToolButton
          label="☰ Takeaways"
          title={active.takeaways ? 'Rename takeaways box' : 'Add key takeaways box'}
          active={active.takeaways}
          onClick={() =>
            setDialog({
              kind: 'takeaways',
              mode: active.takeaways ? 'edit' : 'insert',
              title: active.takeaways ? editor.getAttributes('keyTakeaways').title || DEFAULT_TAKEAWAYS_TITLE : DEFAULT_TAKEAWAYS_TITLE,
            })
          }
        />
        <ToolButton
          label="▦ Table"
          title="Add a stat table"
          active={active.table}
          disabled={active.table}
          onClick={() => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        />
        <ToolButton label="―" title="Divider" onClick={() => chain().setHorizontalRule().run()} />

        <Divider />

        {/* Media */}
        <ToolButton label="🔗" title="Add link" active={active.link} onClick={addLink} />
        <ToolButton label="X" title="Embed tweet" onClick={addTweet} />
        <ToolButton label="🎬" title="Embed video" onClick={addVideo} />
        <ToolButton label={uploadingImage ? '…' : '🖼️ Upload'} title="Upload image" disabled={uploadingImage} onClick={addImage} />
        <ToolButton label="🖼️ URL" title="Insert image by URL" onClick={() => openImageDialog({}, true)} />

        <Divider />

        {/* Special */}
        <ToolButton label="↵" title="Line break (Shift+Enter)" onClick={() => chain().setHardBreak().run()} />

        <Divider />

        {/* Undo/Redo */}
        <ToolButton label="↶" title="Undo" disabled={!active.canUndo} onClick={() => chain().undo().run()} />
        <ToolButton label="↷" title="Redo" disabled={!active.canRedo} onClick={() => chain().redo().run()} />
      </div>

      {/* Context bar: actions for whatever block is selected */}
      {(active.image || active.stats || active.table) && (
        <div className="flex flex-wrap items-center gap-1 px-2 py-2 border-b border-neutral-700 bg-neutral-900 text-sm">
          {active.image && (
            <>
              <span className="px-2 font-semibold text-neutral-300">Image</span>
              <ToolButton label="Edit caption, description & width" title="Edit image" onClick={openEditForSelection} />
              <ToolButton label="Remove" title="Remove image" onClick={() => chain().deleteSelection().run()} />
            </>
          )}
          {active.stats && (
            <>
              <span className="px-2 font-semibold text-neutral-300">Stats</span>
              <ToolButton label="Edit stats" title="Edit stats" onClick={openEditForSelection} />
              <ToolButton label="Remove" title="Remove stats" onClick={() => chain().deleteSelection().run()} />
            </>
          )}
          {active.table && (
            <>
              <span className="px-2 font-semibold text-neutral-300">Table</span>
              <ToolButton label="+ Row" title="Add row below" onClick={() => chain().addRowAfter().run()} />
              <ToolButton label="+ Column" title="Add column to the right" onClick={() => chain().addColumnAfter().run()} />
              <ToolButton label="− Row" title="Delete this row" onClick={() => chain().deleteRow().run()} />
              <ToolButton label="− Column" title="Delete this column" onClick={() => chain().deleteColumn().run()} />
              <ToolButton label="Header row" title="Toggle header row" onClick={() => chain().toggleHeaderRow().run()} />
              <ToolButton label="Delete table" title="Delete table" onClick={() => chain().deleteTable().run()} />
            </>
          )}
        </div>
      )}

      {/* Editor Content */}
      <EditorContent editor={editor} className="bg-[var(--bg-primary)] rounded-b-md" />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {dialog?.kind === 'image' && (
        <ImageDialog
          initial={dialog.initial}
          askForUrl={dialog.askForUrl}
          mode={dialog.mode}
          onCancel={closeDialog}
          onSave={(image) => saveImage(image, dialog.mode)}
        />
      )}
      {dialog?.kind === 'stats' && (
        <StatDialog
          initial={dialog.initial}
          mode={dialog.mode}
          onCancel={closeDialog}
          onSave={(stats) => saveStats(stats, dialog.mode)}
        />
      )}
      {dialog?.kind === 'takeaways' && (
        <TakeawaysDialog
          initialTitle={dialog.title}
          mode={dialog.mode}
          onCancel={closeDialog}
          onSave={(title) => saveTakeaways(title, dialog.mode)}
        />
      )}
    </div>
  )
}
