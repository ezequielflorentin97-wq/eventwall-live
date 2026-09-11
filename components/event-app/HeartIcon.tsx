// The 🤍 emoji renders as a filled light-grey heart on Windows (Segoe UI
// Emoji), not the empty/outlined heart it looks like on other platforms —
// an SVG stroke gives a consistent empty-outline vs. filled-red look
// everywhere instead of depending on the OS emoji font.
export function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? '#e0245e' : 'none'}
      stroke={filled ? '#e0245e' : 'currentColor'}
      strokeWidth="2"
      style={{ verticalAlign: 'middle', flexShrink: 0 }}
    >
      <path d="M12 21s-6.7-4.35-9.33-8.2C.86 10.1 1.6 6.5 4.6 5.1c2.1-1 4.4-.2 5.9 1.6L12 8.2l1.5-1.5c1.5-1.8 3.8-2.6 5.9-1.6 3 1.4 3.74 5 1.93 7.7C18.7 16.65 12 21 12 21z" />
    </svg>
  )
}
