<!--
  * 审批流程列表
  *
  * @Author:    1024创新实验室
  * @Date:      2024-01-01
  * @Copyright  1024创新实验室
-->
<template>
  <a-form class="smart-query-form">
    <a-row class="smart-query-form-row" v-privilege="'approvalFlow:query'">
      <a-form-item label="流程名称" class="smart-query-form-item">
        <a-input style="width: 150px" v-model:value="queryForm.flowName" placeholder="流程名称" />
      </a-form-item>

      <a-form-item label="流程编码" class="smart-query-form-item">
        <a-input style="width: 150px" v-model:value="queryForm.flowCode" placeholder="流程编码" />
      </a-form-item>

      <a-form-item label="业务类型" class="smart-query-form-item">
        <a-select style="width: 120px" v-model:value="queryForm.businessType" placeholder="业务类型" allowClear>
          <a-select-option v-for="item in BUSINESS_TYPE_ENUM" :key="item.value" :value="item.value">
            {{ item.desc }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="状态" class="smart-query-form-item">
        <a-select style="width: 100px" v-model:value="queryForm.status" placeholder="状态" allowClear>
          <a-select-option v-for="item in FLOW_STATUS_ENUM" :key="item.value" :value="item.value">
            {{ item.desc }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item class="smart-query-form-item">
        <a-button-group>
          <a-button type="primary" @click="onSearch" v-privilege="'approvalFlow:query'">
            <template #icon>
              <SearchOutlined />
            </template>
            查询
          </a-button>
          <a-button @click="resetQuery" v-privilege="'approvalFlow:query'">
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
        <a-button @click="addFlow" type="primary" v-privilege="'approvalFlow:add'">
          <template #icon>
            <PlusOutlined />
          </template>
          新建
        </a-button>
      </div>
      <div class="smart-table-setting-block">
        <TableOperator v-model="columns" :tableId="TABLE_ID_CONST.BUSINESS.ERP.APPROVAL_FLOW" :refresh="queryData" />
      </div>
    </a-row>

    <a-table
      size="small"
      :dataSource="tableData"
      :columns="columns"
      rowKey="approvalFlowId"
      :scroll="{ x: 1000 }"
      bordered
      :pagination="false"
    >
      <template #bodyCell="{ text, record, column }">
        <template v-if="column.dataIndex === 'flowName'">
          <a @click="showDetail(record)">{{ text }}</a>
        </template>
        <template v-if="column.dataIndex === 'businessType'">
          <span>{{ getBusinessTypeDesc(text) }}</span>
        </template>
        <template v-if="column.dataIndex === 'status'">
          <a-tag :color="text === 1 ? 'green' : 'red'">{{ text === 1 ? '启用' : '停用' }}</a-tag>
        </template>
        <template v-if="column.dataIndex === 'action'">
          <div class="smart-table-operate">
            <a-button @click="addFlow(record)" type="link" v-privilege="'approvalFlow:update'">编辑</a-button>
            <a-button @click="deleteFlow(record)" danger type="link" v-privilege="'approvalFlow:delete'">删除</a-button>
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

    <ApprovalFlowFormModal ref="formModal" @reloadList="queryData" />
  </a-card>
</template>
<script setup>
  import ApprovalFlowFormModal from './components/approval-flow-form-modal.vue';
  import { onMounted, reactive, ref } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { approvalFlowApi } from '/@/api/business/approval-flow/approval-flow-api';
  import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const';
  import { smartSentry } from '/@/lib/smart-sentry';
  import TableOperator from '/@/components/support/table-operator/index.vue';
  import { TABLE_ID_CONST } from '/@/constants/support/table-id-const';
  import { BUSINESS_TYPE_ENUM, FLOW_STATUS_ENUM } from '/@/constants/business/approval-flow/approval-flow-const';
  import _ from 'lodash';

  const columns = ref([
    {
      title: '流程名称',
      dataIndex: 'flowName',
      width: 150,
    },
    {
      title: '流程编码',
      dataIndex: 'flowCode',
      width: 120,
    },
    {
      title: '业务类型',
      dataIndex: 'businessType',
      width: 120,
    },
    {
      title: '流程描述',
      dataIndex: 'description',
      width: 200,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
    },
    {
      title: '创建人',
      dataIndex: 'createUserName',
      width: 100,
    },
    {
      title: '创建时间',
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
    flowName: undefined,
    flowCode: undefined,
    businessType: undefined,
    status: undefined,
    pageNum: 1,
    pageSize: 10,
  };
  const queryForm = reactive(_.cloneDeep(queryFormState));
  const tableLoading = ref(false);
  const tableData = ref([]);
  const total = ref(0);

  function getBusinessTypeDesc(value) {
    for (const key in BUSINESS_TYPE_ENUM) {
      if (BUSINESS_TYPE_ENUM[key].value === value) {
        return BUSINESS_TYPE_ENUM[key].desc;
      }
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
    tableLoading.value = true;
    try {
      let queryResult = await approvalFlowApi.query(queryForm);
      tableData.value = queryResult.data.list;
      total.value = queryResult.data.total;
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      tableLoading.value = false;
    }
  }

  onMounted(queryData);

  const formModal = ref();

  function addFlow(rowData) {
    formModal.value.showDrawer(rowData);
  }

  function showDetail(record) {
    formModal.value.showDrawer(record);
  }

  function deleteFlow(rowData) {
    Modal.confirm({
      title: '提示',
      content: '确定要删除【' + rowData.flowName + '】吗?',
      okText: '删除',
      okType: 'danger',
      onOk() {
        doDelete(rowData.approvalFlowId);
      },
      cancelText: '取消',
      onCancel() {},
    });
  }

  async function doDelete(approvalFlowId) {
    try {
      SmartLoading.show();
      await approvalFlowApi.delete(approvalFlowId);
      message.success('删除成功');
      queryData();
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  }
</script>
