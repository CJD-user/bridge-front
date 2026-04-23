<!--
  * 采购申请详情
  *
  * @Author:    1024创新实验室
  * @Date:      2024-01-01
  * @Copyright  1024创新实验室
-->
<template>
  <a-drawer title="采购申请详情" :width="800" :open="visible" :body-style="{ paddingBottom: '80px' }" @close="onClose">
    <a-descriptions :column="2" bordered size="small">
      <a-descriptions-item label="采购单号">{{ detail.purchaseOrderNo }}</a-descriptions-item>
      <a-descriptions-item label="审批状态">
        <a-tag :color="getApprovalStatusColor(detail.approvalStatus)">{{ getApprovalStatusDesc(detail.approvalStatus) }}</a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="项目名称">{{ detail.projectName || '-' }}</a-descriptions-item>
      <a-descriptions-item label="采购类型">
        <span>{{ getPurchaseTypeDesc(detail.purchaseType) }}</span>
      </a-descriptions-item>
      <a-descriptions-item label="期望到货日期">{{ detail.expectedArrivalDate || '-' }}</a-descriptions-item>
      <a-descriptions-item label="采购金额">
        <span>{{ detail.totalAmount ? '¥' + Number(detail.totalAmount).toLocaleString() : '-' }}</span>
      </a-descriptions-item>
      <a-descriptions-item label="申请人">{{ detail.createUserName }}</a-descriptions-item>
      <a-descriptions-item label="申请时间">{{ detail.createTime }}</a-descriptions-item>
      <a-descriptions-item label="采购原因" :span="2">{{ detail.purchaseReason || '-' }}</a-descriptions-item>
      <a-descriptions-item label="备注" :span="2">{{ detail.remark || '-' }}</a-descriptions-item>
    </a-descriptions>

    <a-divider>采购明细</a-divider>

    <a-table
      :dataSource="detail.itemList || []"
      :columns="itemColumns"
      rowKey="purchaseOrderItemId"
      bordered
      :pagination="false"
      size="small"
    >
      <template #bodyCell="{ text, column }">
        <template v-if="column.dataIndex === 'unitPrice' || column.dataIndex === 'totalPrice'">
          <span>{{ text ? '¥' + text : '' }}</span>
        </template>
      </template>
    </a-table>

    <div style="margin-top: 8px; text-align: right">
      <span>合计数量: {{ totalQuantity }} 件，合计金额: ¥{{ totalAmount.toLocaleString() }}</span>
    </div>

    <a-divider>审批记录</a-divider>

    <a-timeline>
      <a-timeline-item v-for="record in approvalRecords" :key="record.approvalRecordId" :color="getTimelineColor(record.approvalStatus)">
        <p><strong>节点{{ record.nodeOrder }}</strong></p>
        <p>审批人: {{ record.approverName || '-' }}</p>
        <p>
          审批结果: 
          <a-tag :color="getRecordApprovalColor(record.approvalStatus)">{{ getRecordApprovalDesc(record.approvalStatus) }}</a-tag>
        </p>
        <p v-if="record.approvalOpinion">审批意见: {{ record.approvalOpinion }}</p>
        <p>审批时间: {{ record.approvalTime || '-' }}</p>
      </a-timeline-item>
    </a-timeline>

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
  import { ref, computed } from 'vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { purchaseOrderApi } from '/@/api/business/purchase/purchase-order-api';
  import { smartSentry } from '/@/lib/smart-sentry';
  import { 
    PURCHASE_TYPE_ENUM, 
    PURCHASE_APPROVAL_STATUS_ENUM,
  } from '/@/constants/business/purchase/purchase-const';
  import { RECORD_APPROVAL_STATUS_ENUM } from '/@/constants/business/outbound/outbound-const';

  const itemColumns = ref([
    {
      title: '材料编码',
      dataIndex: 'materialCode',
      width: 120,
    },
    {
      title: '材料名称',
      dataIndex: 'materialName',
      width: 150,
    },
    {
      title: '规格型号',
      dataIndex: 'specificationModel',
      width: 120,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      width: 80,
    },
    {
      title: '采购数量',
      dataIndex: 'purchaseQuantity',
      width: 100,
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      width: 100,
    },
    {
      title: '总价',
      dataIndex: 'totalPrice',
      width: 100,
    },
    {
      title: '建议供应商',
      dataIndex: 'supplierName',
      width: 120,
    },
  ]);

  const visible = ref(false);
  const detail = ref({});
  const approvalRecords = ref([]);

  const totalQuantity = computed(() => {
    return (detail.value.itemList || []).reduce((sum, item) => sum + (Number(item.purchaseQuantity) || 0), 0);
  });

  const totalAmount = computed(() => {
    return (detail.value.itemList || []).reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
  });

  function getPurchaseTypeDesc(value) {
    for (const key in PURCHASE_TYPE_ENUM) {
      if (PURCHASE_TYPE_ENUM[key].value === value) {
        return PURCHASE_TYPE_ENUM[key].desc;
      }
    }
    return '';
  }

  function getApprovalStatusColor(value) {
    for (const key in PURCHASE_APPROVAL_STATUS_ENUM) {
      if (PURCHASE_APPROVAL_STATUS_ENUM[key].value === value) {
        return PURCHASE_APPROVAL_STATUS_ENUM[key].color;
      }
    }
    return 'default';
  }

  function getApprovalStatusDesc(value) {
    for (const key in PURCHASE_APPROVAL_STATUS_ENUM) {
      if (PURCHASE_APPROVAL_STATUS_ENUM[key].value === value) {
        return PURCHASE_APPROVAL_STATUS_ENUM[key].desc;
      }
    }
    return '';
  }

  function getTimelineColor(status) {
    if (status === 1) return 'green';
    if (status === 2) return 'red';
    return 'gray';
  }

  function getRecordApprovalColor(status) {
    for (const key in RECORD_APPROVAL_STATUS_ENUM) {
      if (RECORD_APPROVAL_STATUS_ENUM[key].value === status) {
        return RECORD_APPROVAL_STATUS_ENUM[key].color;
      }
    }
    return 'default';
  }

  function getRecordApprovalDesc(status) {
    for (const key in RECORD_APPROVAL_STATUS_ENUM) {
      if (RECORD_APPROVAL_STATUS_ENUM[key].value === status) {
        return RECORD_APPROVAL_STATUS_ENUM[key].desc;
      }
    }
    return '待审批';
  }

  async function show(purchaseOrderId) {
    visible.value = true;
    try {
      SmartLoading.show();
      const resp = await purchaseOrderApi.getDetail(purchaseOrderId);
      detail.value = resp.data || {};
      const recordsResp = await purchaseOrderApi.approvalRecords(purchaseOrderId);
      approvalRecords.value = recordsResp.data || [];
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  }

  function onClose() {
    visible.value = false;
    detail.value = {};
    approvalRecords.value = [];
  }

  defineExpose({
    show,
  });
</script>
