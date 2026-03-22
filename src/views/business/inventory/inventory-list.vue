<!--
  * 库存列表
  *
  * @Author:    1024创新实验室
  * @Date:      2024-01-01
  * @Copyright  1024创新实验室
-->
<template>
  <a-form class="smart-query-form">
    <a-row class="smart-query-form-row" v-privilege="'inventory:query'">
      <a-form-item label="材料编码" class="smart-query-form-item">
        <a-input style="width: 150px" v-model:value="queryForm.materialCode" placeholder="材料编码" />
      </a-form-item>

      <a-form-item label="材料名称" class="smart-query-form-item">
        <a-input style="width: 150px" v-model:value="queryForm.materialName" placeholder="材料名称" />
      </a-form-item>

      <a-form-item label="批次号" class="smart-query-form-item">
        <a-input style="width: 120px" v-model:value="queryForm.batchNo" placeholder="批次号" />
      </a-form-item>

      <a-form-item label="预警状态" class="smart-query-form-item">
        <a-select style="width: 120px" v-model:value="queryForm.warningStatus" placeholder="预警状态" allowClear>
          <a-select-option v-for="item in WARNING_STATUS_ENUM" :key="item.value" :value="item.value">
            {{ item.desc }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item class="smart-query-form-item">
        <a-button-group>
          <a-button type="primary" @click="onSearch" v-privilege="'inventory:query'">
            <template #icon>
              <SearchOutlined />
            </template>
            查询
          </a-button>
          <a-button @click="resetQuery" v-privilege="'inventory:query'">
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
        <a-button @click="addInventory" type="primary" v-privilege="'inventory:add'">
          <template #icon>
            <PlusOutlined />
          </template>
          新建库存
        </a-button>
        <a-button @click="refreshWarning" v-privilege="'inventory:update'">
          <template #icon>
            <SyncOutlined />
          </template>
          刷新预警状态
        </a-button>
      </div>
      <div class="smart-table-setting-block">
        <TableOperator v-model="columns" :tableId="TABLE_ID_CONST.BUSINESS.ERP.INVENTORY" :refresh="queryData" />
      </div>
    </a-row>

    <a-table
      size="small"
      :dataSource="tableData"
      :columns="columns"
      rowKey="inventoryId"
      :scroll="{ x: 1600, y: yHeight }"
      bordered
      :pagination="false"
      :showSorterTooltip="false"
      @change="onChange"
      @resizeColumn="handleResizeColumn"
    >
      <template #bodyCell="{ text, record, column }">
        <template v-if="column.dataIndex === 'materialName'">
          <a @click="showDetail(record)">{{ text }}</a>
        </template>
        <template v-if="column.dataIndex === 'warningStatus'">
          <a-tag :color="getWarningColor(text)">{{ getWarningDesc(text) }}</a-tag>
        </template>
        <template v-if="column.dataIndex === 'quantity'">
          <span :style="{ color: record.warningStatus === 1 ? 'orange' : '' }">{{ text }}</span>
        </template>
        <template v-if="column.dataIndex === 'availableQuantity'">
          <span :style="{ color: record.availableQuantity <= 0 ? 'red' : '' }">{{ text }}</span>
        </template>
        <template v-if="column.dataIndex === 'unitPrice'">
          <span>{{ text ? '¥' + text : '' }}</span>
        </template>
        <template v-if="column.dataIndex === 'expirationDate'">
          <span :style="{ color: record.warningStatus >= 2 ? 'red' : '' }">{{ text }}</span>
        </template>
        <template v-if="column.dataIndex === 'action'">
          <div class="smart-table-operate">
            <a-button @click="adjustInventory(record)" type="link" v-privilege="'inventory:adjust'">调整</a-button>
            <a-button @click="editInventory(record)" type="link" v-privilege="'inventory:update'">编辑</a-button>
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

    <InventoryFormModal ref="formModal" @reloadList="queryData" />
    <InventoryAdjustModal ref="adjustModal" @reloadList="queryData" />
  </a-card>
</template>
<script setup>
  import InventoryFormModal from './components/inventory-form-modal.vue';
  import InventoryAdjustModal from './components/inventory-adjust-modal.vue';
  import { onMounted, reactive, ref } from 'vue';
  import { message } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { inventoryApi } from '/@/api/business/inventory/inventory-api';
  import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const';
  import { smartSentry } from '/@/lib/smart-sentry';
  import TableOperator from '/@/components/support/table-operator/index.vue';
  import { TABLE_ID_CONST } from '/@/constants/support/table-id-const';
  import { WARNING_STATUS_ENUM } from '/@/constants/business/inventory/inventory-const';
  import _ from 'lodash';

  const columns = ref([
    {
      title: '材料编码',
      dataIndex: 'materialCode',
      resizable: true,
      width: 120,
    },
    {
      title: '材料名称',
      dataIndex: 'materialName',
      resizable: true,
      width: 150,
    },
    {
      title: '规格型号',
      dataIndex: 'specificationModel',
      resizable: true,
      width: 120,
    },
    {
      title: '计量单位',
      dataIndex: 'unit',
      resizable: true,
      width: 80,
    },
    {
      title: '批次号',
      dataIndex: 'batchNo',
      resizable: true,
      width: 120,
    },
    {
      title: '库存数量',
      dataIndex: 'quantity',
      resizable: true,
      width: 100,
    },
    {
      title: '锁定数量',
      dataIndex: 'lockedQuantity',
      resizable: true,
      width: 100,
    },
    {
      title: '可用数量',
      dataIndex: 'availableQuantity',
      resizable: true,
      width: 100,
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      resizable: true,
      width: 100,
    },
    {
      title: '存放位置',
      dataIndex: 'storageLocation',
      resizable: true,
      width: 100,
    },
    {
      title: '有效期至',
      dataIndex: 'expirationDate',
      resizable: true,
      width: 120,
    },
    {
      title: '预警状态',
      dataIndex: 'warningStatus',
      resizable: true,
      width: 100,
    },
    {
      title: '最后入库时间',
      dataIndex: 'lastInboundTime',
      resizable: true,
      width: 150,
    },
    {
      title: '最后出库时间',
      dataIndex: 'lastOutboundTime',
      resizable: true,
      width: 150,
    },
    {
      title: '操作',
      dataIndex: 'action',
      resizable: true,
      fixed: 'right',
      width: 100,
    },
  ]);

  const queryFormState = {
    materialCode: undefined,
    materialName: undefined,
    batchNo: undefined,
    warningStatus: undefined,
    pageNum: 1,
    pageSize: 10,
    sortItemList: [],
  };
  const queryForm = reactive(_.cloneDeep(queryFormState));
  const tableLoading = ref(false);
  const tableData = ref([]);
  const total = ref(0);

  function handleResizeColumn(w, col) {
    columns.value.forEach((item) => {
      if (item.dataIndex === col.dataIndex) {
        item.width = Math.floor(w);
        item.dragAndDropFlag = true;
      }
    });
  }

  function getWarningColor(value) {
    for (const key in WARNING_STATUS_ENUM) {
      if (WARNING_STATUS_ENUM[key].value === value) {
        return WARNING_STATUS_ENUM[key].color;
      }
    }
    return 'default';
  }

  function getWarningDesc(value) {
    for (const key in WARNING_STATUS_ENUM) {
      if (WARNING_STATUS_ENUM[key].value === value) {
        return WARNING_STATUS_ENUM[key].desc;
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
      let queryResult = await inventoryApi.query(queryForm);
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
  const adjustModal = ref();

  function addInventory() {
    formModal.value.showDrawer();
  }

  function editInventory(record) {
    formModal.value.showDrawer(record);
  }

  function showDetail(record) {
    formModal.value.showDrawer(record);
  }

  function adjustInventory(record) {
    adjustModal.value.showDrawer(record);
  }

  async function refreshWarning() {
    try {
      SmartLoading.show();
      await inventoryApi.refreshWarning();
      message.success('刷新预警状态成功');
      queryData();
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  }

  function onChange(pagination, filters, sorter, { action }) {
    if (action === 'sort') {
      const { order, field } = sorter;
      let column = camelToUnderscore(field);
      let findIndex = queryForm.sortItemList.findIndex((e) => e.column === column);
      if (findIndex !== -1) {
        queryForm.sortItemList.splice(findIndex, 1);
      }
      if (order) {
        let isAsc = order !== 'ascend';
        queryForm.sortItemList.push({
          column,
          isAsc,
        });
      }
      queryData();
    }
  }

  function camelToUnderscore(str) {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase();
  }

  const yHeight = ref(0);
  onMounted(() => {
    resetGetHeight();
  });

  function resetGetHeight() {
    let doc = document.querySelector('.ant-form');
    let btn = document.querySelector('.smart-table-btn-block');
    let tableCell = document.querySelector('.ant-table-cell');
    let page = document.querySelector('.smart-query-table-page');
    let box = document.querySelector('.admin-content');
    setTimeout(() => {
      let dueHeight = doc.offsetHeight + 10 + 24 + btn.offsetHeight + 15 + tableCell.offsetHeight + page.offsetHeight + 20;
      yHeight.value = box.offsetHeight - dueHeight;
    }, 100);
  }

  window.addEventListener(
    'resize',
    _.throttle(() => {
      resetGetHeight();
    }, 1000)
  );
</script>
