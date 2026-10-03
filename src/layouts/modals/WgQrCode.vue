<template>
  <v-dialog transition="dialog-bottom-transition" width="400">
    <v-card class="rounded-lg" id="qrcode-modal" :loading="loading">
      <v-card-title>
        <v-row>
          <v-col>{{ $t('types.wg.qrTitle') }}</v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto"><v-icon icon="mdi-close-box" @click="$emit('close')" /></v-col>
        </v-row>
      </v-card-title>
      <v-divider></v-divider>
      <v-alert v-if="!loading && wgLinks.length === 0" type="info" variant="tonal" class="ma-3" :text="$t('types.wg.noExportablePeers')" />
      <v-row v-for="item in wgLinks" :key="item.filename">
        <v-col style="text-align: center;" v-if="item.config.length>0">
          <v-chip>{{ item.name }}</v-chip> <v-icon icon="mdi-download" @click="download(item.config, item.filename)" /><br />
          <QrcodeVue :value="item.config" :size="size" @click="copyToClipboard(item.config)" :margin="1" style="border-radius: .5rem; cursor: copy;" />
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import QrcodeVue from 'qrcode.vue'
import { copyToClipboard } from '@/plugins/copy'
import HttpUtils from '@/plugins/httputil'

export default {
  props: ['data', 'visible'],
  data() {
    return {
      wgData: <any>{},
      wgLinks: <Array<{ name: string, filename: string, config: string }>>[],
      loading: false,
    }
  },
  methods: {
    async load() {
      this.wgData = this.$props.data
      this.wgLinks = []
      this.loading = true
      for (let index = 0; index < (this.wgData.peers || []).length; index++) {
        const peer = this.wgData.peers[index]
        const hasLegacyKey = (this.wgData.ext?.keys || []).some((key: any) => key.public_key === peer.public_key)
        if (peer.peer_key_mode === 'existing_peer' || (!peer.client_private_key && !peer.client_private_key_set && !hasLegacyKey)) continue
        const response = await HttpUtils.post('api/wireguardExport', { tag: this.wgData.tag, peerIndex: index })
        if (response.success && response.obj?.config) this.wgLinks.push(response.obj)
      }
      this.loading = false
    },
    copyToClipboard,
    download(text: string, filename: string) {
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();
      document.body.removeChild(element);     
    }
  },
  computed: {
    size() {
      if (window.innerWidth > 380) return 300
      if (window.innerWidth > 330) return 280
      return 250
    }
  },
  watch: {
    visible(v) {
      if (v) {
        this.load()
      }
    },
  },
  components: { QrcodeVue }
}
</script>
