<!--
  * 库存预警列表
-->
<template>
  <a-form class="smart-query-form">
    <a-row class="smart-query-form-row">
      <a-form-item label="材料名称" class="smart-query-form-item">
        <a-input style="width: 150px" v-model:value="queryForm.materialName" placeholder="材料名称" />
      </a-form-item>
      <a-form-item label="处理状态" class="smart-query-form-item">
        <a-select style="width: 120px" v-model:value="queryForm.handleStatus" placeholder="处理状态" allowClear>
          <a-select-option v-for="item in HANDLE_STATUS_ENUM" :key="item.value" :value="item.value">{{ item.desc }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item class="smart-query-form-item">
        <a-button-group>
          <a-button type="primary" @click="onSearch"><template #icon><SearchOutlined /></template>查询</a-button>
          <a-button @click="resetQuery"><template #icon><ReloadOutlined /></template>重置</a-button>
        </a-button-group>
      </a-form-item>
    </a-row>
  </a-form>
  <a-card size="small" :bordered="false" :hoverable="true">
    <a-table size="small" :dataSource="tableData" :columns="columns" rowKey="warningId" bordered :pagination="false">
      <template #bodyCell="{ text, record, column }">
        <template v-if="column.dataIndex === 'warningType'"><span>{{ record.warningTypeName }}</span></template>
        <template v-if="column.dataIndex === 'warningLevel'"><span>{{ record.warningLevelName }}</span></template>
        <template v-if="column.dataIndex === 'handleStatus'"><a-tag :color="getHandleStatusColor(text)">{{ record.handleStatusName }}</a-tag></template>
        <template v-if="column.dataIndex === 'action'">
          <div class="smart-table-operate">
            <a-button v-if="record.handleStatus === 0" @click="handleWarning(record)" type="link">处理</a-button>
          </div>
        </template>
      </template>
    </a-table>
    <div class="smart-query-table-page">
      <a-pagination showSizeChanger showQuickJumper show-less-items :pageSizeOptions="PAGE_SIZE_OPTIONS" :defaultPageSize="queryForm.pageSize" v-model:current="queryForm.pageNum" v-model:pageSize="queryForm.pageSize" :total="total" @change="queryData" :show-total="(total) => `共${total}条`" />
    </div>
    <WarningHandleModal ref="handleModal" @reloadList="queryData" />
  </a-card>
</template>
<script setup>
  import WarningHandleModal from './components/warning-handle-modal.vue';
  import { onMounted, reactive, ref } from 'vue';
  import { inventoryWarningApi } from '/@/api/business/inventory-warning/inventory-warning-api';
  import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const';
  import { smartSentry } from '/@/lib/smart-sentry';
  import { HANDLE_STATUS_ENUM } from '/@/constants/business/inventory-warning/inventory-warning-const';
  import _ from 'lodash';

  const columns = ref([
    { title: '材料编码', dataIndex: 'materialCode', width: 120 },
    { title: '材料名称', dataIndex: 'materialName', width: 150 },
    { title: '预警类型', dataIndex: 'warningType', width: 100 },
    { title: '预警级别', dataIndex: 'warningLevel', width: 100 },
    { title: '当前数量', dataIndex: 'currentQuantity', width: 100 },
    { title: '阈值数量', dataIndex: 'thresholdQuantity', width: 100 },
    { title: '预警内容', dataIndex: 'warningContent', width: 200, ellipsis: true },
    { title: '处理状态', dataIndex: 'handleStatus', width: 100 },
    { title: '处理人', dataIndex: 'handleUserName', width: 100 },
    { title: '处理时间', dataIndex: 'handleTime', width: 150 },
    { title: '创建时间', dataIndex: 'createTime', width: 150 },
    { title: '操作', dataIndex: 'action', fixed: 'right', width: 80 },
  ]);

  const queryFormState = { materialName: undefined, handleStatus: undefined, pageNum: 1, pageSize: 10 };
  const queryForm = reactive(_.cloneDeep(queryFormState));
  const tableData = ref([]);
  const total = ref(0);

  function getHandleStatusColor(value) {
    for (const key in HANDLE_STATUS_ENUM) {
      if (HANDLE_STATUS_ENUM[key].value === value) return HANDLE_STATUS_ENUM[key].color;
    }
    return 'default';
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
      let queryResult = await inventoryWarningApi.query(queryForm);
      tableData.value = queryResult.data.list;
      total.value = queryResult.data.total;
    } catch (e) {
      smartSentry.captureError(e);
    }
  }

  onMounted(queryData);

  const handleModal = ref();

  function handleWarning(record) {
    handleModal.value.show(record);
  }
</script>
