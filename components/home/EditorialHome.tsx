'use client'

import Link from 'next/link'
import { useAudioPlayer } from '@/lib/audio/AudioPlayerContext'

export type EditorialItem = {
  id: string | number; title: string; excerpt?: string; description?: string;
  image_url?: string | null; source_url?: string | null; published_at?: string | null;
  content_type?: string | null; topic?: string; author_name?: string; audio_url?: string;
}

function summary(item: EditorialItem) {
  const text = (item.excerpt || item.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  if (text.length <= 180) return text
  return text.slice(0, 177).replace(/\s+\S*$/, '') + '…'
}
function date(value?: string | null) {
  if (!value || Number.isNaN(Date.parse(value))) return ''
  return new Date(value).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric', timeZone:'UTC'})
}
function Picture({item, lead=false}: {item:EditorialItem; lead?:boolean}) {
  return <div className={lead ? 'editorial-lead-image' : 'editorial-thumb'}>{item.image_url ? <img src={item.image_url} alt="" loading={lead ? 'eager' : 'lazy'} decoding="async" /> : <span aria-hidden="true">TDD<span className="text-[#2FE6C8]">.</span></span>}</div>
}
function Story({item, lead=false}: {item:EditorialItem; lead?:boolean}) {
  return <Link href={item.source_url || '/news'} className={lead ? 'editorial-lead' : 'editorial-story'}>
    <Picture item={item} lead={lead}/><div className="editorial-copy">
      <p className="editorial-kicker">{item.topic || 'Sports'} · Article</p>
      {lead ? <h2>{item.title}</h2> : <h3>{item.title}</h3>}
      {summary(item) && <p className="editorial-summary">{summary(item)}</p>}
      <p className="editorial-meta">{item.author_name && <span>{item.author_name} · </span>}{date(item.published_at)}</p>
      {lead && <span className="editorial-action">Read the story ↗</span>}
    </div>
  </Link>
}
export default function EditorialHome({articles, podcasts, videos}: {articles:EditorialItem[]; podcasts:EditorialItem[]; videos:EditorialItem[]}) {
  const {playEpisode, currentEpisode, isPlaying} = useAudioPlayer()
  const lead = articles[0]
  return <div className="editorial-home">
    <section className="editorial-intro"><h1>Where the game meets what’s next.</h1><p>Sports. Tech. Culture.</p></section>
    {lead && <section className="editorial-cover-grid" aria-label="Featured stories"><div className="editorial-cover"><p className="editorial-cover-label">The cover story</p><Story item={lead} lead/></div>{articles.length > 1 && <aside className="editorial-on-deck" aria-label="More featured stories"><p className="editorial-deck-label">Also in the mix</p>{articles.slice(1,3).map((item,index)=><div className="editorial-deck-story" key={item.id}><span className="editorial-deck-number" aria-hidden="true">0{index+2}</span><Story item={item}/></div>)}</aside>}</section>}
    {articles.length > 3 && <section className="editorial-section"><div className="editorial-section-heading"><div><p className="editorial-kicker">The reading room</p><h2>Latest stories</h2></div><Link href="/news">All articles</Link></div><div className="editorial-stories">{articles.slice(3,11).map(item=><Story key={item.id} item={item}/>)}</div></section>}
    {!lead && <section className="editorial-empty"><p className="editorial-kicker">From the archive</p><h2>Start with Late Night Lake Show.</h2><p>Explore the conversations below, or browse our article archive.</p><Link className="editorial-action" href="/news">Explore articles ↗</Link></section>}
    {podcasts.length > 0 && <section className="editorial-section"><div className="editorial-section-heading"><div><p className="editorial-kicker">Listen in</p><h2>Late Night Lake Show</h2><p>Lakers conversations, analysis, and opinions.</p></div><Link href="/podcast">All episodes ↗</Link></div><div className="editorial-podcasts">{podcasts.slice(0,3).map(item=><article className="editorial-podcast" key={item.id}><Picture item={item}/><div className="editorial-copy"><p className="editorial-kicker">Podcast · {date(item.published_at)}</p><h3>{item.title}</h3><p className="editorial-summary">{summary(item)}</p><button className="editorial-action" disabled={!item.audio_url && !item.source_url} onClick={()=>playEpisode({id:String(item.id),title:item.title,audio_url:item.audio_url || item.source_url!,image_url:item.image_url || undefined},podcasts.map(p=>({id:String(p.id),title:p.title,audio_url:p.audio_url || p.source_url!,image_url:p.image_url || undefined})))}>{currentEpisode?.id === String(item.id) && isPlaying ? 'Playing' : 'Play episode'} <span aria-hidden="true">▷</span></button></div></article>)}</div></section>}
    {videos.length > 0 && <section className="editorial-section"><div className="editorial-section-heading"><div><p className="editorial-kicker">On screen</p><h2>Latest videos</h2></div><Link href="/videos">All videos ↗</Link></div><div className="editorial-video-grid">{videos.slice(0,3).map(item=><a key={item.id} href={item.source_url || '/videos'} className="editorial-video"><Picture item={item}/><p className="editorial-kicker">Video · {date(item.published_at)}</p><h3>{item.title}</h3><p className="editorial-summary">{summary(item)}</p><span className="editorial-action">Watch video ↗</span></a>)}</div></section>}
  </div>
}
