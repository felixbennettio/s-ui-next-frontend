<template>
  <v-navigation-drawer :model-value="showDrawer" :temporary="isMobile" :permanent="!isMobile" width="240" @update:model-value="updateDrawer">
    <v-list-item height="64" prepend-avatar="@/assets/logo.svg" title="S-UI Next">
      <template v-if="isMobile" #append><v-btn icon="mdi-close" variant="text" :aria-label="$t('actions.close')" @click="$emit('toggleDrawer')" /></template>
    </v-list-item>
    <v-divider />
    <v-list density="compact" nav>
      <template v-for="group in groups" :key="group.title">
        <v-list-subheader>{{ $t(group.title) }}</v-list-subheader>
        <v-list-item v-for="item in group.items" :key="item.path" :to="item.path" :prepend-icon="item.icon" :title="$t(item.title)" :active="route.path === item.path" color="primary" @click="isMobile && $emit('toggleDrawer')" />
      </template>
    </v-list>
    <template #append><v-list-item prepend-icon="mdi-logout" :title="$t('menu.logout')" @click="logout" /></template>
  </v-navigation-drawer>
</template>
<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { logout } from '@/plugins/httputil'
const props = defineProps(['isMobile', 'displayDrawer'])
const emit = defineEmits(['toggleDrawer'])
const route = useRoute()
const showDrawer = computed(() => props.displayDrawer)
const updateDrawer = (value: boolean) => { if (value !== props.displayDrawer) emit('toggleDrawer') }
const groups = [
  { title: 'navigation.overview', items: [
    { title: 'pages.home', icon: 'mdi-view-dashboard-outline', path: '/' },
    { title: 'pages.analytics', icon: 'mdi-chart-line', path: '/analytics' },
  ]},
  { title: 'navigation.access', items: [
    { title: 'pages.clients', icon: 'mdi-account-multiple-outline', path: '/clients' },
    { title: 'pages.inbounds', icon: 'mdi-login', path: '/inbounds' },
    { title: 'pages.tls', icon: 'mdi-certificate-outline', path: '/tls' },
  ]},
  { title: 'navigation.network', items: [
    { title: 'pages.outbounds', icon: 'mdi-logout-variant', path: '/outbounds' },
    { title: 'pages.endpoints', icon: 'mdi-vpn', path: '/endpoints' },
    { title: 'pages.config', icon: 'mdi-routes', path: '/config' },
  ]},
  { title: 'navigation.operations', items: [
    { title: 'pages.services', icon: 'mdi-server-network-outline', path: '/services' },
    { title: 'pages.settings', icon: 'mdi-cog-outline', path: '/settings' },
    { title: 'pages.admins', icon: 'mdi-account-key-outline', path: '/admins' },
  ]},
]
</script>
