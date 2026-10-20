/* eslint-disable no-control-regex -- stripping control characters is the point */
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g
const INLINE_CONTROL = /[\u0000-\u001F\u007F]/g

/** Single-line text: strips all control characters and collapses whitespace. */
export function sanitizeLine(value: string, max = 200) {
  return value.replace(INLINE_CONTROL, ' ').replace(/\s+/g, ' ').trim().slice(0, max)
}

/** Multi-line text: keeps newlines/tabs, strips other control characters. */
export function sanitizeText(value: string, max = 5000) {
  return value.replace(CONTROL_CHARS, '').replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, max)
}

/** Escapes CSV cells and neutralises spreadsheet formula injection. */
export function csvCell(value: unknown) {
  let s = value === null || value === undefined ? '' : String(value)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}
