<template>
  <v-alert type="info" variant="tonal" class="my-3" :text="$t('types.wg.endpointHelp')" />

  <v-card variant="outlined" class="mb-3">
    <v-card-title>{{ $t('types.wg.serverSection') }}</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="8">
          <v-text-field v-model="data.private_key" type="password" :label="$t('types.wg.serverPrivateKey')" :hint="$t('types.wg.privateKeyExportHint')" persistent-hint>
            <template #append-inner>
              <v-btn icon="mdi-content-copy" size="small" variant="text" :disabled="!canCopy(data.private_key) && !(data.id && data.private_key_set)" :title="$t('types.wg.copySecret')" @click.stop="copyPrivateKey" />
              <v-btn icon="mdi-key-star" size="small" variant="text" :title="$t(data.private_key || data.private_key_set ? 'types.wg.regenerateKeyPair' : 'types.wg.generateKeyPair')" @click.stop="newKey" />
            </template>
          </v-text-field>
        </v-col>
        <v-col cols="12" md="8">
          <v-text-field v-model="publicKey" readonly :label="$t('types.wg.serverPublicKey')">
            <template #append-inner>
              <v-btn icon="mdi-content-copy" size="small" variant="text" :disabled="!publicKey" :title="$t('types.wg.copySecret')" @click.stop="copySecret(publicKey)" />
              <v-btn icon="mdi-refresh" size="small" variant="text" :title="$t('types.wg.regenerateKeyPair')" @click.stop="getWgPubKey" />
            </template>
          </v-text-field>
        </v-col>
        <v-col cols="12" md="6"><v-text-field v-model="serverIPv4" :label="$t('types.wg.serverIpv4')" hint="/32" persistent-hint /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="serverIPv6" :label="$t('types.wg.serverIpv6')" hint="/128" persistent-hint /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="data.tunnel_ipv4_cidr" :label="$t('types.wg.tunnelIpv4')" :hint="$t('types.wg.tunnelOptional')" persistent-hint /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="data.tunnel_ipv6_cidr" :label="$t('types.wg.tunnelIpv6')" :hint="$t('types.wg.tunnelOptional')" persistent-hint /></v-col>
        <v-col cols="12" sm="6" md="4"><v-switch v-model="listenEnabled" color="primary" :label="$t('types.wg.listenEnabled')" /></v-col>
        <v-col v-if="listenEnabled" cols="12" sm="6" md="4"><v-text-field v-model.number="data.listen_port" :label="$t('types.wg.listenPort')" type="number" min="1" max="65535" /></v-col>
        <v-col cols="12" sm="6" md="4"><v-text-field v-model.number="data.mtu" label="MTU" type="number" min="576" /></v-col>
        <v-col cols="12" sm="6" md="4"><v-text-field v-model.number="udpTimeout" :label="$t('types.wg.udpTimeout')" type="number" min="0" :suffix="$t('date.m')" /></v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <v-card variant="outlined" class="mb-3">
    <v-card-title class="d-flex align-center flex-wrap ga-2">
      <span>{{ $t('types.wg.clientExportSection') }}</span>
      <v-spacer />
      <v-switch v-model="data.client_export_enabled" color="primary" hide-details class="flex-shrink-0" :label="$t('types.wg.clientExportEnabled')" />
    </v-card-title>
    <v-card-text v-if="data.client_export_enabled">
      <v-alert type="warning" variant="tonal" class="mb-3" :text="$t('types.wg.advertisedEndpointHelp')" />
      <v-row>
        <v-col cols="12" md="8"><v-text-field v-model="data.advertised_endpoint_host" :label="$t('types.wg.advertisedHost')" /></v-col>
        <v-col cols="12" md="4"><v-text-field v-model.number="data.advertised_endpoint_port" :label="$t('types.wg.advertisedPort')" type="number" min="1" max="65535" /></v-col>
        <v-col cols="12"><v-text-field v-model="defaultClientAllowed" :label="$t('types.wg.defaultClientAllowed')" :hint="$t('commaSeparated')" persistent-hint /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="defaultClientDns" :label="$t('types.wg.defaultClientDns')" :hint="$t('commaSeparated')" persistent-hint /></v-col>
        <v-col cols="12" sm="6" md="3"><v-text-field v-model.number="data.default_client_mtu" :label="$t('types.wg.clientMtu')" type="number" min="576" /></v-col>
        <v-col cols="12" sm="6" md="3"><v-text-field v-model.number="data.default_client_keepalive" :label="$t('types.wg.clientKeepalive')" type="number" min="0" :suffix="$t('date.s')" /></v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <v-card variant="outlined" class="mb-3">
    <v-card-title>{{ $t('types.wg.runtimeSection') }}</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="6"><v-switch v-model="hubPeerForwarding" color="primary" :label="$t('types.wg.peerToPeer')" :hint="$t('types.wg.peerToPeerHelp')" persistent-hint /></v-col>
        <v-col cols="12" md="6"><v-switch v-model="data.system" color="primary" :label="$t('types.wg.sysIf')" /></v-col>
        <v-col cols="12" md="6" v-if="data.system"><v-text-field v-model="interfaceName" :label="$t('types.wg.ifName')" /></v-col>
        <v-col cols="12" v-if="data.system"><v-alert type="warning" variant="tonal" :text="$t('types.wg.systemHelp')" /></v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <v-card variant="outlined" v-if="data.peers">
    <v-card-title class="d-flex align-center flex-wrap ga-2">
      {{ $t('types.wg.peers') }}
      <v-spacer />
      <v-menu>
        <template #activator="{ props }">
          <v-btn v-bind="props" color="primary" variant="tonal" prepend-icon="mdi-plus">{{ $t('actions.add') }}</v-btn>
        </template>
        <v-list>
          <v-list-item prepend-icon="mdi-laptop" :title="$t('types.wg.addGeneratedClient')" :subtitle="$t('types.wg.addGeneratedClientHelp')" @click="addPeer('generated_client')" />
          <v-list-item prepend-icon="mdi-server-network" :title="$t('types.wg.addExistingPeer')" :subtitle="$t('types.wg.addExistingPeerHelp')" @click="addPeer('existing_peer')" />
        </v-list>
      </v-menu>
    </v-card-title>
    <v-card-text>
      <v-alert v-if="data.peers.length === 0" type="info" variant="tonal" :text="$t('types.wg.noPeers')" />
      <v-card v-for="(peer, index) in data.peers" :key="peer.public_key || index" variant="tonal" class="mb-3">
        <v-card-title class="d-flex align-center">
          <span class="text-truncate">{{ peer.name || ($t('types.wg.peer') + ' ' + (Number(index) + 1)) }}</span>
          <v-spacer />
          <v-btn icon="mdi-delete-outline" color="error" variant="text" @click="delPeer(Number(index))" />
        </v-card-title>
        <v-card-text><Peer :data="peer" :endpoint="data" :ext="data.ext" :index="Number(index)" @refreshPeerKey="refreshPeerKey(Number(index))" /></v-card-text>
      </v-card>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { copyToClipboard } from '@/plugins/copy'
import Peer from '@/components/WgPeer.vue'
import HttpUtils from '@/plugins/httputil'

export default {
  props: ['data'],
  emits: ['newWgKey', 'getWgPubKey', 'addPeer', 'delPeer', 'refreshPeerKey'],
  created() { this.ensureDefaults() },
  methods: {
    ensureDefaults() {
      this.data.wireguard_schema = 4
      this.data.system ??= false
      this.data.peer_to_peer_enabled ??= false
      this.data.hub_peer_forwarding_enabled ??= this.data.peer_to_peer_enabled
      this.data.peer_to_peer_enabled = this.data.hub_peer_forwarding_enabled
      this.data.peers ??= []
      this.data.ext ??= { keys: [] }
      this.data.ext.keys ??= []
      this.data.default_client_allowed_ips ??= [this.data.tunnel_ipv4_cidr, this.data.tunnel_ipv6_cidr].filter(Boolean)
      this.data.default_client_dns ??= []
      this.data.default_client_mtu ??= this.data.mtu || 1420
      this.data.default_client_keepalive ??= 25
      this.data.client_export_enabled ??= Boolean(this.data.advertised_endpoint_host || this.data.advertised_endpoint_port)
      this.data.advertised_endpoint_port ||= this.data.listen_port
    },
    addPeer(kind: string) { this.$emit('addPeer', kind) },
    delPeer(index: number) { this.$emit('delPeer', index) },
    refreshPeerKey(index: number) { this.$emit('refreshPeerKey', index) },
    newKey() { this.$emit('newWgKey') },
    canCopy(value: string) { return Boolean(value) && value !== '[redacted]' && !String(value).includes('•') },
    async copySecret(value: string) {
      if (this.canCopy(value)) await copyToClipboard(value)
    },
    async copyPrivateKey() {
      if (this.canCopy(this.data.private_key)) return copyToClipboard(this.data.private_key)
      const response = await HttpUtils.post('api/wireguardSecret', { id: this.data.id, field: 'private_key' })
      if (response.success) await copyToClipboard(response.obj)
    },
    getWgPubKey() {
      if (this.canCopy(this.data.private_key)) this.$emit('getWgPubKey', this.data.private_key)
    },
    addressFor(ipv6: boolean) {
      return (this.data.address || []).find((value: string) => ipv6 ? value.includes(':') : !value.includes(':')) || ''
    },
    setAddress(ipv6: boolean, value: string) {
      const other = (this.data.address || []).filter((item: string) => ipv6 ? !item.includes(':') : item.includes(':'))
      this.data.address = value.trim() ? [...other, value.trim()] : other
    },
  },
  computed: {
    serverIPv4: { get() { return this.addressFor(false) }, set(value: string) { this.setAddress(false, value) } },
    serverIPv6: { get() { return this.addressFor(true) }, set(value: string) { this.setAddress(true, value) } },
    publicKey: {
      get() { return this.data.ext?.public_key || '' },
      set(value: string) { this.data.ext.public_key = value },
    },
    hubPeerForwarding: {
      get() { return this.data.hub_peer_forwarding_enabled ?? this.data.peer_to_peer_enabled ?? false },
      set(value: boolean) {
        this.data.hub_peer_forwarding_enabled = value
        this.data.peer_to_peer_enabled = value
      },
    },
    interfaceName: {
      get() { return this.data.name || '' },
      set(value: string) { this.data.name = value.trim() || undefined },
    },
    listenEnabled: {
      get() { return Number(this.data.listen_port || 0) > 0 },
      set(value: boolean) {
        this.data.listen_port = value ? Number(this.data.advertised_endpoint_port || 51820) : 0
      },
    },
    udpTimeout: {
      get() { return this.data.udp_timeout ? parseInt(String(this.data.udp_timeout).replace('m', '')) : 5 },
      set(value: number) { this.data.udp_timeout = value > 0 ? `${value}m` : undefined },
    },
    defaultClientAllowed: {
      get() { return (this.data.default_client_allowed_ips || []).join(', ') },
      set(value: string) { this.data.default_client_allowed_ips = value.split(',').map(item => item.trim()).filter(Boolean) },
    },
    defaultClientDns: {
      get() { return (this.data.default_client_dns || []).join(', ') },
      set(value: string) { this.data.default_client_dns = value.split(',').map(item => item.trim()).filter(Boolean) },
    },
  },
  components: { Peer },
}
</script>
