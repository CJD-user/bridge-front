<!--
  * 我的出库申请
  *
  * @Author:    1024创新实验室
  * @Date:      2024-01-01
  * @Copyright  1024创新实验室
-->
<template>
  <a-form class="smart-query-form">
    <a-row class="smart-query-form-row">
      <a-form-item label="出库单号" class="smart-query-form-item">
        <a-input style="width: 150px" v-model:value="queryForm.outboundOrderNo" placeholder="出库单号" />
      </a-form-item>

      <a-form-item label="审批状态" class="smart-query-form-item">
        <a-select style="width: 120px" v-model:value="queryForm.approvalStatus" placeholder="审批状态" allowClear>
          <a-select-option v-for="item in APPROVAL_STATUS_ENUM" :key="item.value" :value="item.value">
            {{ item.desc }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item class="smart-query-form-item">
        <a-button-group>
          <a-button type="primary" @click="onSearch">
            <template #icon>
              <SearchOutlined />
            </template>
            查询
          </a-button>
          <a-button @click="resetQuery">
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
    <a-row class="smart-table-btn-block">
      <div class="smart-table-operate-block">
        <a-button @click="addOutbound" type="primary">
          <template #icon>
            <PlusOutlined />
          </template>
          发起出库申请
        </a-button>
      </div>
    </a-row>

    <a-table
      size="small"
      :dataSource="tableData"
      :columns="columns"
      rowKey="outboundOrderId"
      :scroll="{ x: 1200 }"
      bordered
      :pagination="false"
    >
      <template #bodyCell="{ text, record, column }">
        <template v-if="column.dataIndex === 'outboundOrderNo'">
          <a @click="showDetail(record)">{{ text }}</a>
        </template>
        <template v-if="column.dataIndex === 'outboundType'">
          <span>{{ getOutboundTypeDesc(text) }}</span>
        </template>
        <template v-if="column.dataIndex === 'approvalStatus'">
          <a-tag :color="getApprovalStatusColor(text)">{{ getApprovalStatusDesc(text) }}</a-tag>
        </template>
        <template v-if="column.dataIndex === 'status'">
          <a-tag :color="getOutboundStatusColor(text)">{{ getOutboundStatusDesc(text) }}</a-tag>
        </template>
        <template v-if="column.dataIndex === 'totalAmount'">
          <span>{{ text ? '¥' + Number(text).toLocaleString() : '' }}</span>
        </template>
        <template v-if="column.dataIndex === 'action'">
          <div class="smart-table-operate">
            <a-button v-if="record.approvalStatus === 0" @click="editOrder(record)" type="link">编辑</a-button>
            <a-button v-if="record.approvalStatus === 0" @click="cancelOrder(record)" type="link" danger>作废</a-button>
            <a-button v-if="record.approvalStatus === 1" @click="withdrawOrder(record)" type="link" danger>撤回</a-button>
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

    <OutboundOrderFormModal ref="formModal" @reloadList="queryData" />
    <OutboundOrderDetailModal ref="detailModal" />
  </a-card>
</template>
<script setup>
  import OutboundOrderFormModal from './components/outbound-order-form-modal.vue';
  import OutboundOrderDetailModal from './components/outbound-order-detail-modal.vue';
  import { onMounted, reactive, ref } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { outboundOrderApi } from '/@/api/business/outbound/outbound-order-api';
  import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const';
  import { smartSentry } from '/@/lib/smart-sentry';
  import { APPROVAL_STATUS_ENUM, OUTBOUND_STATUS_ENUM, OUTBOUND_TYPE_ENUM } from '/@/constants/business/outbound/outbound-const';
  import _ from 'lodash';

  const columns = ref([
    {
      title: '出库单号',
      dataIndex: 'outboundOrderNo',
      width: 150,
    },
    {
      title: '项目名称',
      dataIndex: 'projectName',
      width: 150,
    },
    {
      title: '出库类型',
      dataIndex: 'outboundType',
      width: 100,
    },
    {
      title: '领用人',
      dataIndex: 'receiverName',
      width: 100,
    },
    {
      title: '出库数量',
      dataIndex: 'totalQuantity',
      width: 100,
    },
    {
      title: '出库金额',
      dataIndex: 'totalAmount',
      width: 120,
    },
    {
      title: '审批状态',
      dataIndex: 'approvalStatus',
      width: 100,
    },
    {
      title: '出库状态',
      dataIndex: 'status',
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
      width: 180,
    },
  ]);

  const queryFormState = {
    outboundOrderNo: undefined,
    approvalStatus: undefined,
    pageNum: 1,
    pageSize: 10,
  };
  const queryForm = reactive(_.cloneDeep(queryFormState));
  const tableData = ref([]);
  const total = ref(0);

  function getOutboundTypeDesc(value) {
    for (const key in OUTBOUND_TYPE_ENUM) {
      if (OUTBOUND_TYPE_ENUM[key].value === value) return OUTBOUND_TYPE_ENUM[key].desc;
    }
    return '';
  }

  function getApprovalStatusColor(value) {
    for (const key in APPROVAL_STATUS_ENUM) {
      if (APPROVAL_STATUS_ENUM[key].value === value) return APPROVAL_STATUS_ENUM[key].color;
    }
    return 'default';
  }

  function getApprovalStatusDesc(value) {
    for (const key in APPROVAL_STATUS_ENUM) {
      if (APPROVAL_STATUS_ENUM[key].value === value) return APPROVAL_STATUS_ENUM[key].desc;
    }
    return '';
  }

  function getOutboundStatusColor(value) {
    for (const key in OUTBOUND_STATUS_ENUM) {
      if (OUTBOUND_STATUS_ENUM[key].value === value) return OUTBOUND_STATUS_ENUM[key].color;
    }
    return 'default';
  }

  function getOutboundStatusDesc(value) {
    for (const key in OUTBOUND_STATUS_ENUM) {
      if (OUTBOUND_STATUS_ENUM[key].value === value) return OUTBOUND_STATUS_ENUM[key].desc;
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
      let queryResult = await outboundOrderApi.queryMy(queryForm);
      tableData.value = queryResult.data.list;
      total.value = queryResult.data.total;
    } catch (e) {
      smartSentry.captureError(e);
    }
  }

  onMounted(queryData);

  const formModal = ref();
  const detailModal = ref();

  function addOutbound() {
    formModal.value.showDrawer();
  }

  function editOrder(record) {
    formModal.value.showDrawer(record);
  }

  function showDetail(record) {
    detailModal.value.show(record.outboundOrderId);
  }

  function withdrawOrder(record) {
    Modal.confirm({
      title: '提示',
      content: '确定要撤回该出库申请吗？',
      okText: '确定',
      okType: 'danger',
      onOk() {
        doWithdraw(record.outboundOrderId);
      },
      cancelText: '取消',
    });
  }

  async function doWithdraw(outboundOrderId) {
    try {
      SmartLoading.show();
      await outboundOrderApi.withdraw(outboundOrderId);
      message.success('撤回成功');
      queryData();
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  }

  function cancelOrder(record) {
    Modal.confirm({
      title: '提示',
      content: '确定要作废该出库申请吗？',
      okText: '确定',
      okType: 'danger',
      onOk() {
        doCancel(record.outboundOrderId);
      },
      cancelText: '取消',
    });
  }

  async function doCancel(outboundOrderId) {
    try {
      SmartLoading.show();
      await outboundOrderApi.cancel(outboundOrderId);
      message.success('作废成功');
      queryData();
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  }
</script>
