<!--
  * 统计分析
  *
  * @Author:    1024创新实验室
  * @Date:      2024-01-01
  * @Copyright  1024创新实验室
-->
<template>
  <div class="statistics-container">
    <a-row :gutter="16">
      <a-col :span="4" v-for="item in baseStats" :key="item.key">
        <a-card class="stat-card" :bordered="false">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: item.color }">
              <component :is="item.icon" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ item.value }}</div>
              <div class="stat-label">{{ item.label }}</div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" style="margin-top: 16px">
      <a-col :span="12">
        <a-card title="Top10 库存材料" :bordered="false">
          <div ref="inventoryChartRef" style="height: 350px"></div>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="采购统计" :bordered="false">
          <template #extra>
            <a-radio-group v-model:value="purchaseType" @change="loadPurchaseData">
              <a-radio-button value="week">近一周</a-radio-button>
              <a-radio-button value="month">近一月</a-radio-button>
              <a-radio-button value="year">近一年</a-radio-button>
            </a-radio-group>
          </template>
          <div ref="purchaseChartRef" style="height: 350px"></div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" style="margin-top: 16px">
      <a-col :span="24">
        <a-card title="出库统计" :bordered="false">
          <template #extra>
            <a-radio-group v-model:value="outboundType" @change="loadOutboundData">
              <a-radio-button value="week">近一周</a-radio-button>
              <a-radio-button value="month">近一月</a-radio-button>
              <a-radio-button value="year">近一年</a-radio-button>
            </a-radio-group>
          </template>
          <div ref="outboundChartRef" style="height: 350px"></div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import * as echarts from 'echarts';
  import { statisticsApi } from '/@/api/business/statistics/statistics-api';
  import { smartSentry } from '/@/lib/smart-sentry';
  import { ShopOutlined, ProjectOutlined, TeamOutlined, WarningOutlined, FileTextOutlined, ExportOutlined } from '@ant-design/icons-vue';

  const inventoryChartRef = ref(null);
  const purchaseChartRef = ref(null);
  const outboundChartRef = ref(null);

  let inventoryChart = null;
  let purchaseChart = null;
  let outboundChart = null;

  const purchaseType = ref('week');
  const outboundType = ref('week');

  const baseStats = ref([
    { key: 'materialCount', label: '材料种类', value: 0, color: '#1890ff', icon: ShopOutlined },
    { key: 'projectCount', label: '项目总数', value: 0, color: '#52c41a', icon: ProjectOutlined },
    { key: 'supplierCount', label: '供应商总数', value: 0, color: '#722ed1', icon: TeamOutlined },
    { key: 'inventoryWarningCount', label: '库存预警', value: 0, color: '#fa8c16', icon: WarningOutlined },
    { key: 'pendingPurchaseCount', label: '待审批采购', value: 0, color: '#eb2f96', icon: FileTextOutlined },
    { key: 'pendingOutboundCount', label: '待审批出库', value: 0, color: '#13c2c2', icon: ExportOutlined },
  ]);

  async function loadBaseStatistics() {
    try {
      const resp = await statisticsApi.baseStatistics();
      if (resp.data) {
        baseStats.value[0].value = resp.data.materialCount || 0;
        baseStats.value[1].value = resp.data.projectCount || 0;
        baseStats.value[2].value = resp.data.supplierCount || 0;
        baseStats.value[3].value = resp.data.inventoryWarningCount || 0;
        baseStats.value[4].value = resp.data.pendingPurchaseCount || 0;
        baseStats.value[5].value = resp.data.pendingOutboundCount || 0;
      }
    } catch (e) {
      smartSentry.captureError(e);
    }
  }

  async function loadInventoryData() {
    try {
      const resp = await statisticsApi.top10Inventory();
      const data = resp.data || [];
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: data.map(item => item.materialName),
          axisLabel: {
            rotate: 30,
            interval: 0,
          },
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            name: '库存数量',
            type: 'bar',
            data: data.map(item => item.quantity),
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#1890ff' },
                { offset: 1, color: '#69c0ff' },
              ]),
            },
          },
        ],
      };
      
      inventoryChart.setOption(option);
    } catch (e) {
      smartSentry.captureError(e);
    }
  }

  async function loadPurchaseData() {
    try {
      const resp = await statisticsApi.purchaseStatistics(purchaseType.value);
      const data = resp.data || [];
      
      const option = {
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          data: ['采购金额', '采购单数', '材料种类'],
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: data.map(item => item.date),
        },
        yAxis: [
          {
            type: 'value',
            name: '金额',
            position: 'left',
          },
          {
            type: 'value',
            name: '数量',
            position: 'right',
          },
        ],
        series: [
          {
            name: '采购金额',
            type: 'line',
            data: data.map(item => item.totalAmount),
            smooth: true,
            itemStyle: { color: '#1890ff' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(24,144,255,0.3)' },
                { offset: 1, color: 'rgba(24,144,255,0.05)' },
              ]),
            },
          },
          {
            name: '采购单数',
            type: 'bar',
            yAxisIndex: 1,
            data: data.map(item => item.orderCount),
            itemStyle: { color: '#52c41a' },
          },
          {
            name: '材料种类',
            type: 'bar',
            yAxisIndex: 1,
            data: data.map(item => item.materialCount),
            itemStyle: { color: '#fa8c16' },
          },
        ],
      };
      
      purchaseChart.setOption(option);
    } catch (e) {
      smartSentry.captureError(e);
    }
  }

  async function loadOutboundData() {
    try {
      const resp = await statisticsApi.outboundStatistics(outboundType.value);
      const data = resp.data || [];
      
      const option = {
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          data: ['出库金额', '出库单数', '材料种类'],
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: data.map(item => item.date),
        },
        yAxis: [
          {
            type: 'value',
            name: '金额',
            position: 'left',
          },
          {
            type: 'value',
            name: '数量',
            position: 'right',
          },
        ],
        series: [
          {
            name: '出库金额',
            type: 'line',
            data: data.map(item => item.totalAmount),
            smooth: true,
            itemStyle: { color: '#13c2c2' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(19,194,194,0.3)' },
                { offset: 1, color: 'rgba(19,194,194,0.05)' },
              ]),
            },
          },
          {
            name: '出库单数',
            type: 'bar',
            yAxisIndex: 1,
            data: data.map(item => item.orderCount),
            itemStyle: { color: '#722ed1' },
          },
          {
            name: '材料种类',
            type: 'bar',
            yAxisIndex: 1,
            data: data.map(item => item.materialCount),
            itemStyle: { color: '#eb2f96' },
          },
        ],
      };
      
      outboundChart.setOption(option);
    } catch (e) {
      smartSentry.captureError(e);
    }
  }

  function initCharts() {
    inventoryChart = echarts.init(inventoryChartRef.value);
    purchaseChart = echarts.init(purchaseChartRef.value);
    outboundChart = echarts.init(outboundChartRef.value);
  }

  function handleResize() {
    inventoryChart?.resize();
    purchaseChart?.resize();
    outboundChart?.resize();
  }

  onMounted(() => {
    initCharts();
    loadBaseStatistics();
    loadInventoryData();
    loadPurchaseData();
    loadOutboundData();
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    inventoryChart?.dispose();
    purchaseChart?.dispose();
    outboundChart?.dispose();
  });
</script>

<style scoped>
.statistics-container {
  padding: 16px;
}

.stat-card {
  height: 100px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
}

.stat-info {
  margin-left: 16px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
}
</style>
