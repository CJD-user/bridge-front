<!--
  * 材料列表
  *
  * @Author:    1024创新实验室
  * @Date:      2024-01-01
  * @Copyright  1024创新实验室
-->
<template>
  <a-form class="smart-query-form">
    <a-row class="smart-query-form-row" v-privilege="'material:query'">
      <a-form-item label="材料编码" class="smart-query-form-item">
        <a-input style="width: 150px" v-model:value="queryForm.materialCode" placeholder="材料编码" />
      </a-form-item>

      <a-form-item label="材料名称" class="smart-query-form-item">
        <a-input style="width: 200px" v-model:value="queryForm.materialName" placeholder="材料名称" />
      </a-form-item>

      <a-form-item label="材料分类" class="smart-query-form-item">
        <MaterialCategoryTreeSelect
          width="150px"
          v-model:value="queryForm.materialCategoryId"
          placeholder="请选择材料分类"
        />
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
          <a-button type="primary" @click="onSearch" v-privilege="'material:query'">
            <template #icon>
              <SearchOutlined />
            </template>
            查询
          </a-button>
          <a-button @click="resetQuery" v-privilege="'material:query'">
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
        <a-button @click="addMaterial" type="primary" v-privilege="'material:add'">
          <template #icon>
            <PlusOutlined />
          </template>
          新建
        </a-button>

        <a-button @click="confirmBatchDelete" danger :disabled="selectedRowKeyList.length === 0" v-privilege="'material:batchDelete'">
          <template #icon>
            <DeleteOutlined />
          </template>
          批量删除
        </a-button>

        <a-button @click="showImportModal" type="primary" v-privilege="'material:import'">
          <template #icon>
            <ImportOutlined />
          </template>
          导入
        </a-button>

        <a-button @click="onExportMaterial" type="primary" v-privilege="'material:export'">
          <template #icon>
            <ExportOutlined />
          </template>
          导出
        </a-button>
      </div>
      <div class="smart-table-setting-block">
        <TableOperator v-model="columns" :tableId="TABLE_ID_CONST.BUSINESS.ERP.MATERIAL" :refresh="queryData" />
      </div>
    </a-row>

    <a-table
      size="small"
      :dataSource="tableData"
      :columns="columns"
      rowKey="materialId"
      :scroll="{ x: 1500, y: yHeight }"
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
        <template v-if="column.dataIndex === 'materialName'">
          <a @click="showDetail(record)">{{ text }}</a>
        </template>
        <template v-if="column.dataIndex === 'disabledFlag'">
          <a-switch
            v-model:checked="record.disabledFlag"
            :checkedValue="true"
            :unCheckedValue="false"
            @change="(checked) => onUpdateDisabled(record.materialId, checked)"
            v-privilege="'material:update'"
          />
        </template>
        <template v-if="column.dataIndex === 'unitPrice'">
          <span>{{ text ? '¥' + text : '' }}</span>
        </template>
        <template v-if="column.dataIndex === 'materialImage'">
          <a-image v-if="text" :width="40" :height="40" :src="text" style="object-fit: cover" />
          <span v-else>-</span>
        </template>
        <template v-if="column.dataIndex === 'remark'">
          <span>{{ text || '-' }}</span>
        </template>
        <template v-if="column.dataIndex === 'action'">
          <div class="smart-table-operate">
            <a-button @click="addMaterial(record)" type="link" v-privilege="'material:update'">编辑</a-button>
            <a-button @click="deleteMaterial(record)" danger type="link" v-privilege="'material:delete'">删除</a-button>
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

    <MaterialFormModal ref="formModal" @reloadList="queryData" />

    <a-modal v-model:open="importModalShowFlag" title="导入材料" @onCancel="hideImportModal" @ok="hideImportModal">
      <div style="text-align: center; width: 400px; margin: 0 auto">
        <a-button @click="onDownloadTemplate"> <download-outlined />第一步：下载模板</a-button>
        <br />
        <br />
        <a-upload
          v-model:fileList="fileList"
          name="file"
          :multiple="false"
          accept=".xls,.xlsx"
          :before-upload="beforeUpload"
          @remove="handleRemove"
        >
          <a-button>
            <upload-outlined />
            第二步：选择文件
          </a-button>
        </a-upload>

        <br />
        <a-button @click="onImportMaterial">
          <ImportOutlined />
          第三步：开始导入
        </a-button>
      </div>
    </a-modal>
  </a-card>
</template>
<script setup>
  import MaterialFormModal from './components/material-form-modal.vue';
  import { onMounted, reactive, ref } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { materialApi } from '/@/api/business/material/material-api';
  import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const';
  import MaterialCategoryTreeSelect from '/@/components/business/material-category-tree-select/index.vue';
  import { smartSentry } from '/@/lib/smart-sentry';
  import TableOperator from '/@/components/support/table-operator/index.vue';
  import { TABLE_ID_CONST } from '/@/constants/support/table-id-const';
  import SmartHeaderCell from '/@/components/support/table-header-cell/index.vue';
  import _ from 'lodash';

  const columns = ref([
    {
      title: '材料编码',
      dataIndex: 'materialCode',
      resizable: true,
      filterOptions: {
        type: 'input',
        key: 'materialCode',
      },
      width: 120,
    },
    {
      title: '材料名称',
      dataIndex: 'materialName',
      resizable: true,
      filterOptions: {
        type: 'input',
        key: 'materialName',
      },
      width: 150,
    },
    {
      title: '材料分类',
      dataIndex: 'categoryName',
      resizable: true,
      filterOptions: {
        type: 'category-tree',
        key: 'materialCategoryId',
        categoryType: CATEGORY_TYPE_ENUM.MATERIAL.value,
      },
      width: 120,
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
      title: '参考单价',
      dataIndex: 'unitPrice',
      resizable: true,
      sorter: true,
      width: 100,
    },
    {
      title: '安全库存阈值',
      dataIndex: 'safetyStockThreshold',
      resizable: true,
      width: 120,
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      resizable: true,
      width: 100,
    },
    {
      title: '生产厂家',
      dataIndex: 'manufacturer',
      resizable: true,
      width: 150,
    },
    {
      title: '材料图片',
      dataIndex: 'materialImage',
      resizable: true,
      width: 80,
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
      width: 100,
    },
  ]);

  const queryFormState = {
    materialCode: undefined,
    materialName: undefined,
    materialCategoryId: undefined,
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
      let queryResult = await materialApi.query(queryForm);
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

  function addMaterial(materialData) {
    formModal.value.showDrawer(materialData);
  }

  function showDetail(record) {
    formModal.value.showDrawer(record);
  }

  function deleteMaterial(materialData) {
    Modal.confirm({
      title: '提示',
      content: '确定要删除【' + materialData.materialName + '】吗?',
      okText: '删除',
      okType: 'danger',
      onOk() {
        singleDelete(materialData);
      },
      cancelText: '取消',
      onCancel() {},
    });
  }

  async function singleDelete(materialData) {
    try {
      SmartLoading.show();
      await materialApi.delete(materialData.materialId);
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
      content: '确定要删除选中材料吗?',
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
      await materialApi.batchDelete(selectedRowKeyList.value);
      message.success('删除成功');
      queryData();
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  }

  async function onUpdateDisabled(materialId, disabledFlag) {
    try {
      SmartLoading.show();
      await materialApi.updateDisabled(materialId, disabledFlag);
      message.success('更新成功');
      queryData();
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  }

  const importModalShowFlag = ref(false);
  const fileList = ref([]);

  function showImportModal() {
    fileList.value = [];
    importModalShowFlag.value = true;
  }

  function hideImportModal() {
    importModalShowFlag.value = false;
  }

  function handleRemove(file) {
    const index = fileList.value.indexOf(file);
    const newFileList = fileList.value.slice();
    newFileList.splice(index, 1);
    fileList.value = newFileList;
  }

  function beforeUpload(file) {
    fileList.value = [...(fileList.value || []), file];
    return false;
  }

  async function onDownloadTemplate() {
    await materialApi.downloadTemplate();
  }

  async function onImportMaterial() {
    const formData = new FormData();
    fileList.value.forEach((file) => {
      formData.append('file', file.originFileObj || file);
    });

    SmartLoading.show();
    try {
      let res = await materialApi.importMaterial(formData);
      message.success(res.msg);
      hideImportModal();
      queryData();
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  }

  async function onExportMaterial() {
    await materialApi.exportMaterial();
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
