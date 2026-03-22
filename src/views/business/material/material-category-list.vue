<!--
  * 材料分类列表
  *
  * @Author:    1024创新实验室
  * @Date:      2024-01-01
  * @Copyright  1024创新实验室
-->
<template>
  <a-card size="small" :bordered="false" :hoverable="true">
    <a-row class="smart-table-btn-block">
      <div class="smart-table-operate-block">
        <a-button @click="addCategory()" type="primary" v-privilege="'materialCategory:add'">
          <template #icon>
            <PlusOutlined />
          </template>
          新建
        </a-button>
      </div>
      <div class="smart-table-setting-block"></div>
    </a-row>

    <a-table
      :scroll="{ x: 1000 }"
      size="small"
      :dataSource="tableData"
      :columns="columns"
      rowKey="materialCategoryId"
      bordered
      :pagination="false"
      @expandedRowsChange="changeExpand"
      :expanded-row-keys="expandedRowKeys"
    >
      <template #bodyCell="{ record, column }">
        <template v-if="column.dataIndex === 'disabledFlag'">
          <a-switch
            v-model:checked="record.disabledFlag"
            :checkedValue="true"
            :unCheckedValue="false"
            @change="(checked) => onUpdateDisabled(record.materialCategoryId, checked)"
            v-privilege="'materialCategory:update'"
          />
        </template>
        <template v-if="column.dataIndex === 'action'">
          <div class="smart-table-operate">
            <a-button @click="addCategory(record.materialCategoryId)" type="link" v-privilege="'materialCategory:add'">增加子分类</a-button>
            <a-button @click="addCategory(undefined, record)" type="link" v-privilege="'materialCategory:update'">编辑</a-button>
            <a-button @click="confirmDeleteCategory(record.materialCategoryId)" danger type="link" v-privilege="'materialCategory:delete'"
              >删除</a-button
            >
          </div>
        </template>
      </template>
    </a-table>
    <MaterialCategoryFormModal ref="formModal" @reloadList="reloadList" />
  </a-card>
</template>
<script setup>
  import { onMounted, ref } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import MaterialCategoryFormModal from './components/material-category-form-modal.vue';
  import { materialCategoryApi } from '/@/api/business/material/material-category-api';
  import { smartSentry } from '/@/lib/smart-sentry';

  const tableLoading = ref(false);
  const tableData = ref([]);
  const columns = ref([
    {
      title: '分类名称',
      dataIndex: 'categoryName',
    },
    {
      title: '分类编码',
      dataIndex: 'categoryCode',
      width: 150,
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 80,
    },
    {
      title: '禁用状态',
      dataIndex: 'disabledFlag',
      width: 100,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 200,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 150,
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 200,
    },
  ]);

  async function queryList() {
    try {
      tableLoading.value = true;
      let responseModel = await materialCategoryApi.queryTree({});
      tableData.value = responseModel.data;
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      tableLoading.value = false;
    }
  }

  const expandedRowKeys = ref([]);
  function reloadList(parentId) {
    queryList();
    if (parentId) {
      expandedRowKeys.value.push(parentId);
    }
  }

  onMounted(queryList);

  function changeExpand(val) {
    expandedRowKeys.value = val;
  }

  const formModal = ref();
  function addCategory(parentId, rowData) {
    formModal.value.showModal(parentId, rowData);
  }

  function confirmDeleteCategory(materialCategoryId) {
    Modal.confirm({
      title: '提示',
      content: '确定要删除当前分类吗?',
      okText: '确定',
      okType: 'danger',
      async onOk() {
        deleteCategory(materialCategoryId);
      },
      cancelText: '取消',
      onCancel() {},
    });
  }

  async function deleteCategory(materialCategoryId) {
    try {
      SmartLoading.show();
      await materialCategoryApi.delete(materialCategoryId);
      message.success('删除成功');
      queryList();
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  }

  async function onUpdateDisabled(materialCategoryId, disabledFlag) {
    try {
      SmartLoading.show();
      await materialCategoryApi.updateDisabled(materialCategoryId, disabledFlag);
      message.success('更新成功');
      queryList();
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  }
</script>
