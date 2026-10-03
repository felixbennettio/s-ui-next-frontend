<template>
  <div class="log-lines" dir="ltr" role="log" :aria-label="$t('basic.log.title')">
    <div v-for="(line, index) in parsed" :key="index" class="log-line">
      <span class="log-time text-medium-emphasis">{{ line.time }}</span>
      <v-chip v-if="line.level" size="x-small" variant="tonal" :color="logLevelColor(line.level)">{{ line.level }}</v-chip>
      <span class="log-message">{{ line.message }}</span>
    </div>
    <div v-if="!lines.length" class="pa-4 text-medium-emphasis">{{ $t('logsView.noLogs') }}</div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { parseLogLine, logLevelColor } from '@/plugins/logs'
const props = defineProps<{ lines: string[] }>()
const parsed = computed(() => props.lines.map(parseLogLine))
</script>
<style scoped>
.log-lines { max-width: 100%; max-height: 55vh; overflow: auto; color: rgb(var(--v-theme-on-surface)); background: rgb(var(--v-theme-surface)); }
.log-line { display: flex; align-items: baseline; flex-wrap: wrap; gap: 8px; padding: 10px 12px; border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); font: 12px/1.6 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
.log-time { white-space: nowrap; }
.log-message { flex: 1 1 260px; min-width: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
</style>
