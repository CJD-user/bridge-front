<!--
  * 供应商评价列表
  *
  * @Author:    1024创新实验室
  * @Date:      2024-01-01
  * @Copyright  1024创新实验室
-->
<template>
  <a-form class="smart-query-form">
    <a-row class="smart-query-form-row" v-privilege="'supplierEvaluate:query'">
      <a-form-item label="供应商" class="smart-query-form-item">
        <SupplierSelect v-model:value="queryForm.supplierId" placeholder="请选择供应商" style="width: 200px" />
      </a-form-item>

      <a-form-item label="评价类型" class="smart-query-form-item">
        <a-select style="width: 120px" v-model:value="queryForm.evaluateType" placeholder="评价类型" allowClear>
          <a-select-option v-for="item in EVALUATE_TYPE_ENUM" :key="item.value" :value="item.value">
            {{ item.desc }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="评价日期" class="smart-query-form-item">
        <a-range-picker v-model:value="queryForm.evaluateDateRange" style="width: 220px" />
      </a-form-item>

      <a-form-item class="smart-query-form-item">
        <a-button-group>
          <a-button type="primary" @click="onSearch" v-privilege="'supplierEvaluate:query'">
            <template #icon>
              <SearchOutlined />
            </template>
            查询
          </a-button>
          <a-button @click="resetQuery" v-privilege="'supplierEvaluate:query'">
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
        <a-button @click="addEvaluate" type="primary" v-privilege="'supplierEvaluate:add'">
          <template #icon>
            <PlusOutlined />
          </template>
          新建评价
        </a-button>
      </div>
      <div class="smart-table-setting-block">
        <TableOperator v-model="columns" :tableId="TABLE_ID_CONST.BUSINESS.ERP.SUPPLIER_EVALUATE" :refresh="queryData" />
      </div>
    </a-row>

    <a-table
      size="small"
      :dataSource="tableData"
      :columns="columns"
      rowKey="evaluateId"
      :scroll="{ x: 1200, y: yHeight }"
      bordered
      :pagination="false"
      :showSorterTooltip="false"
      @change="onChange"
      @resizeColumn="handleResizeColumn"
    >
      <template #bodyCell="{ text, record, column }">
        <template v-if="column.dataIndex === 'supplierName'">
          <a @click="showDetail(record)">{{ text }}</a>
        </template>
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
            <a-button @click="addEvaluate(record)" type="link" v-privilege="'supplierEvaluate:update'">编辑</a-button>
            <a-button @click="deleteEvaluate(record)" danger type="link" v-privilege="'supplierEvaluate:delete'">删除</a-button>
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

    <SupplierEvaluateFormModal ref="formModal" @reloadList="queryData" />
  </a-card>
</template>
<script setup>
  import SupplierEvaluateFormModal from './components/supplier-evaluate-form-modal.vue';
  import SupplierSelect from '/@/components/business/supplier-select/index.vue';
  import { onMounted, reactive, ref } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { supplierEvaluateApi } from '/@/api/business/supplier/supplier-evaluate-api';
  import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const';
  import { smartSentry } from '/@/lib/smart-sentry';
  import TableOperator from '/@/components/support/table-operator/index.vue';
  import { TABLE_ID_CONST } from '/@/constants/support/table-id-const';
  import { EVALUATE_TYPE_ENUM } from '/@/constants/business/supplier/supplier-evaluate-const';
  import _ from 'lodash';

  const columns = ref([
    {
      title: '供应商名称',
      dataIndex: 'supplierName',
      resizable: true,
      width: 180,
    },
    {
      title: '评价类型',
      dataIndex: 'evaluateType',
      resizable: true,
      width: 100,
    },
    {
      title: '评价日期',
      dataIndex: 'evaluateDate',
      resizable: true,
      width: 120,
    },
    {
      title: '质量评分',
      dataIndex: 'qualityScore',
      resizable: true,
      width: 120,
    },
    {
      title: '交付评分',
      dataIndex: 'deliveryScore',
      resizable: true,
      width: 120,
    },
    {
      title: '服务评分',
      dataIndex: 'serviceScore',
      resizable: true,
      width: 120,
    },
    {
      title: '价格评分',
      dataIndex: 'priceScore',
      resizable: true,
      width: 120,
    },
    {
      title: '综合评分',
      dataIndex: 'totalScore',
      resizable: true,
      width: 80,
    },
    {
      title: '评价人',
      dataIndex: 'createUserName',
      resizable: true,
      width: 100,
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
      width: 100,
    },
  ]);

  const queryFormState = {
    supplierId: undefined,
    evaluateType: undefined,
    evaluateDateRange: [],
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
      let params = { ...queryForm };
      if (queryForm.evaluateDateRange && queryForm.evaluateDateRange.length === 2) {
        params.evaluateDateStart = queryForm.evaluateDateRange[0];
        params.evaluateDateEnd = queryForm.evaluateDateRange[1];
      }
      delete params.evaluateDateRange;
      let queryResult = await supplierEvaluateApi.query(params);
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

  function addEvaluate(evaluateData) {
    formModal.value.showDrawer(evaluateData);
  }

  function showDetail(record) {
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
