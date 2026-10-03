// The textarea stays inside the active dialog so its focus trap cannot steal
// the selection. This also supports panels opened over plain HTTP on a LAN.
function legacyCopy(text: string): boolean {
  const active = document.activeElement as HTMLElement | null
  const selection = window.getSelection()
  const ranges = selection ? Array.from({ length: selection.rangeCount }, (_, i) => selection.getRangeAt(i).cloneRange()) : []
  const container = active?.closest('[role="dialog"], dialog, .v-overlay__content') ?? document.body
  const field = document.createElement('textarea')
  field.value = text
  field.readOnly = true
  field.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px;'
  container.appendChild(field)
  try {
    field.focus({ preventScroll: true })
    field.select()
    field.setSelectionRange(0, text.length)
    return document.execCommand('copy')
  } finally {
    field.remove()
    active?.focus({ preventScroll: true })
    if (selection) {
      selection.removeAllRanges()
      ranges.forEach(range => selection.addRange(range))
    }
  }
}

export async function writeClipboard(text: string): Promise<boolean> {
  if (!text) return false
  try {
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text)
        return true
      } catch { /* Fall back when browser permissions deny the modern API. */ }
    }
    return legacyCopy(text)
  } catch {
    return false
  }
}
