import api from './api'
import { i18n } from '@/locales'
import router from '@/router'
import { push } from 'notivue'
import type { AxiosRequestConfig } from 'axios'

import { normalizeResponse, type Msg } from './response'
export type { Msg } from './response'

function _handleMsg(msg: Msg): void {
  if (msg.warning) push.warning({ message: i18n.global.t('feedback.' + msg.warning) })
  if(msg.msg){
    if (!msg.success && msg.msg == "Invalid login") {
      push.error({
        title: i18n.global.t('invalidLogin'),
      })
      logout()
      return
    }
    if (msg.success) {
      push.success({
        message: i18n.global.t('success') + ": " + i18n.global.t('actions.' + msg.msg),
      })
    } else {
      push.error({
        title: i18n.global.t('failed'),
        message: msg.msg
      })
    }
  }
}

export const logout = async () => {
  const response = await HttpUtils.get('api/logout')
  if(response.success){
    router.push('/login')
  }
}

const HttpUtils = {
  async get(url: string, data: object = {}, options: AxiosRequestConfig = {}): Promise<Msg> {
    let msg: Msg
    try {
        const resp = await api.get(url, { params: data, ...options })
        msg = normalizeResponse(resp.data)
    } catch (e: any) {
        msg = { success: false, msg: e.toString(), obj: null }
    }
    _handleMsg(msg)
    return msg
  },
  async post(url: string, data: object | null, options: any = undefined): Promise<Msg> {
    let msg: Msg
    try {
        const resp = await api.post(url, data, options)
        msg = normalizeResponse(resp.data)
    } catch (e: any) {
        msg = { success: false, msg: e.toString(), obj: null }
    }
    _handleMsg(msg)
    return msg
  },
}

export default HttpUtils
