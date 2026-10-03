export function logLevelColor(level: string): string {
  switch (level.toUpperCase()) {
    case 'TRACE': case 'DEBUG': return 'secondary'
    case 'INFO': case 'NOTICE': return 'info'
    case 'WARN': case 'WARNING': return 'warning'
    case 'ERR': case 'ERROR': case 'FATAL': case 'PANIC': case 'CRITICAL': return 'error'
    default: return 'secondary'
  }
}

export function parseLogLine(value: string) {
  // Strip terminal colors; never interpret log content as HTML.
  // eslint-disable-next-line no-control-regex -- remove ANSI terminal escape sequences
  const text = value.replace(/\x1b\[[0-9;]*m/g, '')
  const match = text.match(/^(.*?)\b(TRACE|DEBUG|INFO|NOTICE|WARN(?:ING)?|ERR(?:OR)?|FATAL|PANIC|CRITICAL)\b\s*-?\s*([\s\S]*)$/i)
  return match ? { time: match[1].trim(), level: match[2].toUpperCase(), message: match[3] } : { time: '', level: '', message: text }
}
