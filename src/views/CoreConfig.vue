<template>
  <v-card>
    <v-tabs v-model="tab" align-tabs="center" show-arrows>
      <v-tab value="route">{{ $t('core.routing') }}</v-tab><v-tab value="dns">{{ $t('core.dns') }}</v-tab><v-tab value="basics">{{ $t('core.basics') }}</v-tab><v-tab value="json">{{ $t('core.rawJson') }}</v-tab>
    </v-tabs>
    <v-window v-model="tab">
      <v-window-item value="basics"><Basics /></v-window-item>
      <v-window-item value="dns"><Dns /></v-window-item>
      <v-window-item value="route"><Rules /></v-window-item>
      <v-window-item value="json">
        <v-card-text>
          <v-alert v-if="error" type="error" variant="tonal" class="mb-3">{{ error }}</v-alert>
          <v-textarea v-model="raw" rows="24" auto-grow max-rows="36" class="raw-json" spellcheck="false" />
          <div class="d-flex justify-end ga-2"><v-btn variant="tonal" @click="format">{{ $t('core.format') }}</v-btn><v-btn color="primary" :loading="loading" @click="save">{{ $t('core.saveJson') }}</v-btn></div>
        </v-card-text>
      </v-window-item>
    </v-window>
  </v-card>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Data from '@/store/modules/data'
import HttpUtils from '@/plugins/httputil'
import Basics from './Basics.vue'
import Dns from './Dns.vue'
import Rules from './Rules.vue'
import { i18n } from '@/locales'
const route = useRoute(), router = useRouter()
const tab = computed({ get: () => ['route', 'dns', 'basics', 'json'].includes(String(route.query.tab)) ? String(route.query.tab) : 'route', set: value => { router.replace({ query: { ...route.query, tab: value } }) } })
const raw = ref('{}'), error = ref(''), loading = ref(false)
const load = async () => { const response = await HttpUtils.get('api/config'); if (response.success) raw.value = JSON.stringify(response.obj?.config ?? response.obj ?? {}, null, 2) }
const parse = () => { const value = JSON.parse(raw.value); if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error(i18n.global.t('core.rootObjectRequired')); return value }
const format = () => { try { raw.value = JSON.stringify(parse(), null, 2); error.value = '' } catch (exception: any) { error.value = exception.message } }
const save = async () => { try { loading.value = true; const value = parse(); const success = await Data().save('config', 'set', value); if (success) { raw.value = JSON.stringify(value, null, 2); error.value = '' } } catch (exception: any) { error.value = exception.message } finally { loading.value = false } }
watch(tab, value => { if (value === 'json') load() }, { immediate: true })
</script>
<style scoped>:deep(.raw-json textarea) { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px; line-height: 1.5; }</style>
