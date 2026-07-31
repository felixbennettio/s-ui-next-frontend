<template>
  <v-card :loading="loading">
    <v-card-title class="d-flex align-center ga-2"><v-icon icon="mdi-text-box-search-outline" />{{ $t('logsView.title') }}<v-spacer /><v-btn icon="mdi-refresh" variant="tonal" @click="load" /></v-card-title>
    <v-card-text>
      <v-alert type="info" variant="tonal" class="mb-3">{{ $t('logsView.subtitle') }}</v-alert>
      <v-row density="compact">
        <v-col cols="12" md="3"><v-text-field v-model="search" :label="$t('logsView.search')" prepend-inner-icon="mdi-magnify" clearable @keyup.enter="load" /></v-col>
        <v-col cols="12" md="2"><v-text-field v-model="user" :label="$t('logsView.user')" clearable @keyup.enter="load" /></v-col>
        <v-col cols="12" md="2"><v-select v-model="level" :label="$t('logsView.level')" :items="levels" @update:model-value="load" /></v-col>
        <v-col cols="12" md="2"><v-text-field v-model="start" :label="$t('logsView.from')" type="date" /></v-col>
        <v-col cols="12" md="2"><v-text-field v-model="end" :label="$t('logsView.to')" type="date" /></v-col>
        <v-col cols="12" md="1" class="d-flex align-center"><v-btn block color="primary" @click="load">{{ $t('logsView.apply') }}</v-btn></v-col>
      </v-row>
      <v-alert v-if="!loading && items.length === 0" type="info" variant="tonal">{{ $t('logsView.noLogs') }}</v-alert>
      <div v-else class="logs-table-scroll">
      <v-table density="compact" hover fixed-header height="calc(100vh - 260px)" class="logs-table">
        <colgroup>
          <col class="logs-col-time">
          <col class="logs-col-level">
          <col class="logs-col-user">
          <col class="logs-col-source">
          <col class="logs-col-message">
        </colgroup>
        <thead><tr><th>{{ $t('logsView.time') }}</th><th>{{ $t('logsView.level') }}</th><th>{{ $t('logsView.user') }}</th><th>{{ $t('logsView.source') }}</th><th>{{ $t('logsView.message') }}</th></tr></thead>
        <tbody>
          <tr v-for="(item, index) in items" :key="`${item.timestamp}-${index}`">
            <td class="text-no-wrap">{{ item.time || formatTime(item.timestamp) }}</td>
            <td><v-chip size="small" :color="levelColor(item.level)" variant="tonal">{{ item.level }}</v-chip></td>
            <td class="log-break">{{ item.user || '—' }}</td><td class="log-break">{{ item.source || 'system' }}</td>
            <td class="log-message">{{ item.message }}</td>
          </tr>
        </tbody>
      </v-table>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import HttpUtils from '@/plugins/httputil'

const loading = ref(false)
const items = ref<any[]>([])
const search = ref('')
const user = ref('')
const level = ref('ALL')
const start = ref('')
const end = ref('')
const levels = ['ALL', 'DEBUG', 'INFO', 'WARNING', 'ERROR']
const unix = (value: string, endOfDay = false) => value ? Math.floor(new Date(`${value}T${endOfDay ? '23:59:59' : '00:00:00'}`).getTime() / 1000) : 0
const load = async () => {
  loading.value = true
  const response = await HttpUtils.get('api/structured-logs', { level: level.value, user: user.value, search: search.value, start: unix(start.value), end: unix(end.value, true), limit: 1000 })
  if (response.success) items.value = response.obj?.items ?? []
  loading.value = false
}
const levelColor = (value: string) => ({ DEBUG: 'secondary', INFO: 'info', WARNING: 'warning', ERROR: 'error' } as any)[value] ?? 'default'
const formatTime = (value: number) => value ? new Date(value * 1000).toLocaleString() : '—'
onMounted(load)
</script>

<style scoped>
.logs-table-scroll { width: 100%; max-width: 100%; overflow-x: auto; overscroll-behavior-inline: contain; }
.logs-table-scroll :deep(.v-table__wrapper) { overflow-x: visible; }
.logs-table :deep(table) { min-width: 920px; table-layout: fixed; }
.logs-col-time { width: 170px; }
.logs-col-level { width: 90px; }
.logs-col-user { width: 130px; }
.logs-col-source { width: 170px; }
.logs-col-message { width: 360px; }
.log-break,
.log-message { min-width: 0; overflow-wrap: anywhere; word-break: break-word; }
.log-message { white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
</style>
