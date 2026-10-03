import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeResponse } from '../src/plugins/response.ts'
import { parseLogLine, logLevelColor } from '../src/plugins/logs.ts'
import { writeClipboard } from '../src/plugins/clipboard.ts'

test('success without optional fields is accepted; malformed responses are not successes', () => {
  assert.equal(normalizeResponse({ success: true, msg: 'restartSb' }).success, true)
  assert.equal(normalizeResponse({ success: true }).obj, null)
  assert.equal(normalizeResponse({ success: true, warning: 'savedButRefreshFailed' }).warning, 'savedButRefreshFailed')
  for (const value of [null, '', '<html>secret</html>', { success: 'false' }, []]) {
    assert.equal(normalizeResponse(value).success, false)
    assert.ok(!normalizeResponse(value).msg.includes('secret'))
  }
  assert.equal(normalizeResponse({ success: false, msg: 'apply failed' }).msg, 'apply failed')
})

test('log levels and ANSI colors never turn INFO into an error', () => {
  assert.equal(logLevelColor('warn'), 'warning')
  assert.equal(logLevelColor('ERROR'), 'error')
  const line = parseLogLine('\x1b[32m2026/10/02 15:30:00 INFO - closing sing-box\x1b[0m')
  assert.equal(line.level, 'INFO')
  assert.equal(logLevelColor(line.level), 'info')
  assert.equal(line.message, 'closing sing-box')
  assert.equal(parseLogLine('plain text with no level').level, '')
  const multiline = parseLogLine('2026/10/03 08:30:00 WARNING - first line\nsecond line')
  assert.equal(multiline.level, 'WARNING')
  assert.equal(multiline.message, 'first line\nsecond line')
})

test('copy handles HTTPS, denied permission and plain HTTP inside a dialog', async () => {
  let copied = '', restored = false, removed = false
  const container = { appendChild: field => { assert.equal(field.value, 'test-key'); } }
  const active = { closest: () => container, focus: () => { restored = true } }
  const field = { value: '', style: {}, focus() {}, select() {}, setSelectionRange() {}, remove() { removed = true } }
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { isSecureContext: true, getSelection: () => null } })
  Object.defineProperty(globalThis, 'document', { configurable: true, value: { activeElement: active, body: {}, createElement: () => field, execCommand: () => { copied = field.value; return true } } })
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { clipboard: { writeText: async text => { copied = text } } } })
  assert.equal(await writeClipboard('test-key'), true)
  assert.equal(copied, 'test-key')
  navigator.clipboard.writeText = async () => { throw new Error('NotAllowedError') }
  assert.equal(await writeClipboard('test-key'), true)
  assert.equal(restored && removed, true)
  window.isSecureContext = false
  navigator.clipboard = undefined
  assert.equal(await writeClipboard('test-key'), true)
  document.execCommand = () => false
  assert.equal(await writeClipboard('test-key'), false)
  assert.equal(await writeClipboard(''), false)
})
