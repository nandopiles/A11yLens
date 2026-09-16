import { useEffect, useState } from 'react';
import type { DemoComponentProps } from '@/features/demos/types';
import {
  feedPosts,
  liveBadgeLabel,
  silentClipSrc,
  voiceNoteTranscript,
  photoSrc,
  likedPostIds,
  engagementLabels,
  type FeedPost,
} from './feed.data';

/**
 * Social feed demo — a vivid, real-looking feed that exercises several disabilities at once.
 *
 * Broken:
 *  - Voice note with NO transcript (audio-only content).
 *  - Tremor/vestibular: auto-advance + a blinking "EN VIVO" badge.
 *  - Dyslexia: dense body text, no headings, tight line-height.
 *  - Color blindness: a poll whose winner is shown ONLY by green/red, and a "like" state
 *    shown ONLY by heart color.
 *  - Screen reader: real <img> with NO alt, and icon-only <button>s with no accessible name.
 *
 * Accessible: transcript, no autoplay/blink, readable spacing with a heading per post, poll
 * results as text (✓ Ganadora + %), like state as text + aria-pressed, alt on every image,
 * and named engagement buttons. Pure content: no store/core/panel.
 */
export function SocialFeedDemo({ accessible }: DemoComponentProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (accessible) return; // Accessible version never auto-advances (WCAG 2.2.2).
    const timer = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % feedPosts.length);
    }, 1400);
    return () => window.clearInterval(timer);
  }, [accessible]);

  return (
    <div className="mx-auto max-w-md space-y-4" data-demo-goal="read-feed">
      {!accessible && (
        <style>{`@keyframes a11ylens-blink { 0%,49% { opacity:1 } 50%,100% { opacity:0 } }`}</style>
      )}

      {feedPosts.map((post, index) => {
        const isActive = index === activeIndex;
        return (
          <article
            key={post.id}
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#fff',
              boxShadow: !accessible && isActive ? '0 8px 24px rgba(15,23,42,0.12)' : '0 1px 2px rgba(15,23,42,0.04)',
              transform: !accessible && isActive ? 'scale(1.01)' : 'scale(1)',
              transition: 'transform 200ms, box-shadow 200ms',
            }}
          >
            {/* Post header: avatar + author */}
            <div className="flex items-center justify-between px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  style={{ display: 'grid', placeItems: 'center', width: '38px', height: '38px', borderRadius: '9999px', background: `linear-gradient(135deg, ${post.photoColor}, ${post.photoColor2})`, fontSize: '18px' }}
                >
                  {post.avatar}
                </span>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{post.author}</div>
                  {/* Broken: #cbd5e1 handle ~1.5:1. Accessible: #475569 ~7:1. WCAG 1.4.3 */}
                  <div className="font-mono text-[11px]" style={{ color: accessible ? '#475569' : '#cbd5e1' }}>
                    {post.handle}
                  </div>
                </div>
              </div>
              {!accessible && isActive && (
                // A11Y-DEFECT: fast blinking element — WCAG 2.3.1
                <span
                  style={{ animation: 'a11ylens-blink 400ms steps(1) infinite', background: '#dc2626', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '9999px' }}
                >
                  {liveBadgeLabel}
                </span>
              )}
            </div>

            {/*
              Photo as a REAL <img>. Broken: no alt → screen reader says "imagen, sin
              descripción". Accessible: descriptive alt. — revealed by Screen reader — WCAG 1.1.1
            */}
            <div style={{ position: 'relative' }}>
              <img
                src={photoSrc(post)}
                alt={accessible ? post.photoAlt : ''}
                style={{ display: 'block', width: '100%', height: '150px', objectFit: 'cover' }}
              />
              <span
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '12px',
                  fontSize: '13px',
                  ...(accessible
                    ? { color: '#ffffff', background: 'rgba(15,23,42,0.8)', padding: '3px 8px', borderRadius: '6px' }
                    : { color: 'rgba(255,255,255,0.5)' }),
                }}
              >
                {post.caption}
              </span>
            </div>

            {accessible && (
              <h3 style={{ margin: 0, padding: '12px 14px 0', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                {post.author}
              </h3>
            )}
            <p
              style={{
                margin: 0,
                padding: accessible ? '6px 14px 10px' : '10px 14px',
                fontSize: accessible ? '14px' : '13px',
                lineHeight: accessible ? 1.7 : 1.2,
                // Broken: dense body at #aab4c2 ~2.6:1. Accessible: #1e293b ~14:1. WCAG 1.4.3 / 1.4.8
                color: accessible ? '#1e293b' : '#aab4c2',
              }}
            >
              {post.body}
            </p>

            {post.poll && <Poll poll={post.poll} accessible={accessible} />}

            {post.audioDuration && (
              <div style={{ padding: '0 14px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 10px' }}>
                  <span aria-hidden="true" style={{ fontSize: '16px' }}>🎙️</span>
                  <audio controls preload="none" src={silentClipSrc} style={{ height: '32px', flex: 1 }}>
                    Tu navegador no puede reproducir este audio.
                  </audio>
                  {/* Broken: #cbd5e1 duration ~1.5:1. Accessible: #475569 ~7:1. WCAG 1.4.3 */}
                  <span className="font-mono text-xs" style={{ color: accessible ? '#475569' : '#cbd5e1' }}>{post.audioDuration}</span>
                </div>

                {accessible ? (
                  <details open style={{ marginTop: '8px', fontSize: '13px', color: '#334155' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Transcripción</summary>
                    <p style={{ margin: '6px 0 0', lineHeight: 1.6 }}>{voiceNoteTranscript}</p>
                  </details>
                ) : (
                  // A11Y-DEFECT: info lives only in the audio, no transcript/captions —
                  // WCAG 1.2.1 / 1.2.2; also #cbd5e1 ~1.5:1 low contrast — WCAG 1.4.3
                  <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#cbd5e1' }}>(Sin transcripción)</p>
                )}
              </div>
            )}

            <EngagementBar post={post} accessible={accessible} />
          </article>
        );
      })}
    </div>
  );
}

/**
 * A poll. Broken: the winning option is shown ONLY by color (green bar/border) and the loser
 * red, with no text or icon — invisible under color blindness. Accessible: adds a "✓ Ganadora"
 * text badge and the percentage, so the result never depends on color.
 */
function Poll({ poll, accessible }: { poll: NonNullable<FeedPost['poll']>; accessible: boolean }) {
  return (
    <div style={{ padding: '0 14px 12px' }}>
      <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{poll.question}</p>
      <div style={{ display: 'grid', gap: '8px' }}>
        {poll.options.map((opt) => {
          const barColor = opt.winner ? '#16a34a' : '#dc2626';
          return (
            <div
              key={opt.id}
              style={{
                position: 'relative',
                border: `2px solid ${accessible ? '#e2e8f0' : barColor}`,
                borderRadius: '10px',
                padding: '8px 10px',
                overflow: 'hidden',
                background: '#fff',
              }}
            >
              {/* Fill bar. Broken: colored by win/lose (the only signal). Accessible: neutral. */}
              <div
                aria-hidden="true"
                style={{ position: 'absolute', inset: 0, width: `${opt.pct}%`, background: accessible ? '#eef2ff' : `${barColor}22` }}
              />
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ flex: 1, fontSize: '13px', color: '#0f172a' }}>{opt.label}</span>
                {accessible && (
                  <>
                    {opt.winner && (
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '2px 8px', borderRadius: '9999px' }}>
                        ✓ Ganadora
                      </span>
                    )}
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155', minWidth: '38px', textAlign: 'right' }}>
                      {opt.pct}%
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Engagement buttons. Broken: real <button>s but icon-only (no accessible name), and the
 * "liked" state is shown ONLY by heart color (red vs grey). Accessible: aria-label + visible
 * text + aria-pressed, so screen reader and color-blind users both get the state.
 */
function EngagementBar({ post, accessible }: { post: FeedPost; accessible: boolean }) {
  const liked = likedPostIds.has(post.id);
  const btn: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    padding: '4px 2px',
    cursor: 'pointer',
    fontSize: '14px',
    // Broken: counts at #b8c0cc ~2.3:1. Accessible: #475569 ~7:1. WCAG 1.4.3
    color: accessible ? '#475569' : '#b8c0cc',
  };

  return (
    <div className="flex items-center gap-4 border-t border-slate-100 px-4 py-2.5">
      <button
        type="button"
        aria-label={accessible ? `${liked ? engagementLabels.likeOn : engagementLabels.likeOff} · ${post.likes} me gusta` : undefined}
        aria-pressed={accessible ? liked : undefined}
        style={btn}
      >
        {/* Broken: like state is ONLY the heart's color. Accessible: also a text label. */}
        <span aria-hidden="true" style={{ filter: liked ? 'none' : 'grayscale(1)', opacity: liked ? 1 : 0.55 }}>❤️</span>
        {accessible ? <span>{liked ? engagementLabels.likeOn : engagementLabels.likeOff}</span> : null}
        <span>{post.likes.toLocaleString('es-ES')}</span>
      </button>

      <button type="button" aria-label={accessible ? `${engagementLabels.comment} · ${post.comments} comentarios` : undefined} style={btn}>
        <span aria-hidden="true">💬</span>
        {accessible ? <span>{engagementLabels.comment}</span> : null}
        <span>{post.comments}</span>
      </button>

      <button type="button" aria-label={accessible ? engagementLabels.share : undefined} style={{ ...btn, marginLeft: 'auto' }}>
        <span aria-hidden="true">↗️</span>
        {accessible ? <span>{engagementLabels.share}</span> : null}
      </button>
    </div>
  );
}
