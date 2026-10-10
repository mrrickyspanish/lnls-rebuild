import { isNoteKind, isPieceType, type NoteKind, type PieceType } from '@/lib/articles/piece-type'

export interface TrustFieldsPayload {
  pieceType?: string
  rumorSource?: string
  noteKind?: string
  noteText?: string
}

export interface TrustFields {
  article_type: PieceType
  rumor_source: string | null
  note_kind: NoteKind | null
  note_text: string | null
}

/**
 * Validates the label, rumor source and note sent by the admin editor.
 * Every piece needs a label; a Rumor needs to say who is reporting it; a
 * note needs to say whether it's an update or a correction. An empty note
 * clears it.
 */
export function readTrustFields(
  payload: TrustFieldsPayload
): { fields: TrustFields; error?: never } | { fields?: never; error: string } {
  if (!isPieceType(payload.pieceType)) {
    return { error: 'Pick a label: Opinion, Analysis, Report or Rumor.' }
  }

  const rumorSource = payload.rumorSource?.trim() || null
  if (payload.pieceType === 'rumor' && !rumorSource) {
    return { error: 'A rumor needs to say who is reporting it.' }
  }

  const noteText = payload.noteText?.trim() || null
  if (noteText && !isNoteKind(payload.noteKind)) {
    return { error: 'Say whether the note is an update or a correction.' }
  }

  return {
    fields: {
      article_type: payload.pieceType,
      // Only rumors show a source line, so don't keep a stale one around.
      rumor_source: payload.pieceType === 'rumor' ? rumorSource : null,
      note_kind: noteText ? (payload.noteKind as NoteKind) : null,
      note_text: noteText,
    },
  }
}

/**
 * PostgREST answers PGRST204 ("Could not find the '…' column") when a save
 * names a column the table doesn't have, i.e. a migration hasn't been run.
 * Say which one, instead of a generic failure.
 */
export function missingColumnMessage(error: { code?: string; message?: string } | null) {
  if (!error) return null
  const message = error.message ?? ''
  const missing = error.code === 'PGRST204' || /column .* does not exist|could not find the .* column/i.test(message)
  if (!missing) return null
  const file = /cover_has_text/.test(message)
    ? 'supabase/add_cover_has_text.sql'
    : 'supabase/add_piece_labels_and_notes.sql'
  return `The database is missing a column this save needs. Run ${file} in the Supabase SQL Editor, then save again.`
}
