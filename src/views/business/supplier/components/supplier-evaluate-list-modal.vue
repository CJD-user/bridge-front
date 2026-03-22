<!--
  * 供应商评价列表弹窗
  *
  * @Author:    1024创新实验室
  * @Date:      2024-01-01
  * @Copyright  1024创新实验室
-->
<template>
  <a-modal :open="visible" title="供应商评价记录" :width="900" :footer="null" @cancel="onClose">
    <div style="margin-bottom: 16px">
      <a-button type="primary" @click="addEvaluate" v-privilege="'supplierEvaluate:add'">
        <template #icon>
          <PlusOutlined />
        </template>
        添加评价
      </a-button>
    </div>

    <a-table
      size="small"
      :dataSource="tableData"
      :columns="columns"
      rowKey="evaluateId"
      :scroll="{ x: 800 }"
      bordered
      :pagination="false"
      :loading="loading"
    >
      <template #bodyCell="{ text, record, column }">
        <template v-if="column.dataIndex === 'evaluateType'">
          <span>{{ getEvaluateTypeDesc(text) }}</span>
        </template>
        <template v-if="column.dataIndex === 'qualityScore'">
          <a-rate v-model:value="record.qualityScore" disabled :count="5" style="font-size: 12px" />
        </template>
        <template v-if="column.dataIndex === 'deliveryScore'">
          <a-rate v-model:value="record.deliveryScore" disabled :count="5" style="font-size: 12px" />
        </template>
        <template v-if="column.dataIndex === 'serviceScore'">
          <a-rate v-model:value="record.serviceScore" disabled :count="5" style="font-size: 12px" />
        </template>
        <template v-if="column.dataIndex === 'priceScore'">
          <a-rate v-model:value="record.priceScore" disabled :count="5" style="font-size: 12px" />
        </template>
        <template v-if="column.dataIndex === 'totalScore'">
          <a-tag :color="getScoreColor(text)">{{ text }}</a-tag>
        </template>
        <template v-if="column.dataIndex === 'action'">
          <div class="smart-table-operate">
            <a-button @click="editEvaluate(record)" type="link" v-privilege="'supplierEvaluate:update'">编辑</a-button>
            <a-button @click="deleteEvaluate(record)" danger type="link" v-privilege="'supplierEvaluate:delete'">删除</a-button>
          </div>
        </template>
      </template>
    </a-table>

    <SupplierEvaluateFormModal ref="formModal" @reloadList="queryList" />
  </a-modal>
</template>
<script setup>
  import { ref, onMounted } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { supplierEvaluateApi } from '/@/api/business/supplier/supplier-evaluate-api';
  import { smartSentry } from '/@/lib/smart-sentry';
  import { EVALUATE_TYPE_ENUM } from '/@/constants/business/supplier/supplier-evaluate-const';
  import SupplierEvaluateFormModal from './supplier-evaluate-form-modal.vue';

  const columns = ref([
    {
      title: '评价类型',
      dataIndex: 'evaluateType',
      width: 100,
    },
    {
      title: '评价日期',
      dataIndex: 'evaluateDate',
      width: 120,
    },
    {
      title: '质量评分',
      dataIndex: 'qualityScore',
      width: 120,
    },
    {
      title: '交付评分',
      dataIndex: 'deliveryScore',
      width: 120,
    },
    {
      title: '服务评分',
      dataIndex: 'serviceScore',
      width: 120,
    },
    {
      title: '价格评分',
      dataIndex: 'priceScore',
      width: 120,
    },
    {
      title: '综合评分',
      dataIndex: 'totalScore',
      width: 80,
    },
    {
      title: '评价人',
      dataIndex: 'createUserName',
      width: 100,
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 100,
    },
  ]);

  const visible = ref(false);
  const loading = ref(false);
  const tableData = ref([]);
  const supplierId = ref();
  const formModal = ref();

  function getEvaluateTypeDesc(value) {
    for (const key in EVALUATE_TYPE_ENUM) {
      if (EVALUATE_TYPE_ENUM[key].value === value) {
        return EVALUATE_TYPE_ENUM[key].desc;
      }
    }
    return '';
  }

  function getScoreColor(score) {
    if (score >= 4.5) return 'green';
    if (score >= 3.5) return 'blue';
    if (score >= 2.5) return 'orange';
    return 'red';
  }

  async function queryList() {
    if (!supplierId.value) return;
    loading.value = true;
    try {
      let resp = await supplierEvaluateApi.listBySupplierId(supplierId.value);
      tableData.value = resp.data || [];
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      loading.value = false;
    }
  }

  function show(sId) {
    supplierId.value = sId;
    visible.value = true;
    queryList();
  }

  function onClose() {
    visible.value = false;
    tableData.value = [];
  }

  function addEvaluate() {
    formModal.value.showDrawer({ supplierId: supplierId.value });
  }

  function editEvaluate(record) {
    formModal.value.showDrawer(record);
  }

  function deleteEvaluate(evaluateData) {
    Modal.confirm({
      title: '提示',
      content: '确定要删除该评价吗?',
      okText: '删除',
      okType: 'danger',
      onOk() {
        singleDelete(evaluateData);
      },
      cancelText: '取消',
      onCancel() {},
    });
  }

  async function singleDelete(evaluateData) {
    try {
      SmartLoading.show();
      await supplierEvaluateApi.delete(evaluateData.evaluateId);
      message.success('删除成功');
      queryList();
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  }

  defineExpose({
    show,
  });
</script>
