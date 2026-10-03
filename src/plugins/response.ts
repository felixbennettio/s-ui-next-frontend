export interface Msg {
  success: boolean
  msg: string
  obj: any | null
  warning?: string
}

export function normalizeResponse(data: unknown): Msg {
  if (data && typeof data === 'object' && 'success' in data && typeof data.success === 'boolean') {
    const value = data as Record<string, unknown>
    return {
      success: data.success,
      msg: typeof value.msg === 'string' ? value.msg : '',
      obj: value.obj ?? null,
      warning: typeof value.warning === 'string' ? value.warning : undefined,
    }
  }
  // Never echo arbitrary response bodies: they may contain a login page or secrets.
  return { success: false, msg: 'Invalid server response', obj: null }
}
