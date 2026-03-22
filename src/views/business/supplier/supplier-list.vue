<!--
  * 供应商列表
  *
  * @Author:    1024创新实验室
  * @Date:      2024-01-01
  * @Copyright  1024创新实验室
-->
<template>
  <a-form class="smart-query-form">
    <a-row class="smart-query-form-row" v-privilege="'supplier:query'">
      <a-form-item label="供应商编码" class="smart-query-form-item">
        <a-input style="width: 150px" v-model:value="queryForm.supplierCode" placeholder="供应商编码" />
      </a-form-item>

      <a-form-item label="供应商名称" class="smart-query-form-item">
        <a-input style="width: 200px" v-model:value="queryForm.supplierName" placeholder="供应商名称" />
      </a-form-item>

      <a-form-item label="联系人" class="smart-query-form-item">
        <a-input style="width: 120px" v-model:value="queryForm.contactPerson" placeholder="联系人" />
      </a-form-item>

      <a-form-item label="禁用状态" class="smart-query-form-item">
        <a-radio-group v-model:value="queryForm.disabledFlag" @change="onSearch">
          <a-radio-button :value="undefined">全部</a-radio-button>
          <a-radio-button :value="false">启用</a-radio-button>
          <a-radio-button :value="true">禁用</a-radio-button>
        </a-radio-group>
      </a-form-item>

      <a-form-item class="smart-query-form-item">
        <a-button-group>
          <a-button type="primary" @click="onSearch" v-privilege="'supplier:query'">
            <template #icon>
              <SearchOutlined />
            </template>
            查询
          </a-button>
          <a-button @click="resetQuery" v-privilege="'supplier:query'">
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
        <a-button @click="addSupplier" type="primary" v-privilege="'supplier:add'">
          <template #icon>
            <PlusOutlined />
          </template>
          新建
        </a-button>

        <a-button @click="confirmBatchDelete" danger :disabled="selectedRowKeyList.length === 0" v-privilege="'supplier:batchDelete'">
          <template #icon>
            <DeleteOutlined />
          </template>
          批量删除
        </a-button>
      </div>
      <div class="smart-table-setting-block">
        <TableOperator v-model="columns" :tableId="TABLE_ID_CONST.BUSINESS.ERP.SUPPLIER" :refresh="queryData" />
      </div>
    </a-row>

    <a-table
      size="small"
      :dataSource="tableData"
      :columns="columns"
      rowKey="supplierId"
      :scroll="{ x: 1800, y: yHeight }"
      bordered
      :pagination="false"
      :showSorterTooltip="false"
      :row-selection="{ selectedRowKeys: selectedRowKeyList, onChange: onSelectChange }"
      @change="onChange"
      @resizeColumn="handleResizeColumn"
    >
      <template #headerCell="{ column }">
        <SmartHeaderCell v-model:value="queryForm[column.filterOptions?.key || column.dataIndex]" :column="column" @change="queryData" />
      </template>
      <template #bodyCell="{ text, record, column }">
        <template v-if="column.dataIndex === 'supplierName'">
          <a @click="showDetail(record)">{{ text }}</a>
        </template>
        <template v-if="column.dataIndex === 'disabledFlag'">
          <a-switch
            v-model:checked="record.disabledFlag"
            :checkedValue="true"
            :unCheckedValue="false"
            @change="(checked) => onUpdateDisabled(record.supplierId, checked)"
            v-privilege="'supplier:update'"
          />
        </template>
        <template v-if="column.dataIndex === 'rating'">
          <a-rate v-model:value="record.rating" disabled :count="5" style="font-size: 12px" />
        </template>
        <template v-if="column.dataIndex === 'totalSupplyAmount'">
          <span>{{ text ? '¥' + Number(text).toLocaleString() : '¥0' }}</span>
        </template>
        <template v-if="column.dataIndex === 'address'">
          <span>{{ (record.provinceName || '') + (record.cityName || '') + (text || '') }}</span>
        </template>
        <template v-if="column.dataIndex === 'remark'">
          <span>{{ text || '-' }}</span>
        </template>
        <template v-if="column.dataIndex === 'action'">
          <div class="smart-table-operate">
            <a-button @click="showEvaluate(record)" type="link" v-privilege="'supplierEvaluate:query'">评价</a-button>
            <a-button @click="addSupplier(record)" type="link" v-privilege="'supplier:update'">编辑</a-button>
            <a-button @click="deleteSupplier(record)" danger type="link" v-privilege="'supplier:delete'">删除</a-button>
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

    <SupplierFormModal ref="formModal" @reloadList="queryData" />
    <SupplierEvaluateListModal ref="evaluateModal" />
  </a-card>
</template>
<script setup>
  import SupplierFormModal from './components/supplier-form-modal.vue';
  import SupplierEvaluateListModal from './components/supplier-evaluate-list-modal.vue';
  import { onMounted, reactive, ref } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { supplierApi } from '/@/api/business/supplier/supplier-api';
  import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const';
  import { smartSentry } from '/@/lib/smart-sentry';
  import TableOperator from '/@/components/support/table-operator/index.vue';
  import { TABLE_ID_CONST } from '/@/constants/support/table-id-const';
  import SmartHeaderCell from '/@/components/support/table-header-cell/index.vue';
  import _ from 'lodash';

  const columns = ref([
    {
      title: '供应商编码',
      dataIndex: 'supplierCode',
      resizable: true,
      filterOptions: {
        type: 'input',
        key: 'supplierCode',
      },
      width: 120,
    },
    {
      title: '供应商名称',
      dataIndex: 'supplierName',
      resizable: true,
      filterOptions: {
        type: 'input',
        key: 'supplierName',
      },
      width: 180,
    },
    {
      title: '简称',
      dataIndex: 'shortName',
      resizable: true,
      width: 100,
    },
    {
      title: '联系人',
      dataIndex: 'contactPerson',
      resizable: true,
      width: 80,
    },
    {
      title: '联系电话',
      dataIndex: 'contactPhone',
      resizable: true,
      width: 120,
    },
    {
      title: '地址',
      dataIndex: 'address',
      resizable: true,
      width: 200,
    },
    {
      title: '评级',
      dataIndex: 'rating',
      resizable: true,
      width: 120,
    },
    {
      title: '累计供货次数',
      dataIndex: 'totalSupplyCount',
      resizable: true,
      width: 120,
    },
    {
      title: '累计供货金额',
      dataIndex: 'totalSupplyAmount',
      resizable: true,
      width: 120,
    },
    {
      title: '禁用状态',
      dataIndex: 'disabledFlag',
      resizable: true,
      width: 80,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      resizable: true,
      width: 150,
    },
    {
      title: '操作',
      dataIndex: 'action',
      resizable: true,
      fixed: 'right',
      width: 150,
    },
  ]);

  const queryFormState = {
    supplierCode: undefined,
    supplierName: undefined,
    contactPerson: undefined,
    disabledFlag: undefined,
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
      let queryResult = await supplierApi.query(queryForm);
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
  const evaluateModal = ref();

  function addSupplier(supplierData) {
    formModal.value.showDrawer(supplierData);
  }

  function showDetail(record) {
    formModal.value.showDrawer(record);
  }

  function showEvaluate(record) {
    evaluateModal.value.show(record.supplierId);
  }

  function deleteSupplier(supplierData) {
    Modal.confirm({
      title: '提示',
      content: '确定要删除【' + supplierData.supplierName + '】吗?',
      okText: '删除',
      okType: 'danger',
      onOk() {
        singleDelete(supplierData);
      },
      cancelText: '取消',
      onCancel() {},
    });
  }

  async function singleDelete(supplierData) {
    try {
      SmartLoading.show();
      await supplierApi.delete(supplierData.supplierId);
      message.success('删除成功');
      queryData();
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  }

  const selectedRowKeyList = ref([]);

  function onSelectChange(selectedRowKeys) {
    selectedRowKeyList.value = selectedRowKeys;
  }

  function confirmBatchDelete() {
    Modal.confirm({
      title: '提示',
      content: '确定要删除选中供应商吗?',
      okText: '删除',
      okType: 'danger',
      onOk() {
        batchDelete();
      },
      cancelText: '取消',
      onCancel() {},
    });
  }

  async function batchDelete() {
    try {
      SmartLoading.show();
      await supplierApi.batchDelete(selectedRowKeyList.value);
      message.success('删除成功');
      queryData();
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  }

  async function onUpdateDisabled(supplierId, disabledFlag) {
    try {
      SmartLoading.show();
      await supplierApi.updateDisabled(supplierId, disabledFlag);
      message.success('更新成功');
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
