import { useEffect, useState } from 'react';
import { feedPosts, liveBadgeLabel } from './feed.data';

/**
 * Social feed demo — auto-advancing feed with a rapidly blinking "LIVE" badge, dense text
 * without heading hierarchy, and low-contrast captions over photos. Pure content: no
 * store/core/panel imports. The demo cleans up its own interval on unmount.
 */
export function SocialFeedDemo() {
  const [activeIndex, setActiveIndex] = useState(0);

  // A11Y-DEFECT: content auto-advances with no pause control and ignores reduced-motion
  // (this IS the defect being shown) — revealed by Tremor / vestibular — WCAG 2.2.2 / 2.3.1
  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % feedPosts.length);
    }, 1400);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="mx-auto max-w-md space-y-4" data-demo-goal="read-feed">
      {/* Scoped blink keyframes for the LIVE badge (demo-only defect). */}
      <style>{`@keyframes a11ylens-blink { 0%,49% { opacity:1 } 50%,100% { opacity:0 } }`}</style>

      {feedPosts.map((post, index) => {
        const isActive = index === activeIndex;
        return (
          <article
            key={post.id}
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              overflow: 'hidden',
              transform: isActive ? 'scale(1.01)' : 'scale(1)',
              transition: 'transform 200ms',
            }}
          >
            <div className="flex items-center justify-between px-3 py-2">
              <div>
                <span className="text-sm font-semibold text-slate-900">{post.author}</span>{' '}
                <span className="font-mono text-xs text-slate-500">{post.handle}</span>
              </div>
              {isActive && (
                // A11Y-DEFECT: fast blinking element (>3Hz-ish flashing) — revealed by
                // Tremor / vestibular sensitivity — WCAG 2.3.1
                <span
                  style={{
                    animation: 'a11ylens-blink 400ms steps(1) infinite',
                    background: '#dc2626',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: '3px',
                  }}
                >
                  {liveBadgeLabel}
                </span>
              )}
            </div>

            <div style={{ position: 'relative', height: '120px', background: post.photoColor }}>
              {/*
                A11Y-DEFECT: caption text over photo at low contrast —
                revealed by LowVision / ColorBlindness — WCAG 1.4.3
              */}
              <span
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '10px',
                  color: 'rgba(255,255,255,0.55)',
                  fontSize: '13px',
                }}
              >
                {post.caption}
              </span>
            </div>

            {/*
              A11Y-DEFECT: dense body text, no heading hierarchy, tight line-height —
              revealed by Dyslexia — WCAG 1.3.1 / 1.4.8
            */}
            <p style={{ margin: 0, padding: '10px 12px', fontSize: '13px', lineHeight: 1.2, color: '#334155' }}>
              {post.body}
            </p>
          </article>
        );
      })}
    </div>
  );
}
