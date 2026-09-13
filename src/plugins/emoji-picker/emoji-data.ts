/**
 * Curated emoji list grouped by category, with simple keyword tags for search.
 * Not an exhaustive Unicode database — kept small to avoid bloating bundle size.
 */
export interface EmojiEntry {
  char: string;
  keywords: string;
}

export const EMOJI_LIST: EmojiEntry[] = [
  // Smileys
  { char: '😀', keywords: 'grin smile happy' },
  { char: '😂', keywords: 'laugh joy tears funny' },
  { char: '🙂', keywords: 'smile slight' },
  { char: '😉', keywords: 'wink' },
  { char: '😍', keywords: 'love heart eyes' },
  { char: '🥰', keywords: 'love hearts' },
  { char: '😘', keywords: 'kiss' },
  { char: '😎', keywords: 'cool sunglasses' },
  { char: '🤔', keywords: 'thinking' },
  { char: '🤗', keywords: 'hug' },
  { char: '😅', keywords: 'sweat relief' },
  { char: '😭', keywords: 'cry sad' },
  { char: '😢', keywords: 'sad cry' },
  { char: '😡', keywords: 'angry mad' },
  { char: '😱', keywords: 'scream shock' },
  { char: '😴', keywords: 'sleep tired' },
  { char: '🤯', keywords: 'mind blown shock' },
  { char: '🥳', keywords: 'party celebrate' },
  { char: '😇', keywords: 'angel innocent' },
  { char: '🙃', keywords: 'upside down' },
  // Gestures
  { char: '👍', keywords: 'thumbs up like good' },
  { char: '👎', keywords: 'thumbs down dislike' },
  { char: '👏', keywords: 'clap applause' },
  { char: '🙏', keywords: 'pray thanks please' },
  { char: '👌', keywords: 'ok perfect' },
  { char: '✌️', keywords: 'peace victory' },
  { char: '🤝', keywords: 'handshake deal' },
  { char: '💪', keywords: 'strong muscle' },
  { char: '👋', keywords: 'wave hello bye' },
  { char: '🤞', keywords: 'fingers crossed luck' },
  // Objects & symbols
  { char: '🔥', keywords: 'fire hot lit' },
  { char: '✨', keywords: 'sparkles shiny' },
  { char: '⭐', keywords: 'star' },
  { char: '💡', keywords: 'idea light bulb' },
  { char: '✅', keywords: 'check done ok' },
  { char: '❌', keywords: 'cross no wrong' },
  { char: '⚠️', keywords: 'warning alert' },
  { char: '❤️', keywords: 'heart love' },
  { char: '💯', keywords: 'hundred perfect' },
  { char: '🎉', keywords: 'party celebrate confetti' },
  { char: '🚀', keywords: 'rocket launch fast' },
  { char: '📌', keywords: 'pin note' },
  { char: '📎', keywords: 'paperclip attach' },
  { char: '🔗', keywords: 'link chain' },
  { char: '🕐', keywords: 'clock time' },
  { char: '📅', keywords: 'calendar date' },
  { char: '📝', keywords: 'note memo write' },
  { char: '📊', keywords: 'chart graph data' },
  { char: '💰', keywords: 'money cash' },
  { char: '🔒', keywords: 'lock secure' },
  // Nature & food
  { char: '☀️', keywords: 'sun sunny' },
  { char: '🌙', keywords: 'moon night' },
  { char: '☕', keywords: 'coffee drink' },
  { char: '🍕', keywords: 'pizza food' },
  { char: '🎂', keywords: 'cake birthday' },
  { char: '🍎', keywords: 'apple fruit' },
];
