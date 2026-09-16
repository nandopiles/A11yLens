/** Repository: mock content for the social feed demo. */

export interface PollOption {
  id: string;
  label: string;
  /** Vote share as a percentage (only exposed as text in the accessible version). */
  pct: number;
  /** Whether this is the winning option. In the broken version this is shown ONLY by
   * color (green winner / red loser), so it's invisible under color blindness. */
  winner: boolean;
}

export interface FeedPost {
  id: string;
  author: string;
  handle: string;
  /** Emoji avatar stand-in. */
  avatar: string;
  /** Likes/comments counters for the vivid engagement bar. */
  likes: number;
  comments: number;
  /** Deliberately dense body text with no heading structure. */
  body: string;
  /** Background color for the "photo" block behind the caption. */
  photoColor: string;
  /** Second color so the photo reads as a vivid gradient. */
  photoColor2: string;
  /** Emoji shown large over the photo, so cards look like real posts. */
  photoEmoji: string;
  caption: string;
  /** Alt text for the post image (used only in the accessible version). */
  photoAlt: string;
  /**
   * If set, this post is an audio "voice note" whose only content is the sound — there is
   * NO transcript or captions element (intentional defect: audio-only content).
   */
  audioSrc?: string;
  /** Human duration label shown on the player (does not convey the audio's meaning). */
  audioDuration?: string;
  /**
   * If set, this post shows a poll where the result is conveyed ONLY by color
   * (intentional defect) — revealed by Color blindness.
   */
  poll?: { question: string; options: PollOption[] };
}

/**
 * Build a real <img> source (an SVG data URI) from a post's colors + emoji, so the broken
 * feed renders actual images with NO alt text — which the screen reader announces as a
 * defect. Keeps the demo asset-free.
 */
export function photoSrc(post: Pick<FeedPost, 'photoColor' | 'photoColor2' | 'photoEmoji'>): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${post.photoColor}"/>` +
    `<stop offset="1" stop-color="${post.photoColor2}"/>` +
    `</linearGradient></defs>` +
    `<rect width="400" height="260" fill="url(#g)"/>` +
    `<text x="200" y="150" font-size="120" text-anchor="middle">${post.photoEmoji}</text>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * A tiny silent WAV as a data URI: a real, playable <audio> source without shipping a binary
 * asset. The point of the demo is the *missing transcript*, not the audio fidelity.
 */
export const silentClipSrc =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAABErAAABAAgAZGF0YQAAAAA=';

export const feedPosts: FeedPost[] = [
  {
    id: 'p3',
    author: 'City Eats',
    handle: '@cityeats',
    avatar: '🍜',
    likes: 908,
    comments: 133,
    body:
      'La mejor comida es la que no planeaste el sitio pequeño sin cartel el dueño que insiste en que pruebes el plato del día la mesa que baila sobre los adoquines el plato que llega antes de que termines de preguntar qué es y entonces ese primer bocado que reorganiza tu tarde entera a su alrededor.',
    photoColor: '#14532d',
    photoColor2: '#22c55e',
    photoEmoji: '🍲',
    caption: 'El plato del día, emplatado',
    photoAlt: 'Cuenco de ramen humeante con un huevo cortado por la mitad',
    // A11Y-DEFECT: the poll result is shown ONLY by color (green winner / red loser) with
    // no text or icon — revealed by Color blindness — WCAG 1.4.1
    poll: {
      question: '¿Qué añadimos a la carta la semana que viene?',
      options: [
        { id: 'a', label: 'Ramen picante', pct: 63, winner: true },
        { id: 'b', label: 'Curry verde', pct: 37, winner: false },
      ],
    },
  },
  {
    id: 'p4',
    author: 'Studio Kai',
    handle: '@studiokai',
    avatar: '🎨',
    likes: 57,
    comments: 4,
    // A11Y-DEFECT: the whole message lives in the audio. No transcript, no captions —
    // audio-only content — WCAG 1.2.1
    body:
      'Nota de voz — toca para escuchar los detalles del lanzamiento (hora, dirección y el código de acceso).',
    photoColor: '#4c1d95',
    photoColor2: '#a855f7',
    photoEmoji: '🎙️',
    caption: 'Nota de voz de 0:12',
    photoAlt: 'Micrófono de estudio sobre fondo violeta',
    audioDuration: '0:12',
  },
  {
    id: 'p2',
    author: 'Studio Kai',
    handle: '@studiokai',
    avatar: '🎨',
    likes: 342,
    comments: 21,
    body:
      'Nuevo lanzamiento este viernes pasamos meses en los detalles las costuras el gramaje del papel la forma en que se asienta la tinta y no podemos esperar a que lo tengas en las manos no hay nada como un objeto físico en un mundo de pantallas y lo decimos con toda el alma así que apunta la fecha y avisa a un amigo.',
    photoColor: '#9a3412',
    photoColor2: '#f59e0b',
    photoEmoji: '📓',
    caption: 'Entre bastidores en el estudio',
    photoAlt: 'Cuaderno artesanal abierto sobre una mesa del estudio',
  },
];

export const liveBadgeLabel = 'EN VIVO';

/** Text alternative for the voice-note audio (used by the accessible version). */
export const voiceNoteTranscript =
  'El lanzamiento es el viernes a las 18:00 en el estudio de la calle Mayor 14. ' +
  'El código de acceso del portal es 4-7-2-1. Trae un amigo y avisa si llegas tarde.';

/** Which posts already have a "like" from the user (state shown ONLY by heart color in
 * the broken version — revealed by Color blindness). */
export const likedPostIds = new Set(['p3']);

/** Accessible-mode labels for the engagement buttons (icon-only in the broken version). */
export const engagementLabels = {
  likeOn: 'Te gusta',
  likeOff: 'Me gusta',
  comment: 'Comentar',
  share: 'Compartir',
};
