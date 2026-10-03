<template>
  <v-alert type="info" variant="tonal" class="mb-4" :text="$t('organization.tunnelHelp')" />
  <v-tabs v-model="category" class="mb-4" show-arrows><v-tab value="all">{{ $t('all') }}</v-tab><v-tab value="wireguard">WireGuard</v-tab><v-tab value="warp">WARP</v-tab><v-tab value="tailscale">Tailscale</v-tab></v-tabs>
  <EndpointVue 
    v-model="modal.visible"
    :visible="modal.visible"
    :id="modal.id"
    :data="modal.data"
    :initial-type="modal.type"
    :tags="endpointTags"
    @close="closeModal"
  />
  <Stats
    v-model="stats.visible"
    :visible="stats.visible"
    :resource="stats.resource"
    :tag="stats.tag"
    @close="closeStats"
  />
  <QrCode
    v-model="qrcode.visible"
    :visible="qrcode.visible"
    :data="qrcode.data"
    @close="closeQrCode"
  />
  <v-row>
    <v-col cols="12" justify="center" align="center">
      <v-menu>
        <template #activator="{ props }">
          <v-btn v-bind="props" color="primary" prepend-icon="mdi-plus">{{ $t('actions.add') }}</v-btn>
        </template>
        <v-list>
          <v-list-item prepend-icon="mdi-vpn" title="WireGuard" @click="showModal(0, 'wireguard')" />
          <v-list-item prepend-icon="mdi-cloud-outline" title="Cloudflare WARP" @click="showModal(0, 'warp')" />
          <v-list-item prepend-icon="mdi-lan-connect" title="Tailscale" @click="showModal(0, 'tailscale')" />
        </v-list>
      </v-menu>
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12" sm="4" md="3" lg="2" v-for="item in <any[]>filteredEndpoints" :key="item.tag">
      <v-card rounded="lg" elevation="5" min-width="200">
        <v-card-title class="text-truncate" :title="item.tag">{{ item.tag }}</v-card-title>
        <v-card-subtitle style="margin-top: -15px;">
          <v-row>
            <v-col class="endpoint-value">{{ item.type }}</v-col>
          </v-row>
        </v-card-subtitle>
        <v-card-text>
          <v-row>
            <v-col>{{ $t('in.addr') }}</v-col>
            <v-col class="endpoint-value">
              {{ item.address?.length>0 ? item.address[0] : '-' }}
            </v-col>
          </v-row>
          <v-row>
            <v-col>{{ $t('in.port') }}</v-col>
            <v-col>
              {{ item.listen_port>0 ? item.listen_port : '-' }}
            </v-col>
          </v-row>
          <v-row>
            <v-col>{{ $t('types.wg.peers') }}</v-col>
            <v-col>
              {{ item.peers?.length?? '-'  }}
            </v-col>
          </v-row>
          <v-row>
            <v-col>{{ $t('online') }}</v-col>
            <v-col>
              <template v-if="onlines.includes(item.tag)">
                <v-chip density="comfortable" size="small" color="success" variant="flat">{{ $t('online') }}</v-chip>
              </template>
              <template v-else>-</template>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions style="padding: 0;">
          <v-btn icon="mdi-file-edit" @click="showModal(item.id)">
            <v-icon />
            <v-tooltip activator="parent" location="top" :text="$t('actions.edit')"></v-tooltip>
          </v-btn>
          <v-btn icon="mdi-file-remove" style="margin-inline-start:0;" color="warning" @click="delOverlay[item.id] = true">
            <v-icon />
            <v-tooltip activator="parent" location="top" :text="$t('actions.del')"></v-tooltip>
          </v-btn>
          <v-overlay
            v-model="delOverlay[item.id]"
            contained
            class="align-center justify-center"
          >
            <v-card :title="$t('actions.del')" rounded="lg">
              <v-divider></v-divider>
              <v-card-text>{{ $t('confirm') }}</v-card-text>
              <v-card-actions>
                <v-btn color="error" variant="outlined" @click="delEndpoint(item.tag)">{{ $t('yes') }}</v-btn>
                <v-btn color="success" variant="outlined" @click="delOverlay[item.id] = false">{{ $t('no') }}</v-btn>
              </v-card-actions>
            </v-card>
          </v-overlay>
          <v-icon
          class="me-2"
          v-if="item.type == 'wireguard' && hasExportablePeer(item)"
          @click="showQrCode(item.id)"
        >
          mdi-qrcode
        </v-icon>
          <v-btn icon="mdi-chart-line" @click="showStats(item.tag)" v-if="Data().enableTraffic">
            <v-icon />
            <v-tooltip activator="parent" location="top" :text="$t('stats.graphTitle')"></v-tooltip>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
import Data from '@/store/modules/data'
import EndpointVue from '@/layouts/modals/Endpoint.vue'
import Stats from '@/layouts/modals/Stats.vue'
import QrCode from '@/layouts/modals/WgQrCode.vue'
import { Endpoint } from '@/types/endpoints'
import { computed, ref } from 'vue'

const category = ref('all')
const filteredEndpoints = computed(() => endpoints.value.filter((item: any) => category.value === 'all' || item.type === category.value))
const endpoints = computed((): Endpoint[] => {
  return <Endpoint[]> Data().endpoints
})

const endpointTags = computed((): any[] => {
  return endpoints.value?.map((o:Endpoint) => o.tag)
})

const onlines = computed(() => {
  return [...Data().onlines.inbound?? [], ...Data().onlines.outbound??[] ]
})

const modal = ref({
  visible: false,
  id: 0,
  data: "",
  type: "wireguard",
})

const delOverlay = ref<Record<number, boolean>>({})

const showModal = (id: number, type = "wireguard") => {
  modal.value.id = id
  modal.value.data = id == 0 ? '' : JSON.stringify(endpoints.value.findLast(o => o.id == id))
  modal.value.type = type
  modal.value.visible = true
}

const closeModal = () => {
  modal.value.visible = false
}

const stats = ref({
  visible: false,
  resource: "endpoint",
  tag: "",
})

const delEndpoint = async (tag: string) => {
  const id = endpoints.value.find(i => i.tag == tag)?.id
  const success = await Data().save("endpoints", "del", tag)
  if (success && id != null) delOverlay.value[id] = false
}

const showStats = (tag: string) => {
  stats.value.tag = tag
  stats.value.visible = true
}
const closeStats = () => {
  stats.value.visible = false
}

const qrcode = ref({
  visible: false,
  data: <any>{},
})

const showQrCode = (id: number) => {
  qrcode.value.data = endpoints.value.findLast(o => o.id == id)
  qrcode.value.visible = true
}
const hasExportablePeer = (item: any) => {
  const exportEnabled = item.client_export_enabled ?? Boolean(item.advertised_endpoint_host)
  if (!exportEnabled) return false
  return (item.peers || []).some((peer: any) => {
    if (peer.peer_key_mode === 'existing_peer') return false
    if (peer.client_private_key || peer.client_private_key_set) return true
    return (item.ext?.keys || []).some((key: any) => key.public_key === peer.public_key)
  })
}
const closeQrCode = () => {
  qrcode.value.visible = false
}
</script>

<style scoped>
.endpoint-value {
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}
</style>
