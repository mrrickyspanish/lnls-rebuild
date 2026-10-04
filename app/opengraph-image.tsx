import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

/**
 * The share card, generated rather than stored.
 *
 * The previous card pointed at /uploads/articles/dribbles_og_2024.png, which
 * is not in the repo, so every share that reached for it got a 404. Generating
 * it means there is no asset to go missing, and it inherits down to every page
 * that does not set its own image.
 */
export const alt = 'The Daily Dribble'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpengraphImage() {
  // Anton is vendored rather than fetched. Satori needs TTF (not the WOFF2
  // next/font emits), and reading from disk keeps card rendering free of a
  // network call that could fail at request time.
  const anton = await readFile(join(process.cwd(), 'app/_fonts/Anton-Regular.ttf'))

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0D0D0D',
          padding: '72px 80px',
borderTop: '18px solid #FF6B35',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 30,
              letterSpacing: 10,
              color: '#A8ACB2',
              fontWeight: 700,
            }}
          >
            THE DAILY
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
            <div
              style={{
                fontSize: 156,
                lineHeight: 1,
                color: '#F2F2EF',
                fontWeight: 800,
                letterSpacing: -4,
              }}
            >
              DRIBBLE
            </div>
            <div style={{ display: 'flex', marginLeft: 22, marginTop: 92 }}>
              <div style={{ width: 22, height: 22, background: '#FF6B35' }} />
              <div style={{ width: 22, height: 22, background: '#00D4FF', marginLeft: 10 }} />
              <div style={{ width: 22, height: 22, background: '#B857FF', marginLeft: 10 }} />
            </div>
          </div>
        </div>

        <div style={{ fontSize: 38, color: '#A8ACB2', display: 'flex' }}>
          Sports, tech, and the culture around the game.
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'Anton', data: anton, style: 'normal', weight: 400 }],
    }
  )
}
