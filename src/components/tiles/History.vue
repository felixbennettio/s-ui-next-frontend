<template>
  <LineChart v-if="loaded" :data="data" :options="<any>options" />
</template>

<script lang="ts">
import { ref } from 'vue'
import { useTheme } from 'vuetify'
import { Line as LineChart } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler,
} from 'chart.js'
import { HumanReadable } from '@/plugins/utils'
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler
)
ChartJS.defaults.font.family = 'Vazirmatn'
export default {
  components: {
    LineChart
  },
  props: ['tilesData','type'],
  setup() { return { theme: useTheme() } },
  data() {
    return {
      loaded: false,
      labels: new Array(20).fill(''),
      oldValues: <any>{net: {}, dio: {}},
      sampledAt: 0,
      options1: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          tooltip: {
            enabled: false
          },
          legend: {
              display: false,
          }
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            grid: {
              color: '#777777',
            },
            beginAtZero: true,
            ticks: {
                beginAtZero: true,
                steps: 10,
                stepValue: 5,
                max: 100
            }
          }
        }
      },
      optionsNet: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          tooltip: {
            enabled: false
          },
          legend: {
              display: false,
          }
        },
        scales: {
          y: {
            grid: {
              color: '#777777',
            },
            beginAtZero: true,
            ticks: {
              callback: (label:any) => { return parseInt(label).toString() },
              count: 10
            }
          }
        }
      },
      data: ref(<any>{})
    }
  },
  computed: {
    options() {
      const formatter = this.$props.type === 'hp-net'
        ? HumanReadable.packetFormat
        : this.$props.type === 'h-net' || this.$props.type === 'h-dio'
          ? HumanReadable.sizeFormat
          : undefined

      const base = formatter ? this.optionsNet : this.options1
      return {
        ...base,
        scales: {
          x: { display: false },
          y: {
            ...base.scales.y,
            grid: { color: this.theme.current.value.dark ? 'rgba(255,255,255,.15)' : 'rgba(0,0,0,.12)' },
            ticks: {
              ...base.scales.y.ticks,
              color: this.theme.current.value.colors['on-surface'],
              callback: (label:any) => formatter ? label == 0 ? '0' : formatter(label, 0) : label,
            },
          },
        },
      }
    }
  },
  methods: {
    updateData1(value1: number) {
      const newData = <number[]>[]
      if (this.data.datasets) newData.push(...this.data.datasets[0].data)
      newData.push(value1)
      if (newData.length>20) newData.shift()
      this.data = {
        labels: this.labels,
        datasets: [
          {
            label: '',
            backgroundColor: 'rgba(255, 165, 0, 0.2)',
            borderColor: 'rgba(255, 165, 0,0.8)',
            fill: true,
            data: newData
          }
        ],
      }
      this.loaded = true
    },
    updateData2(value1: number, value2:number) {
      const newData1 = <number[]>[]
      const newData2 = <number[]>[]
      if (this.data.datasets) {
        newData1.push(...this.data.datasets[0].data)
        newData2.push(...this.data.datasets[1].data)
      }
      newData1.push(value1)
      newData2.push(value2)
      if (newData1.length>20) newData1.shift()
      if (newData2.length>20) newData2.shift()
      this.data = {
        labels: this.labels,
        datasets: [
          {
            label: '',
            backgroundColor: 'rgba(255, 165, 0, 0.2)',
            borderColor: 'rgba(255, 165, 0,0.8)',
            fill: true,
            data: newData1
          },
          {
            label: '',
            backgroundColor: 'rgba(0, 128, 0, 0.1)',
            borderColor: '#43A047',
            fill: true,
            data: newData2
          }
        ],
      }
      this.loaded = true
    }
  },
  watch: {
    tilesData(v:any) {
      const now = Date.now()
      const elapsed = this.sampledAt ? (now - this.sampledAt) / 1000 : 0
      this.sampledAt = now
      switch (this.$props.type) {
        case 'h-cpu':
          if (Number.isFinite(v.cpu)) this.updateData1(v.cpu)
          break
        case 'h-mem':
          if (v.mem?.total > 0) this.updateData1(v.mem.current*100/v.mem.total)
          break
        case 'h-net':
          if (v.net && this.oldValues.net?.sent != null && elapsed > 0) {
            const downSpeed = Math.max(0, v.net.recv-this.oldValues.net.recv) / elapsed
            const upSpeed = Math.max(0, v.net.sent-this.oldValues.net.sent) / elapsed
            this.updateData2(upSpeed,downSpeed)
          }
          this.oldValues.net = v.net
          break
        case 'hp-net':
          if (v.net && this.oldValues.net?.psent != null && elapsed > 0) {
            const downSpeed = Math.max(0, v.net.precv-this.oldValues.net.precv) / elapsed
            const upSpeed = Math.max(0, v.net.psent-this.oldValues.net.psent) / elapsed
            this.updateData2(upSpeed,downSpeed)
          }
          this.oldValues.net = v.net
          break
        case 'h-dio':
          if (v.dio && this.oldValues.dio?.read != null && elapsed > 0) {
            const downSpeed = Math.max(0, v.dio.read-this.oldValues.dio.read) / elapsed
            const upSpeed = Math.max(0, v.dio.write-this.oldValues.dio.write) / elapsed
            this.updateData2(upSpeed,downSpeed)
          }
          this.oldValues.dio = v.dio
          break
      }
    }
  }
}
</script>
