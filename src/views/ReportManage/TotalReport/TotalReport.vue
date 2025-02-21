<template>
  <div class="mail-container">
    <!-- 筛选条件 -->
    <div style="display: flex;flex-flow: row wrap;gap: 10px;">
      <el-form style="display: flex;flex-flow: column wrap;gap: 10px;">
        <el-form-item label="选择开始时间" label-width="100px">
          <el-date-picker
            v-model="searchReportForm.startDate"
            type="date"
            placeholder="开始时间"
            clearable
          />
        </el-form-item>

        <el-form-item label="选择结束时间" label-width="100px">
          <el-date-picker
            v-model="searchReportForm.endDate"
            type="date"
            placeholder="结束时间"
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="searchReport">查看</el-button>
          <el-button type="primary" @click="resetReport">
            <el-icon>
              <Refresh/>
            </el-icon>
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 总报表图表 -->
    <div ref="allChartRef" style="width: 1000px; height: 400px;"></div>

    <!-- 单独图表 -->
    <div class="charts-grid">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="送达率" name="first">
          <div ref="deliveryChartRef" style="width: 800px; height: 400px;"></div>
        </el-tab-pane>
        <el-tab-pane label="打开率" name="second">
          <div ref="openChartRef" style="width: 800px; height: 400px;"></div>
        </el-tab-pane>
        <el-tab-pane label="退订率" name="third">
          <div ref="unsubscribeChartRef" style="width: 800px; height: 400px;"></div>
        </el-tab-pane>
        <el-tab-pane label="退信率" name="fourth">
          <div ref="bounceChartRef" style="width: 800px; height: 400px;"></div>
        </el-tab-pane>
      </el-tabs>
    </div>

  </div>
</template>

<script setup>
import {onBeforeUnmount, onMounted, ref} from "vue";
import * as echarts from "echarts";
import {errorHandler} from "@/utils/errorHandler.js";
import {reportApi} from "@/api/report/report.js";
import { ElMessage } from 'element-plus'
// 数据
const searchReportForm = ref({
  startDate: null,
  endDate: null
})
const totalReportData = ref({})

// 单独定义每个图表的 ref
const allChartRef = ref(null)
const deliveryChartRef = ref(null)
const openChartRef = ref(null)
const unsubscribeChartRef = ref(null)
const bounceChartRef = ref(null)

// 图表实例
const chartInstances = {}

// 初始化函数
const initCharts = () => {
  // 使用一个映射对象来关联 ref 和实例名称
  const chartMapping = {
    allChart: allChartRef,
    deliveryChart: deliveryChartRef,
    // openChart: openChartRef,
    unsubscribeChart: unsubscribeChartRef,
    bounceChart: bounceChartRef
  }

  Object.entries(chartMapping).forEach(([key, ref]) => {
    const dom = ref.value
    if (!dom) {
      console.log(`${key} DOM 元素未找到`)
      return
    }

    if (chartInstances[key]) {
      chartInstances[key].dispose()
    }

    chartInstances[key] = echarts.init(dom)
    const options = getChartOptions(key)
    chartInstances[key].setOption(options)
  })
}

// 获取不同图表的配置
const getChartOptions = (chartKey) => {
  const options = {
    allChart: {
      title: {
        text: "开始时间："+getIsoDate(searchReportForm.value.startDate)+"  结束时间："+getIsoDate(searchReportForm.value.endDate),
        },
      tooltip: {},
      xAxis: {
        data: ["送达率", "退订率", "退信率"],
        // 添加轴线样式
        axisLine: {
          lineStyle: {
            color: '#333'
            }
        }
      },
      yAxis: {
        // 添加轴线样式
        axisLine: {
          lineStyle: {
            color: '#333'
          }
        },
      },
      series: [
        {
          type: "line",
          data: [
            totalReportData.value.delivery.rate,
            // totalReportData.value.open.openRate,
            totalReportData.value.unsubscribe.rate,
            totalReportData.value.bounce.rate
          ],

          // 添加折线样式
          lineStyle: {
            width: 2
          },
          // 添加数据点样式
          symbol: 'circle',
          symbolSize: 8,
          // 添加区域填充
          areaStyle: {
            opacity: 0.3
          }
        },
      ],
    },
    deliveryChart: {
      title: { text: "送达率统计" },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: ['发送数量', '成功数量']  // 每个柱子对应的 x 轴标签
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          type: 'bar',
          data: [
            {
              value: totalReportData.value.delivery.total,
              itemStyle: {
                color: '#91cc75'
              }
            },
            {
              value: totalReportData.value.delivery.deliveryAmount,
              itemStyle: {
                color: '#5470c6'
              }
            }
          ]
        }
      ]
    },
    // openChart: {
    //   title: { text: "打开率统计" },
    //   tooltip: {
    //     trigger: 'axis',
    //     axisPointer: {
    //       type: 'shadow'
    //     }
    //   },
    //   xAxis: {
    //     type: 'category',
    //     data: ['发送数量', '打开数量']
    //   },
    //   yAxis: {
    //     type: 'value'
    //   },
    //   series: [
    //     {
    //       type: 'bar',
    //       data: [
    //         {
    //           value: totalReportData.value.open.total,
    //           itemStyle: {
    //             color: '#91cc75'
    //           }
    //         },
    //         {
    //           value: totalReportData.value.open.openAmount,
    //           itemStyle: {
    //             color: '#5470c6'
    //           }
    //         }
    //       ]
    //     }
    //   ]
    // },
    unsubscribeChart: {
      title: { text: "退订率统计" },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: ['总数量', '退订数量']
      },
      yAxis: {
        type: 'value'
      },
      series: [
      {
          type: 'bar',
          data: [
            {
              value: totalReportData.value.unsubscribe.total,
              itemStyle: {
                color: '#91cc75'
              }
            },
            {
              value: totalReportData.value.unsubscribe.unsubscribeAmount,
              itemStyle: {
                color: '#ee6666'
              }
            }
          ]
        }
      ]
    },
    bounceChart: {
      title: { text: "退信率统计" },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: ['总数量', '退信数量']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          type: 'bar',
          data: [
            {
              value: totalReportData.value.bounce.total,
              itemStyle: {
                color: '#91cc75'
              }
            },
            {
              value: totalReportData.value.bounce.bounceAmount,
              itemStyle: {
                color: '#ee6666'
              }
            }
          ]
        }
      ]
    }
  }

  return options[chartKey]
}


// 销毁图表实例
const destroyChart = () => {
  Object.values(chartInstances).forEach(instance => {
    if (instance) {
      instance.dispose();
      instance = null;
    }
  });
};

// 搜索报表
const searchReport = async () => {
  try {
    const requestData = {
      start_date: getStartOfDay(searchReportForm.value.startDate),
      end_date: getEndOfDay(searchReportForm.value.endDate)
    }
    console.log("搜索报表请求数据:", requestData);
    const res = await reportApi.checkManualReport(requestData)
    if (res.code === 200) {
      ElMessage.success("搜索报表成功")
      console.log("搜索报表响应数据:", res);
      totalReportData.value = res.data
      initCharts() ; // 初始化图表
    } else {
      errorHandler.showError("搜索报表失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索报表失败,请重试", error);
  }
}

// 重置报表
const resetReport = () => {
  searchReportForm.value.startDate = null
  searchReportForm.value.endDate = null
  //initCharts() ;
}
// 生命周期钩子
onMounted(async () => {
  try {
    // 获取当前日期作为开始时间
    const now = new Date();
    searchReportForm.value.startDate = now.toISOString().split('T')[0];

    // 获取3个月后的日期作为结束时间
    const threeMonthsLater = new Date(now);
    threeMonthsLater.setMonth(now.getMonth() + 3);
    searchReportForm.value.endDate = threeMonthsLater.toISOString().split('T')[0];
    const requestData = {
      start_date: getStartOfDay(searchReportForm.value.startDate),
      end_date: getEndOfDay(searchReportForm.value.endDate)
    }
    console.log("初始化总报表请求数据:", requestData);
    const res = await reportApi.checkManualReport(requestData)
    if (res.code === 200) {
      console.log("初始化总报表响应数据:", res);
      totalReportData.value = res.data
      initCharts() ;
    } else {
      errorHandler.showError("初始化图表失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("初始化图表失败,请重试", error);
  }
});
// 获取当天开始时间戳（0点）
const getStartOfDay = (date) => {
  if (!date) return null
  return Math.floor(new Date(new Date(date).setHours(0, 0, 0, 0)).getTime() / 1000)
}
// 获取当天结束时间戳（23:59:59）
const getEndOfDay = (date) => {
  if (!date) return null
  return Math.floor(new Date(new Date(date).setHours(23, 59, 59, 999)).getTime() / 1000)
}
// 获取iso格式日期
const getIsoDate = (date) => {
  if (!date) return null

  // 创建一个新的日期对象
  const localDate = new Date(date)

  // 获取年月日
  const year = localDate.getFullYear()
  const month = String(localDate.getMonth() + 1).padStart(2, '0')  // 月份从0开始，需要+1
  const day = String(localDate.getDate()).padStart(2, '0')

  // 返回 YYYY-MM-DD 格式
  return `${year}-${month}-${day}`
}
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
