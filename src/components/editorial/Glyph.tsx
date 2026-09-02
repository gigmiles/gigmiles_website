// Inline SVG arrows. Text arrows such as "↗" fall back to Apple Color Emoji on
// iOS when the webfont lacks the glyph, which renders as a blue emoji square.
// Always wrap in an aria-hidden element with the `glyph` class.
export function ArrowUpRight() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17 17 7M9 7h8v8"/></svg>
}
export function ArrowDown() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 5v14M6 13l6 6 6-6"/></svg>
}
