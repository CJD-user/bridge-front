<!--
  * 采购申请列表（管理员）
  *
  * @Author:    1024创新实验室
  * @Date:      2024-01-01
  * @Copyright  1024创新实验室
-->
<template>
  <a-form class="smart-query-form">
    <a-row class="smart-query-form-row" v-privilege="'purchaseOrder:query'">
      <a-form-item label="采购单号" class="smart-query-form-item">
        <a-input style="width: 150px" v-model:value="queryForm.purchaseOrderNo" placeholder="采购单号" />
      </a-form-item>

      <a-form-item label="项目名称" class="smart-query-form-item">
        <a-input style="width: 150px" v-model:value="queryForm.projectName" placeholder="项目名称" />
      </a-form-item>

      <a-form-item label="审批状态" class="smart-query-form-item">
        <a-select style="width: 120px" v-model:value="queryForm.approvalStatus" placeholder="审批状态" allowClear>
          <a-select-option v-for="item in PURCHASE_APPROVAL_STATUS_ENUM" :key="item.value" :value="item.value">
            {{ item.desc }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item class="smart-query-form-item">
        <a-button-group>
          <a-button type="primary" @click="onSearch" v-privilege="'purchaseOrder:query'">
            <template #icon>
              <SearchOutlined />
            </template>
            查询
          </a-button>
          <a-button @click="resetQuery" v-privilege="'purchaseOrder:query'">
            <template #icon>
              <ReloadOutlined />
            </template>
            重置
          </a-button>
        </a-button-group>
      </a-form-item>
    </a-row>
  </a-form>

  <a-card size="small" :bordered="false" :hoverable="true">
    <a-table
      size="small"
      :dataSource="tableData"
      :columns="columns"
      rowKey="purchaseOrderId"
      :scroll="{ x: 1400 }"
      bordered
      :pagination="false"
    >
      <template #bodyCell="{ text, record, column }">
        <template v-if="column.dataIndex === 'purchaseOrderNo'">
          <a @click="showDetail(record)">{{ text }}</a>
        </template>
        <template v-if="column.dataIndex === 'purchaseType'">
          <span>{{ getPurchaseTypeDesc(text) }}</span>
        </template>
        <template v-if="column.dataIndex === 'approvalStatus'">
          <a-tag :color="getApprovalStatusColor(text)">{{ getApprovalStatusDesc(text) }}</a-tag>
        </template>
        <template v-if="column.dataIndex === 'totalAmount'">
          <span>{{ text ? '¥' + Number(text).toLocaleString() : '' }}</span>
        </template>
        <template v-if="column.dataIndex === 'action'">
          <div class="smart-table-operate">
            <a-button v-if="record.approvalStatus === 1" @click="handleApproval(record)" type="link" v-privilege="'purchaseOrder:approval'">审批</a-button>
            <a-button @click="showDetail(record)" type="link">详情</a-button>
          </div>
        </template>
      </template>
    </a-table>

    <div class="smart-query-table-page">
      <a-pagination
        showSizeChanger
        showQuickJumper
        show-less-items
        :pageSizeOptions="PAGE_SIZE_OPTIONS"
        :defaultPageSize="queryForm.pageSize"
        v-model:current="queryForm.pageNum"
        v-model:pageSize="queryForm.pageSize"
        :total="total"
        @change="queryData"
        :show-total="(total) => `共${total}条`"
      />
    </div>

    <PurchaseOrderDetailModal ref="detailModal" />
    <PurchaseApprovalModal ref="approvalModal" @reloadList="queryData" />
  </a-card>
</template>
<script setup>
  import PurchaseOrderDetailModal from './components/purchase-order-detail-modal.vue';
  import PurchaseApprovalModal from './components/purchase-approval-modal.vue';
  import { onMounted, reactive, ref } from 'vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { purchaseOrderApi } from '/@/api/business/purchase/purchase-order-api';
  import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const';
  import { smartSentry } from '/@/lib/smart-sentry';
  import { PURCHASE_TYPE_ENUM, PURCHASE_APPROVAL_STATUS_ENUM } from '/@/constants/business/purchase/purchase-const';
  import _ from 'lodash';

  const columns = ref([
    {
      title: '采购单号',
      dataIndex: 'purchaseOrderNo',
      width: 150,
    },
    {
      title: '项目名称',
      dataIndex: 'projectName',
      width: 150,
    },
    {
      title: '采购类型',
      dataIndex: 'purchaseType',
      width: 100,
    },
    {
      title: '采购原因',
      dataIndex: 'purchaseReason',
      width: 150,
      ellipsis: true,
    },
    {
      title: '采购金额',
      dataIndex: 'totalAmount',
      width: 120,
    },
    {
      title: '期望到货日期',
      dataIndex: 'expectedArrivalDate',
      width: 120,
    },
    {
      title: '审批状态',
      dataIndex: 'approvalStatus',
      width: 100,
    },
    {
      title: '申请人',
      dataIndex: 'createUserName',
      width: 100,
    },
    {
      title: '申请时间',
      dataIndex: 'createTime',
      width: 150,
    },
    {
      title: '操作',
      dataIndex: 'action',
      fixed: 'right',
      width: 120,
    },
  ]);

  const queryFormState = {
    purchaseOrderNo: undefined,
    projectName: undefined,
    approvalStatus: undefined,
    pageNum: 1,
    pageSize: 10,
  };
  const queryForm = reactive(_.cloneDeep(queryFormState));
  const tableData = ref([]);
  const total = ref(0);

  function getPurchaseTypeDesc(value) {
    for (const key in PURCHASE_TYPE_ENUM) {
      if (PURCHASE_TYPE_ENUM[key].value === value) return PURCHASE_TYPE_ENUM[key].desc;
    }
    return '';
  }

  function getApprovalStatusColor(value) {
    for (const key in PURCHASE_APPROVAL_STATUS_ENUM) {
      if (PURCHASE_APPROVAL_STATUS_ENUM[key].value === value) return PURCHASE_APPROVAL_STATUS_ENUM[key].color;
    }
    return 'default';
  }

  function getApprovalStatusDesc(value) {
    for (const key in PURCHASE_APPROVAL_STATUS_ENUM) {
      if (PURCHASE_APPROVAL_STATUS_ENUM[key].value === value) return PURCHASE_APPROVAL_STATUS_ENUM[key].desc;
    }
    return '';
  }

  function resetQuery() {
    let pageSize = queryForm.pageSize;
    Object.assign(queryForm, _.cloneDeep(queryFormState));
    queryForm.pageSize = pageSize;
    queryData();
  }

  function onSearch() {
    queryForm.pageNum = 1;
    queryData();
  }

  async function queryData() {
    try {
      let queryResult = await purchaseOrderApi.query(queryForm);
      tableData.value = queryResult.data.list;
      total.value = queryResult.data.total;
    } catch (e) {
      smartSentry.captureError(e);
    }
  }

  onMounted(queryData);

  const detailModal = ref();
  const approvalModal = ref();

  function showDetail(record) {
    detailModal.value.show(record.purchaseOrderId);
  }

  function handleApproval(record) {
    approvalModal.value.show(record);
  }
</script>
