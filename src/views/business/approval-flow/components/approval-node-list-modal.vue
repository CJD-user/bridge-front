<!--
  * 审批节点管理
  *
  * @Author:    1024创新实验室
  * @Date:      2024-01-01
  * @Copyright  1024创新实验室
-->
<template>
  <a-drawer title="审批节点管理" :width="700" :open="visible" :body-style="{ paddingBottom: '80px' }" @close="onClose">
    <div style="margin-bottom: 16px">
      <a-button type="primary" @click="addNode" :disabled="nodeList.length >= 3">
        <template #icon>
          <PlusOutlined />
        </template>
        添加节点 (最多3个)
      </a-button>
      <span style="margin-left: 8px; color: #999">当前节点数: {{ nodeList.length }}/3</span>
    </div>

    <a-table
      :dataSource="nodeList"
      :columns="columns"
      rowKey="approvalNodeId"
      bordered
      :pagination="false"
      size="small"
    >
      <template #bodyCell="{ text, record, column }">
        <template v-if="column.dataIndex === 'nodeOrder'">
          <a-tag color="blue">第{{ text }}节点</a-tag>
        </template>
        <template v-if="column.dataIndex === 'approverType'">
          <span>{{ getApproverTypeDesc(text) }}</span>
        </template>
        <template v-if="column.dataIndex === 'approverNames'">
          <span>{{ text || '-' }}</span>
        </template>
        <template v-if="column.dataIndex === 'action'">
          <div class="smart-table-operate">
            <a-button @click="editNode(record)" type="link">编辑</a-button>
            <a-button @click="deleteNode(record)" danger type="link" :disabled="nodeList.length <= 1">删除</a-button>
          </div>
        </template>
      </template>
    </a-table>

    <ApprovalNodeFormModal ref="nodeFormModal" @reloadList="queryNodeList" />

    <div
      :style="{
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: '100%',
        borderTop: '1px solid #e9e9e9',
        padding: '10px 16px',
        background: '#fff',
        textAlign: 'right',
        zIndex: 1,
      }"
    >
      <a-button style="margin-right: 8px" @click="onClose">关闭</a-button>
    </div>
  </a-drawer>
</template>
<script setup>
  import { ref, onMounted } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import { approvalNodeApi } from '/@/api/business/approval-flow/approval-flow-api';
  import { smartSentry } from '/@/lib/smart-sentry';
  import { APPROVER_TYPE_ENUM } from '/@/constants/business/approval-flow/approval-flow-const';
  import ApprovalNodeFormModal from './approval-node-form-modal.vue';

  const columns = ref([
    {
      title: '节点顺序',
      dataIndex: 'nodeOrder',
      width: 100,
    },
    {
      title: '节点名称',
      dataIndex: 'nodeName',
      width: 120,
    },
    {
      title: '审批人类型',
      dataIndex: 'approverType',
      width: 120,
    },
    {
      title: '审批人',
      dataIndex: 'approverNames',
      width: 200,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 150,
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 100,
    },
  ]);

  const visible = ref(false);
  const nodeList = ref([]);
  const approvalFlowId = ref();
  const nodeFormModal = ref();

  function getApproverTypeDesc(value) {
    for (const key in APPROVER_TYPE_ENUM) {
      if (APPROVER_TYPE_ENUM[key].value === value) {
        return APPROVER_TYPE_ENUM[key].desc;
      }
    }
    return '';
  }

  async function queryNodeList() {
    if (!approvalFlowId.value) return;
    try {
      SmartLoading.show();
      const resp = await approvalNodeApi.listByFlowId(approvalFlowId.value);
      nodeList.value = resp.data || [];
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  }

  function show(flowId) {
    approvalFlowId.value = flowId;
    visible.value = true;
    queryNodeList();
  }

  function onClose() {
    visible.value = false;
    nodeList.value = [];
  }

  function addNode() {
    if (nodeList.value.length >= 3) {
      message.warning('审批节点最多只能有3个');
      return;
    }
    const nextOrder = nodeList.value.length > 0 ? Math.max(...nodeList.value.map(n => n.nodeOrder)) + 1 : 1;
    nodeFormModal.value.showDrawer({
      approvalFlowId: approvalFlowId.value,
      nodeOrder: nextOrder,
    });
  }

  function editNode(record) {
    nodeFormModal.value.showDrawer(record);
  }

  function deleteNode(record) {
    if (nodeList.value.length <= 1) {
      message.warning('审批节点至少需要1个');
      return;
    }
    Modal.confirm({
      title: '提示',
      content: '确定要删除该审批节点吗?',
      okText: '删除',
      okType: 'danger',
      onOk() {
        doDeleteNode(record.approvalNodeId);
      },
      cancelText: '取消',
      onCancel() {},
    });
  }

  async function doDeleteNode(nodeId) {
    try {
      SmartLoading.show();
      await approvalNodeApi.delete(nodeId);
      message.success('删除成功');
      queryNodeList();
    } catch (e) {
      smartSentry.captureError(e);
    } finally {
      SmartLoading.hide();
    }
  }

  defineExpose({
    show,
  });
</script>
