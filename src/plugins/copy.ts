import { i18n } from '@/locales'
import { push } from 'notivue'
import { writeClipboard } from './clipboard'

export async function copyToClipboard(text: string): Promise<boolean> {
  const success = await writeClipboard(text)
  push[success ? 'success' : 'error']({
    message: i18n.global.t(success ? 'success' : 'failed') + ': ' + i18n.global.t('copyToClipboard'),
  })
  return success
}
