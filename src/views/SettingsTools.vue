<template>
  <v-card>
    <v-tabs v-model="tab" align-tabs="center">
      <v-tab value="settings">{{ $t('settingsTools.settings') }}</v-tab>
      <v-tab value="tools">{{ $t('settingsTools.tools') }}</v-tab>
    </v-tabs>
    <v-window v-model="tab">
      <v-window-item value="settings"><Settings /></v-window-item>
      <v-window-item value="tools"><Tools /></v-window-item>
    </v-window>
  </v-card>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Settings from './Settings.vue'
import Tools from './Tools.vue'

const route = useRoute(), router = useRouter()
const tab = computed({ get: () => route.query.tab === 'tools' ? 'tools' : 'settings', set: value => { router.replace({ query: { ...route.query, tab: value } }) } })
</script>
