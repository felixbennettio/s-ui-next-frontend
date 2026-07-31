<template>
  <v-alert type="info" variant="tonal" class="my-3" :text="$t('types.warp.directHelp')" />

  <template v-if="data.id > 0">
    <v-list density="compact" class="mb-3">
      <v-list-item :title="$t('types.warp.deviceId')" :subtitle="data.ext?.device_id || '—'" />
      <v-list-item :title="$t('types.wg.localIp')" :subtitle="addressList || '—'" />
      <v-list-item :title="$t('types.warp.peerEndpoint')" :subtitle="peerEndpoint || '—'" />
    </v-list>
    <v-text-field
      v-model="licenseValue"
      type="password"
      :label="$t('types.warp.licenseKey')"
      :placeholder="data.ext?.license_key_set ? $t('types.warp.savedSecret') : ''"
      :hint="$t('types.warp.licenseHelp')"
      persistent-hint
    />
  </template>

  <template v-else>
    <v-alert type="warning" variant="tonal" class="mb-3">
      {{ $t('types.warp.registrationNotice') }}
      <a href="https://www.cloudflare.com/application/terms/" target="_blank" rel="noopener noreferrer">{{ $t('types.warp.termsLink') }}</a>
    </v-alert>
    <v-checkbox v-model="data.warp_terms_accepted" color="primary" :label="$t('types.warp.acceptTerms')" />
  </template>

  <v-divider class="my-4" />
  <div class="text-subtitle-1 mb-2">{{ $t('types.warp.runtimeOptions') }}</div>
  <v-row>
    <v-col cols="12" sm="6" md="4">
      <v-text-field v-model.number="data.mtu" label="MTU" type="number" min="576" />
    </v-col>
    <v-col cols="12" sm="6" md="4">
      <v-text-field v-model.number="udpTimeout" :label="$t('types.wg.udpTimeout')" type="number" min="0" :suffix="$t('date.m')" />
    </v-col>
    <v-col cols="12" sm="6" md="4">
      <v-text-field v-model.number="data.workers" :label="$t('types.wg.worker')" type="number" min="1" clearable />
    </v-col>
    <v-col cols="12" md="6">
      <v-switch v-model="data.system" color="primary" :label="$t('types.wg.sysIf')" :hint="$t('types.wg.systemHelp')" persistent-hint />
    </v-col>
    <v-col v-if="data.system" cols="12" md="6">
      <v-text-field v-model="interfaceName" :label="$t('types.wg.ifName')" />
    </v-col>
  </v-row>
</template>

<script lang="ts">
const redactedSecret = '[redacted]'

export default {
  props: ['data'],
  created() {
    this.data.ext ??= {}
    this.data.peers ??= []
    this.data.mtu ??= 1280
    this.data.system ??= false
    this.data.warp_terms_accepted ??= this.data.id > 0
  },
  computed: {
    addressList() {
      return (this.data.address || []).join(', ')
    },
    peerEndpoint() {
      const peer = this.data.peers?.[0]
      if (!peer?.address) return ''
      const host = String(peer.address).includes(':') ? `[${peer.address}]` : peer.address
      return peer.port ? `${host}:${peer.port}` : host
    },
    licenseValue: {
      get() {
        const value = this.data.ext?.license_key
        return value === redactedSecret || String(value || '').includes('•') ? '' : value || ''
      },
      set(value: string) {
        this.data.ext ??= {}
        if (value) {
          this.data.ext.license_key = value
          this.data.ext.license_key_set = true
        } else if (this.data.ext.license_key_set) {
          this.data.ext.license_key = redactedSecret
        } else {
          delete this.data.ext.license_key
        }
      },
    },
    interfaceName: {
      get() { return this.data.name || '' },
      set(value: string) { this.data.name = value.trim() || undefined },
    },
    udpTimeout: {
      get() { return this.data.udp_timeout ? parseInt(String(this.data.udp_timeout).replace('m', '')) : 5 },
      set(value: number) { this.data.udp_timeout = value > 0 ? `${value}m` : undefined },
    },
  },
}
</script>
