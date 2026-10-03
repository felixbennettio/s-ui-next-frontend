<template>
  <div class="dashboard">
    <LogVue v-model="logModal.visible" :visible="logModal.visible" :control="logModal" />
    <Backup v-model="backupModal.visible" :visible="backupModal.visible" :control="backupModal" />
    <UsageStats v-model:visible="usageStatsModal.visible" />
    <div class="d-flex align-center flex-wrap ga-3 mb-5">
      <div><h1 class="text-h5 font-weight-bold">{{ $t('dashboard.title') }}</h1><div class="text-body-2 text-medium-emphasis mt-1">{{ $t('dashboard.subtitle') }}</div></div>
      <v-spacer />
      <span class="text-caption text-medium-emphasis">{{ updatedAt ? $t('dashboard.updated', { time: updatedAt }) : $t('loading') }}</span>
      <v-btn icon="mdi-refresh" variant="tonal" :loading="refreshing" :aria-label="$t('actions.update')" @click="refresh" />
    </div>
    <v-alert v-if="loadFailed" type="warning" variant="tonal" class="mb-4">{{ $t('dashboard.stale') }}</v-alert>
    <v-row class="mb-3">
      <v-col cols="12" md="6">
        <v-card variant="flat" class="status-card" height="100%">
          <v-card-text>
            <div class="d-flex align-center ga-3"><v-icon icon="mdi-server" size="32" color="primary" /><div><div class="text-overline">SING-BOX</div><div class="text-h6">{{ $t('main.info.sbd') }}</div></div><v-spacer /><v-chip :color="coreColor" variant="tonal">{{ $t(coreLabel) }}</v-chip></div>
            <div class="d-flex flex-wrap ga-5 my-4">
              <div><div class="text-caption text-medium-emphasis">{{ $t('main.info.uptime') }}</div><div>{{ duration(tilesData.sbd?.stats?.Uptime) }}</div></div>
              <div><div class="text-caption text-medium-emphasis">{{ $t('main.info.memory') }}</div><div>{{ size(tilesData.sbd?.stats?.Alloc) }}</div></div>
              <div><div class="text-caption text-medium-emphasis">{{ $t('main.info.threads') }}</div><div>{{ tilesData.sbd?.stats?.NumGoroutine ?? '—' }}</div></div>
            </div>
            <div class="d-flex flex-wrap ga-2"><v-btn prepend-icon="mdi-restart" variant="tonal" :loading="restarting" :disabled="refreshing || restarting" @click="restartSingbox">{{ $t('actions.restartSb') }}</v-btn><v-btn to="/config" variant="text">{{ $t('pages.config') }}</v-btn></div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6"><v-row>
        <v-col v-for="summary in summaries" :key="summary.title" cols="6">
          <v-card :to="summary.path" variant="flat" class="summary-card"><v-card-text><div class="d-flex align-center ga-2 text-medium-emphasis"><v-icon :icon="summary.icon" size="20" /><span>{{ $t(summary.title) }}</span></div><div class="text-h4 my-2">{{ summary.value }}</div><div class="text-caption text-medium-emphasis">{{ summary.detail }}</div></v-card-text></v-card>
        </v-col>
      </v-row></v-col>
    </v-row>
    <div class="d-flex align-center flex-wrap ga-2 mb-3"><h2 class="text-subtitle-1 font-weight-bold">{{ $t('dashboard.resources') }}</h2><v-spacer /><v-btn variant="text" size="small" prepend-icon="mdi-tune" @click="menu = true">{{ $t('main.tiles') }}</v-btn></div>
    <v-row>
      <v-col v-for="item in selectedTiles" :key="item.value" cols="12" sm="6" :lg="item.value.startsWith('h') ? 6 : 3">
        <v-card variant="flat" height="235"><v-card-title class="text-subtitle-2">{{ $t(item.title) }}</v-card-title><v-card-text class="tile-body"><Gauge v-if="item.value.startsWith('g')" :tiles-data="tilesData" :type="item.value" /><History v-else :tiles-data="tilesData" :type="item.value" /></v-card-text></v-card>
      </v-col>
    </v-row>
    <v-row class="mt-3">
      <v-col cols="12" lg="8"><v-card variant="flat"><v-card-title class="d-flex align-center text-subtitle-1">{{ $t('dashboard.recentLogs') }}<v-spacer /><v-btn variant="text" size="small" @click="logModal.visible = true">{{ $t('dashboard.viewLogs') }}</v-btn></v-card-title><LogLines :lines="logs" /></v-card></v-col>
      <v-col cols="12" lg="4">
        <v-card variant="flat" class="mb-4"><v-card-title class="text-subtitle-1">{{ $t('main.info.sys') }}</v-card-title><v-card-text>
          <dl class="system-info"><dt>{{ $t('main.info.host') }}</dt><dd>{{ tilesData.sys?.hostName || '—' }}</dd><dt>{{ $t('version') }}</dt><dd>S-UI Next {{ tilesData.sys?.appVersion || '—' }}</dd><dt>CPU</dt><dd :title="tilesData.sys?.cpuType">{{ tilesData.sys?.cpuCount ?? '—' }} {{ $t('main.info.core') }}</dd><dt>{{ $t('main.info.uptime') }}</dt><dd>{{ tilesData.sys?.bootTime ? duration(Date.now()/1000 - tilesData.sys.bootTime) : '—' }}</dd></dl>
        </v-card-text></v-card>
        <v-card variant="flat"><v-card-title class="text-subtitle-1">{{ $t('dashboard.quickActions') }}</v-card-title><v-list density="compact"><v-list-item prepend-icon="mdi-backup-restore" :title="$t('main.backup.title')" @click="backupModal.visible = true" /><v-list-item prepend-icon="mdi-chart-box-outline" :title="$t('main.stats.title')" @click="usageStatsModal.visible = true" /><v-list-item prepend-icon="mdi-tools" :title="$t('settingsTools.tools')" :to="{ path: '/settings', query: { tab: 'tools' } }" /></v-list></v-card>
      </v-col>
    </v-row>
    <v-dialog v-model="menu" max-width="520"><v-card :title="$t('main.tiles')"><v-card-text><v-checkbox v-for="item in tileOptions" :key="item.value" v-model="reloadItems" :value="item.value" :label="$t(item.title)" hide-details density="compact" /></v-card-text><v-card-actions><v-spacer /><v-btn @click="menu = false">{{ $t('actions.close') }}</v-btn></v-card-actions></v-card></v-dialog>
  </div>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { i18n } from '@/locales'
import HttpUtils from '@/plugins/httputil'
import { HumanReadable } from '@/plugins/utils'
import Data from '@/store/modules/data'
import Gauge from '@/components/tiles/Gauge.vue'
import History from '@/components/tiles/History.vue'
import LogLines from '@/components/LogLines.vue'
import LogVue from '@/layouts/modals/Logs.vue'
import Backup from '@/layouts/modals/Backup.vue'
import UsageStats from '@/layouts/modals/UsageStats.vue'
const store = Data()
const tilesData = ref<any>({}), logs = ref<string[]>([])
const refreshing = ref(false), restarting = ref(false), loadFailed = ref(false), menu = ref(false), updatedAt = ref('')
const logModal = ref({ visible: false }), backupModal = ref({ visible: false }), usageStatsModal = ref({ visible: false })
const tileOptions = [
  { title: 'main.gauge.cpu', value: 'g-cpu' }, { title: 'main.gauge.mem', value: 'g-mem' },
  { title: 'main.gauge.dsk', value: 'g-dsk' }, { title: 'main.gauge.swp', value: 'g-swp' },
  { title: 'main.chart.net', value: 'h-net' }, { title: 'main.chart.cpu', value: 'h-cpu' },
  { title: 'main.chart.mem', value: 'h-mem' }, { title: 'main.chart.pnet', value: 'hp-net' }, { title: 'main.chart.dio', value: 'h-dio' },
]
if (localStorage.getItem('reloadItems') === null) store.reloadItems = ['g-cpu', 'g-mem', 'g-dsk', 'g-swp', 'h-net', 'h-cpu']
const reloadItems = computed({ get: () => store.reloadItems, set: (value: string[]) => { store.reloadItems = value; localStorage.setItem('reloadItems', value.join(',')) } })
const selectedTiles = computed(() => tileOptions.filter(item => reloadItems.value.includes(item.value)))
const coreLabel = computed(() => restarting.value ? 'dashboard.restarting' : tilesData.value.sbd == null ? 'loading' : tilesData.value.sbd.running ? 'dashboard.running' : 'dashboard.stopped')
const coreColor = computed(() => restarting.value || tilesData.value.sbd == null ? 'secondary' : tilesData.value.sbd.running ? 'success' : 'error')
const summaries = computed(() => [
  { title: 'pages.clients', icon: 'mdi-account-multiple-outline', value: store.clients.length, detail: i18n.global.t('dashboard.onlineUsers', { count: store.onlines.user?.length ?? 0 }), path: '/clients' },
  { title: 'pages.inbounds', icon: 'mdi-login', value: store.inbounds.length, detail: i18n.global.t('navigation.access'), path: '/inbounds' },
  { title: 'pages.outbounds', icon: 'mdi-logout-variant', value: store.outbounds.length, detail: i18n.global.t('navigation.network'), path: '/outbounds' },
  { title: 'pages.endpoints', icon: 'mdi-vpn', value: store.endpoints.length, detail: 'WireGuard · WARP · Tailscale', path: '/endpoints' },
])
const size = (value: number | undefined) => value == null ? '—' : HumanReadable.sizeFormat(value)
const duration = (value: number | undefined) => value == null ? '—' : HumanReadable.formatSecond(Math.max(0, value))
let timer: ReturnType<typeof setTimeout> | undefined, active = true, lastLogs = 0
const refresh = async () => {
  if (refreshing.value || !active) return
  refreshing.value = true
  try {
    const fields = new Set(['sbd', ...selectedTiles.value.map(item => item.value.split('-')[1])])
    if (!tilesData.value.sys) fields.add('sys')
    const response = await HttpUtils.get('api/status', { r: [...fields].join(',') })
    loadFailed.value = !response.success
    if (response.success && active) { tilesData.value = { ...tilesData.value, ...response.obj }; updatedAt.value = new Date().toLocaleTimeString() }
    if (Date.now() - lastLogs > 10000) {
      const response = await HttpUtils.get('api/logs', { c: 8, l: 'info' })
      if (response.success && active) { logs.value = Array.isArray(response.obj) ? response.obj.map(String) : []; lastLogs = Date.now() }
    }
  } finally { refreshing.value = false }
}
const poll = async () => { await refresh(); if (active) timer = setTimeout(poll, 2000) }
const restartSingbox = async () => {
  if (restarting.value) return
  restarting.value = true
  try { await HttpUtils.post('api/restartSb', {}); lastLogs = 0; await refresh() } finally { restarting.value = false }
}
onMounted(poll)
onBeforeUnmount(() => { active = false; clearTimeout(timer) })
</script>
<style scoped>
.dashboard { max-width: 1600px; margin: 0 auto; padding: 12px; }
.status-card { border: 1px solid rgba(var(--v-theme-primary), .25); background: linear-gradient(135deg, rgba(var(--v-theme-primary), .07), rgb(var(--v-theme-surface))); }
.summary-card { height: 100%; }
.tile-body { height: 180px; display: flex; align-items: center; justify-content: center; }
.system-info { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 14px 20px; }
.system-info dt { opacity: .65; }
.system-info dd { margin: 0; text-align: end; overflow-wrap: anywhere; }
@media (max-width: 600px) { .dashboard { padding: 2px; } }
</style>
