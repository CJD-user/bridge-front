<!--
  * 项目出库材料明细
-->
<template>
  <a-drawer :title="'出库材料 - ' + projectInfo.projectName" :width="800" :open="visible" :body-style="{ paddingBottom: '80px' }" @close="onClose">
    <a-table
      :dataSource="materialList"
      :columns="columns"
      rowKey="materialId"
      bordered
      :pagination="false"
      size="small"
    >
      <template #bodyCell="{ text, column }">
        <template v-if="column.dataIndex === 'totalAmount'">
          <span>{{ text ? '¥' + Number(text).toLocaleString() : '-' }}</span>
        </template>
      </template>
    </a-table>
    <div style="margin-top: 8px; text-align: right">
      <span>共 {{ materialList.length }} 种材料</span>
    </div>
    <div
      :style="{
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: '100%',
        borderTop: '1px solid #e9e9e9',
        padding: '10px 16px',
        background: '#fff',
        textAlign: 'right',
        zIndex: 1,
      }"
    >
      <a-button @click="onClose">关闭</a-button>
    </div>
  </a-drawer>
</template>
<script setup>
  import { ref } from 'vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { projectApi } from '/@/api/business/project/project-api';
  import { smartSentry } from '/@/lib/smart-sentry';

  const columns = ref([
    { title: '材料编码', dataIndex: 'materialCode', width: 120 },
    { title: '材料名称', dataIndex: 'materialName', width: 150 },
    { title: '规格型号', dataIndex: 'specificationModel', width: 120 },
    { title: '计量单位', dataIndex: 'unit', width: 80 },
    { title: '出库总数量', dataIndex: 'totalQuantity', width: 120 },
    { title: '出库总金额', dataIndex: 'totalAmount', width: 120 },
    { title: '出库次数', dataIndex: 'outboundCount', width: 100 },
  ]);

  const visible = ref(false);
  const projectInfo = ref({});
  const materialList = ref([]);

  async function show(record) {
    projectInfo.value = { projectName: record.projectName };
    visible.value = true;
    try {
      SmartLoading.show();
      const resp = await projectApi.outboundMaterials(record.projectId);
      materialList.value = resp.data || [];
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  }

  function onClose() {
    visible.value = false;
    materialList.value = [];
    projectInfo.value = {};
  }

  defineExpose({
    show,
  });
</script>
