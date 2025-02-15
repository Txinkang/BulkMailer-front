<template>
  <div class="mail-container">
    <!-- 筛选条件 -->
    <div style="display: flex;flex-flow: row wrap;gap: 10px;">
      <el-form style="display: flex;flex-flow: column wrap;gap: 10px;">
        <el-form-item label="选择开始时间" label-width="100px">
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="开始时间"
          />
        </el-form-item>

        <el-form-item label="选择结束时间" label-width="100px">
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="结束时间"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary">查看</el-button>
          <el-button type="primary">
            <el-icon>
              <Refresh/>
            </el-icon>
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 图表 -->
    <div class="chart-container" ref="chartRef" style="width: 13em; height: 400px;"></div>

  </div>
</template>

<script setup>
import {onBeforeUnmount, onMounted, ref} from "vue";
import * as echarts from "echarts";

// 数据
const chartRef = ref(null); // 绑定的 DOM 容器引用
let chartInstance = null; // 保存 ECharts 实例
const selectedDate = ref(null);
const startDate = ref("2024-12-20")
const endDate = ref("2025-02-20")

// 初始化图表
const initChart = () => {
  // 获取 DOM 容器
  const chartDom = chartRef.value;
  if (!chartDom) return;

  // 创建 ECharts 实例
  chartInstance = echarts.init(chartDom);

  // 配置图表数据
  const options = {
    title: {
      text: "开始时间："+startDate.value+"  结束时间："+endDate.value,
    },
    tooltip: {},
    xAxis: {
      data: ["送达率", "打开率", "退订率", "退信率"],
    },
    yAxis: {},
    series: [
      {
        name: "销量",
        type: "bar",
        data: [5, 20, 36, 10, 10, 20],
      },
    ],
  };

  // 设置图表选项
  chartInstance.setOption(options);
};


// 销毁图表实例
const destroyChart = () => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
};

// 生命周期钩子
onMounted(() => {
  initChart(); // 初始化图表
});

onBeforeUnmount(() => {
  destroyChart(); // 销毁图表实例
});
</script>

<style scoped>
.mail-container {
  padding: 20px;
}

.header .tip {
  font-size: small;
  margin-left: 20px;
  color: #999;
}

</style>
