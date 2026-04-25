<!--
  * 供应商采购记录
-->
<template>
  <a-drawer :title="'采购记录 - ' + supplierInfo.supplierName" :width="900" :open="visible" :body-style="{ paddingBottom: '80px' }" @close="onClose">
    <a-table
      :dataSource="recordList"
      :columns="columns"
      rowKey="purchaseOrderId"
      bordered
      :pagination="false"
      size="small"
    >
      <template #bodyCell="{ text, record, column }">
        <template v-if="column.dataIndex === 'purchaseType'">
          <span>{{ record.purchaseTypeName }}</span>
        </template>
        <template v-if="column.dataIndex === 'approvalStatus'">
          <a-tag :color="getApprovalStatusColor(text)">{{ record.approvalStatusName }}</a-tag>
        </template>
        <template v-if="column.dataIndex === 'unitPrice' || column.dataIndex === 'totalPrice'">
          <span>{{ text ? '¥' + Number(text).toLocaleString() : '-' }}</span>
        </template>
      </template>
    </a-table>
    <div style="margin-top: 8px; text-align: right">
      <span>共 {{ recordList.length }} 条采购记录</span>
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
  import { supplierApi } from '/@/api/business/supplier/supplier-api';
  import { smartSentry } from '/@/lib/smart-sentry';
  import { PURCHASE_APPROVAL_STATUS_ENUM } from '/@/constants/business/purchase/purchase-const';

  const columns = ref([
    { title: '采购单号', dataIndex: 'purchaseOrderNo', width: 140 },
    { title: '项目名称', dataIndex: 'projectName', width: 140 },
    { title: '采购类型', dataIndex: 'purchaseType', width: 100 },
    { title: '材料编码', dataIndex: 'materialCode', width: 110 },
    { title: '材料名称', dataIndex: 'materialName', width: 130 },
    { title: '采购数量', dataIndex: 'purchaseQuantity', width: 100 },
    { title: '单价', dataIndex: 'unitPrice', width: 100 },
    { title: '总价', dataIndex: 'totalPrice', width: 100 },
    { title: '审批状态', dataIndex: 'approvalStatus', width: 100 },
    { title: '创建时间', dataIndex: 'createTime', width: 150 },
  ]);

  const visible = ref(false);
  const supplierInfo = ref({});
  const recordList = ref([]);

  function getApprovalStatusColor(value) {
    for (const key in PURCHASE_APPROVAL_STATUS_ENUM) {
      if (PURCHASE_APPROVAL_STATUS_ENUM[key].value === value) {
        return PURCHASE_APPROVAL_STATUS_ENUM[key].color;
      }
    }
    return 'default';
  }

  async function show(record) {
    supplierInfo.value = { supplierName: record.supplierName };
    visible.value = true;
    try {
      SmartLoading.show();
      const resp = await supplierApi.purchaseRecords(record.supplierId);
      recordList.value = resp.data || [];
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  }

  function onClose() {
    visible.value = false;
    recordList.value = [];
    supplierInfo.value = {};
  }

  defineExpose({
    show,
  });
</script>
