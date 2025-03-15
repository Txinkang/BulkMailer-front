<template>
  <el-dialog
    v-model="dialogVisible"
    title="报表详情"
    width="95%"
  >
    <div class="chart-container">
      <div class="charts-grid">
        <div ref="allChartRef" class="chart-item"></div>
        <div ref="deliveryChartRef" class="chart-item"></div>
        <div ref="openChartRef" class="chart-item"></div>
        <div ref="unsubscribeChartRef" class="chart-item"></div>
        <div ref="bounceChartRef" class="chart-item"></div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  reportData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

// 对话框可见性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 图表引用
const allChartRef = ref(null)
const deliveryChartRef = ref(null)
const openChartRef = ref(null)
const unsubscribeChartRef = ref(null)
const bounceChartRef = ref(null)

// 图表实例
const chartInstances = {}

// 获取图表配置
const getChartOptions = (chartKey) => {
  const options = {
    allChart: {
      title: { text: "各项指标统计" },
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '12.5%',
        containLabel: true  // 确保坐标轴标签显示完整
      },
      xAxis: {
        type: 'category',
        data: ["送达率", "打开率", "退订率", "退信率"],
        axisLabel: {
          interval: 0,  // 强制显示所有标签
          rotate: 0     // 如果需要可以旋转标签
        }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#333' } }
      },
      series: [{
        type: "line",
        data: [
          props.reportData.delivery.rate,
          props.reportData.open.rate,
          props.reportData.unsubscribe.rate,
          props.reportData.bounce.rate
        ],
        lineStyle: { width: 2 },
        symbol: 'circle',
        symbolSize: 8,
        areaStyle: { opacity: 0.3 }
      }]
    },
    deliveryChart: {
      title: { text: "送达统计" },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['总数量', '送达数量']
      },
      yAxis: { type: 'value' },
      series: [{
        type: 'bar',
        data: [
          { value: props.reportData.delivery.total, itemStyle: { color: '#91cc75' } },
          { value: props.reportData.delivery.deliveryAmount, itemStyle: { color: '#5470c6' } }
        ]
      }]
    },
    openChart: {
      title: { text: "打开统计" },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['总数量', '打开数量']
      },
      yAxis: { type: 'value' },
      series: [{
        type: 'bar',
        data: [
          { value: props.reportData.open.total, itemStyle: { color: '#91cc75' } },
          { value: props.reportData.open.openAmount, itemStyle: { color: '#5470c6' } }
        ]
      }]
    },
    unsubscribeChart: {
      title: { text: "退订统计" },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['总数量', '退订数量']
      },
      yAxis: { type: 'value' },
      series: [{
        type: 'bar',
        data: [
          { value: props.reportData.unsubscribe.total, itemStyle: { color: '#91cc75' } },
          { value: props.reportData.unsubscribe.unsubscribeAmount, itemStyle: { color: '#ee6666' } }
        ]
      }]
    },
    bounceChart: {
      title: { text: "退信统计" },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['总数量', '退信数量']
      },
      yAxis: { type: 'value' },
      series: [{
        type: 'bar',
        data: [
          { value: props.reportData.bounce.total, itemStyle: { color: '#91cc75' } },
          { value: props.reportData.bounce.bounceAmount, itemStyle: { color: '#ee6666' } }
        ]
      }]
    }
  }

  return options[chartKey]
}

// 初始化图表
const initCharts = () => {
  const chartMapping = {
    allChart: allChartRef,
    deliveryChart: deliveryChartRef,
    openChart: openChartRef,
    unsubscribeChart: unsubscribeChartRef,
    bounceChart: bounceChartRef
  }

  Object.entries(chartMapping).forEach(([key, ref]) => {
    const dom = ref.value
    if (!dom) return

    if (chartInstances[key]) {
      chartInstances[key].dispose()
    }

    chartInstances[key] = echarts.init(dom)
    const options = getChartOptions(key)
    chartInstances[key].setOption(options)
  })
}

// 监听数据变化
watch(() => props.reportData, () => {
  nextTick(() => {
    initCharts()
  })
}, { deep: true })

// 监听对话框显示
watch(() => dialogVisible.value, (newVal) => {
  if (newVal) {
    nextTick(() => {
      initCharts()
    })
  }
})

// 组件挂载
onMounted(() => {
  if (dialogVisible.value) {
    initCharts()
  }
})

// 组件卸载
onUnmounted(() => {
  Object.values(chartInstances).forEach(chart => {
    chart?.dispose()
  })
})
</script>

<style scoped>
.charts-grid {
  display: flex;
  gap: 5px;  /* 减小间距 */
}

.chart-item {
  flex: 1;     /* 让所有图表平均分配空间 */
  height: 400px;
  min-width: 150px;  /* 减小最小宽度 */
}
</style>
