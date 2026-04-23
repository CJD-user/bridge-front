<!--
  * 入库记录列表
  *
  * @Author:    1024创新实验室
  * @Date:      2024-01-01
  * @Copyright  1024创新实验室
-->
<template>
  <a-form class="smart-query-form">
    <a-row class="smart-query-form-row" v-privilege="'inboundRecord:query'">
      <a-form-item label="材料编码" class="smart-query-form-item">
        <a-input style="width: 150px" v-model:value="queryForm.materialCode" placeholder="材料编码" />
      </a-form-item>

      <a-form-item label="材料名称" class="smart-query-form-item">
        <a-input style="width: 150px" v-model:value="queryForm.materialName" placeholder="材料名称" />
      </a-form-item>

      <a-form-item label="入库类型" class="smart-query-form-item">
        <a-select style="width: 120px" v-model:value="queryForm.inboundType" placeholder="入库类型" allowClear>
          <a-select-option v-for="item in INBOUND_TYPE_ENUM" :key="item.value" :value="item.value">
            {{ item.desc }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item class="smart-query-form-item">
        <a-button-group>
          <a-button type="primary" @click="onSearch" v-privilege="'inboundRecord:query'">
            <template #icon>
              <SearchOutlined />
            </template>
            查询
          </a-button>
          <a-button @click="resetQuery" v-privilege="'inboundRecord:query'">
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
        <a-button @click="addRecord" type="primary" v-privilege="'inboundRecord:add'">
          <template #icon>
            <PlusOutlined />
          </template>
          新增入库
        </a-button>
      </div>
    </a-row>

    <a-table
      size="small"
      :dataSource="tableData"
      :columns="columns"
      rowKey="inboundRecordId"
      :scroll="{ x: 1200 }"
      bordered
      :pagination="false"
    >
      <template #bodyCell="{ text, record, column }">
        <template v-if="column.dataIndex === 'inboundType'">
          <span>{{ getInboundTypeDesc(text) }}</span>
        </template>
        <template v-if="column.dataIndex === 'unitPrice' || column.dataIndex === 'totalPrice'">
          <span>{{ text ? '¥' + text : '' }}</span>
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

    <InboundRecordFormModal ref="formModal" @reloadList="queryData" />
  </a-card>
</template>
<script setup>
  import InboundRecordFormModal from './components/inbound-record-form-modal.vue';
  import { onMounted, reactive, ref } from 'vue';
  import { inboundRecordApi } from '/@/api/business/inbound/inbound-record-api';
  import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const';
  import { smartSentry } from '/@/lib/smart-sentry';
  import { INBOUND_TYPE_ENUM } from '/@/constants/business/inbound/inbound-const';
  import _ from 'lodash';

  const columns = ref([
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
      title: '批次号',
      dataIndex: 'batchNo',
      width: 100,
    },
    {
      title: '入库数量',
      dataIndex: 'quantity',
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
      title: '入库类型',
      dataIndex: 'inboundType',
      width: 100,
    },
    {
      title: '存放位置',
      dataIndex: 'storageLocation',
      width: 120,
    },
    {
      title: '操作人',
      dataIndex: 'createUserName',
      width: 100,
    },
    {
      title: '入库时间',
      dataIndex: 'createTime',
      width: 150,
    },
  ]);

  const queryFormState = {
    materialCode: undefined,
    materialName: undefined,
    inboundType: undefined,
    pageNum: 1,
    pageSize: 10,
  };
  const queryForm = reactive(_.cloneDeep(queryFormState));
  const tableData = ref([]);
  const total = ref(0);

  function getInboundTypeDesc(value) {
    for (const key in INBOUND_TYPE_ENUM) {
      if (INBOUND_TYPE_ENUM[key].value === value) return INBOUND_TYPE_ENUM[key].desc;
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
      let queryResult = await inboundRecordApi.query(queryForm);
      tableData.value = queryResult.data.list;
      total.value = queryResult.data.total;
    } catch (e) {
      smartSentry.captureError(e);
    }
  }

  onMounted(queryData);

  const formModal = ref();

  function addRecord() {
    formModal.value.showDrawer();
  }
</script>
