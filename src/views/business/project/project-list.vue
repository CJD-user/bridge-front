<!--
  * 项目列表
  *
  * @Author:    1024创新实验室
  * @Date:      2024-01-01
  * @Copyright  1024创新实验室
-->
<template>
  <a-form class="smart-query-form">
    <a-row class="smart-query-form-row" v-privilege="'project:query'">
      <a-form-item label="项目编号" class="smart-query-form-item">
        <a-input style="width: 150px" v-model:value="queryForm.projectNo" placeholder="项目编号" />
      </a-form-item>

      <a-form-item label="项目名称" class="smart-query-form-item">
        <a-input style="width: 200px" v-model:value="queryForm.projectName" placeholder="项目名称" />
      </a-form-item>

      <a-form-item label="项目类型" class="smart-query-form-item">
        <a-select style="width: 120px" v-model:value="queryForm.projectType" placeholder="项目类型" allowClear>
          <a-select-option v-for="item in PROJECT_TYPE_ENUM" :key="item.value" :value="item.value">
            {{ item.desc }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="项目状态" class="smart-query-form-item">
        <a-select style="width: 120px" v-model:value="queryForm.projectStatus" placeholder="项目状态" allowClear>
          <a-select-option v-for="item in PROJECT_STATUS_ENUM" :key="item.value" :value="item.value">
            {{ item.desc }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item class="smart-query-form-item">
        <a-button-group>
          <a-button type="primary" @click="onSearch" v-privilege="'project:query'">
            <template #icon>
              <SearchOutlined />
            </template>
            查询
          </a-button>
          <a-button @click="resetQuery" v-privilege="'project:query'">
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
        <a-button @click="addProject" type="primary" v-privilege="'project:add'">
          <template #icon>
            <PlusOutlined />
          </template>
          新建
        </a-button>
      </div>
    </a-row>

    <a-table
      size="small"
      :dataSource="tableData"
      :columns="columns"
      rowKey="projectId"
      :scroll="{ x: 1800 }"
      bordered
      :pagination="false"
    >
      <template #bodyCell="{ text, record, column }">
        <template v-if="column.dataIndex === 'projectNo'">
          <a @click="showDetail(record)">{{ text }}</a>
        </template>
        <template v-if="column.dataIndex === 'projectType'">
          <span>{{ getProjectTypeDesc(text) }}</span>
        </template>
        <template v-if="column.dataIndex === 'projectStatus'">
          <a-tag :color="getProjectStatusColor(text)">{{ getProjectStatusDesc(text) }}</a-tag>
        </template>
        <template v-if="column.dataIndex === 'budgetAmount' || column.dataIndex === 'contractAmount'">
          <span>{{ text ? '¥' + Number(text).toLocaleString() : '-' }}</span>
        </template>
        <template v-if="column.dataIndex === 'action'">
          <div class="smart-table-operate">
            <a-button @click="editProject(record)" type="link" v-privilege="'project:update'">编辑</a-button>
            <a-button @click="showOutboundMaterials(record)" type="link">查看消耗材料</a-button>
            <a-button @click="deleteProject(record)" danger type="link" v-privilege="'project:delete'">删除</a-button>
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

    <ProjectFormModal ref="formModal" @reloadList="queryData" />
    <ProjectOutboundMaterialsModal ref="outboundMaterialsModal" />
  </a-card>
</template>
<script setup>
  import ProjectFormModal from './components/project-form-modal.vue';
  import ProjectOutboundMaterialsModal from './components/project-outbound-materials-modal.vue';
  import { onMounted, reactive, ref } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { projectApi } from '/@/api/business/project/project-api';
  import { PAGE_SIZE_OPTIONS } from '/@/constants/common-const';
  import { smartSentry } from '/@/lib/smart-sentry';
  import { PROJECT_TYPE_ENUM, PROJECT_STATUS_ENUM } from '/@/constants/business/project/project-const';
  import _ from 'lodash';

  const columns = ref([
    {
      title: '项目编号',
      dataIndex: 'projectNo',
      width: 120,
    },
    {
      title: '项目名称',
      dataIndex: 'projectName',
      width: 180,
    },
    {
      title: '项目类型',
      dataIndex: 'projectType',
      width: 100,
    },
    {
      title: '项目状态',
      dataIndex: 'projectStatus',
      width: 100,
    },
    {
      title: '项目经理',
      dataIndex: 'managerName',
      width: 100,
    },
    {
      title: '联系电话',
      dataIndex: 'managerPhone',
      width: 120,
    },
    {
      title: '预算金额',
      dataIndex: 'budgetAmount',
      width: 120,
    },
    {
      title: '合同金额',
      dataIndex: 'contractAmount',
      width: 120,
    },
    {
      title: '计划开始日期',
      dataIndex: 'startDate',
      width: 120,
    },
    {
      title: '计划结束日期',
      dataIndex: 'endDate',
      width: 120,
    },
    {
      title: '委托单位',
      dataIndex: 'clientName',
      width: 150,
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
      width: 180,
    },
  ]);

  const queryFormState = {
    projectNo: undefined,
    projectName: undefined,
    projectType: undefined,
    projectStatus: undefined,
    pageNum: 1,
    pageSize: 10,
  };
  const queryForm = reactive(_.cloneDeep(queryFormState));
  const tableData = ref([]);
  const total = ref(0);

  function getProjectTypeDesc(value) {
    for (const key in PROJECT_TYPE_ENUM) {
      if (PROJECT_TYPE_ENUM[key].value === value) {
        return PROJECT_TYPE_ENUM[key].desc;
      }
    }
    return '';
  }

  function getProjectStatusColor(value) {
    for (const key in PROJECT_STATUS_ENUM) {
      if (PROJECT_STATUS_ENUM[key].value === value) {
        return PROJECT_STATUS_ENUM[key].color;
      }
    }
    return 'default';
  }

  function getProjectStatusDesc(value) {
    for (const key in PROJECT_STATUS_ENUM) {
      if (PROJECT_STATUS_ENUM[key].value === value) {
        return PROJECT_STATUS_ENUM[key].desc;
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
    try {
      let queryResult = await projectApi.query(queryForm);
      tableData.value = queryResult.data.list;
      total.value = queryResult.data.total;
    } catch (e) {
      smartSentry.captureError(e);
    }
  }

  onMounted(queryData);

  const formModal = ref();
  const outboundMaterialsModal = ref();

  function addProject() {
    formModal.value.showDrawer();
  }

  function editProject(record) {
    formModal.value.showDrawer(record);
  }

  function showDetail(record) {
    formModal.value.showDrawer(record);
  }

  function showOutboundMaterials(record) {
    outboundMaterialsModal.value.show(record);
  }

  function deleteProject(record) {
    Modal.confirm({
      title: '提示',
      content: '确定要删除【' + record.projectName + '】吗?',
      okText: '删除',
      okType: 'danger',
      onOk() {
        doDelete(record.projectId);
      },
      cancelText: '取消',
    });
  }

  async function doDelete(projectId) {
    try {
      SmartLoading.show();
      await projectApi.delete(projectId);
      message.success('删除成功');
      queryData();
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  }
</script>
