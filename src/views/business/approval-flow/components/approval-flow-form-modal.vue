<!--
  * 审批流程表单
  *
  * @Author:    1024创新实验室
  * @Date:      2024-01-01
  * @Copyright  1024创新实验室
-->
<template>
  <a-drawer :title="form.approvalFlowId ? '编辑' : '添加'" :width="700" :open="visible" :body-style="{ paddingBottom: '80px' }" @close="onClose">
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
      <a-form-item label="流程名称" name="flowName">
        <a-input v-model:value="form.flowName" placeholder="请输入流程名称" />
      </a-form-item>
      <a-form-item label="流程编码" name="flowCode">
        <a-input v-model:value="form.flowCode" placeholder="请输入流程编码" :disabled="!!form.approvalFlowId" />
      </a-form-item>
      <a-form-item label="业务类型" name="businessType">
        <a-select v-model:value="form.businessType" placeholder="请选择业务类型">
          <a-select-option v-for="item in BUSINESS_TYPE_ENUM" :key="item.value" :value="item.value">
            {{ item.desc }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="流程描述" name="description">
        <a-textarea v-model:value="form.description" placeholder="请输入流程描述" :rows="2" />
      </a-form-item>
      <a-form-item label="状态" name="status">
        <a-radio-group v-model:value="form.status">
          <a-radio :value="1">启用</a-radio>
          <a-radio :value="0">停用</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-divider>审批节点配置</a-divider>

      <a-form-item label="" :wrapper-col="{ span: 24 }">
        <div style="margin-bottom: 8px">
          <a-button type="primary" size="small" @click="addNode" :disabled="form.nodeList.length >= 3">
            <PlusOutlined /> 添加节点
          </a-button>
          <span style="margin-left: 8px; color: #999">节点数量: {{ form.nodeList.length }}/3 (至少1个)</span>
        </div>

        <a-table
          :dataSource="form.nodeList"
          :columns="nodeColumns"
          rowKey="key"
          bordered
          :pagination="false"
          size="small"
        >
          <template #bodyCell="{ text, record, column, index }">
            <template v-if="column.dataIndex === 'nodeOrder'">
              <a-tag color="blue">第{{ index + 1 }}节点</a-tag>
            </template>
            <template v-if="column.dataIndex === 'nodeName'">
              <a-input v-model:value="record.nodeName" placeholder="节点名称" size="small" />
            </template>
            <template v-if="column.dataIndex === 'approverType'">
              <a-select v-model:value="record.approverType" placeholder="审批人类型" size="small" style="width: 100%">
                <a-select-option v-for="item in APPROVER_TYPE_ENUM" :key="item.value" :value="item.value">
                  {{ item.desc }}
                </a-select-option>
              </a-select>
            </template>
            <template v-if="column.dataIndex === 'roleId'">
              <RoleSelect v-model:value="record.roleId" size="small" @change="(val, info) => onRoleChange(record, val, info)" />
            </template>
            <template v-if="column.dataIndex === 'action'">
              <a-button type="link" danger size="small" @click="removeNode(index)" :disabled="form.nodeList.length <= 1">
                删除
              </a-button>
            </template>
          </template>
        </a-table>
      </a-form-item>
    </a-form>
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
      <a-button style="margin-right: 8px" @click="onClose">取消</a-button>
      <a-button type="primary" @click="onSubmit">提交</a-button>
    </div>
  </a-drawer>
</template>
<script setup>
  import { ref, nextTick, reactive } from 'vue';
  import { message } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import _ from 'lodash';
  import { approvalFlowApi } from '/@/api/business/approval-flow/approval-flow-api';
  import { smartSentry } from '/@/lib/smart-sentry';
  import { BUSINESS_TYPE_ENUM, APPROVER_TYPE_ENUM } from '/@/constants/business/approval-flow/approval-flow-const';
  import RoleSelect from '/@/components/business/role-select/index.vue';

  const emit = defineEmits(['reloadList']);

  const formRef = ref();

  const nodeColumns = ref([
    {
      title: '顺序',
      dataIndex: 'nodeOrder',
      width: 80,
    },
    {
      title: '节点名称',
      dataIndex: 'nodeName',
      width: 150,
    },
    {
      title: '审批人类型',
      dataIndex: 'approverType',
      width: 150,
    },
    {
      title: '选择角色',
      dataIndex: 'roleId',
      width: 150,
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 80,
    },
  ]);

  const createEmptyNode = () => ({
    key: Date.now() + Math.random(),
    nodeName: '',
    nodeCode: '',
    nodeOrder: 1,
    approverType: 3,
    approverIds: '',
    approverNames: '',
    roleId: undefined,
    remark: '',
  });

  const formDefault = {
    approvalFlowId: undefined,
    flowName: undefined,
    flowCode: undefined,
    businessType: undefined,
    description: undefined,
    status: 1,
    nodeList: [createEmptyNode()],
  };

  let form = reactive({ ...formDefault });

  const rules = {
    flowName: [{ required: true, message: '流程名称不能为空' }],
    flowCode: [{ required: true, message: '流程编码不能为空' }],
    businessType: [{ required: true, message: '请选择业务类型' }],
  };

  const visible = ref(false);

  function showDrawer(rowData) {
    Object.assign(form, _.cloneDeep(formDefault));
    if (rowData && !_.isEmpty(rowData)) {
      Object.assign(form, rowData);
      if (rowData.nodeList && rowData.nodeList.length > 0) {
        form.nodeList = rowData.nodeList.map((n, idx) => ({
          ...n,
          key: Date.now() + idx,
        }));
      }
    }
    visible.value = true;
    nextTick(() => {
      formRef.value.clearValidate();
    });
  }

  function onClose() {
    Object.assign(form, _.cloneDeep(formDefault));
    visible.value = false;
  }

  function addNode() {
    if (form.nodeList.length >= 3) {
      message.warning('审批节点最多只能有3个');
      return;
    }
    const newNode = createEmptyNode();
    newNode.nodeOrder = form.nodeList.length + 1;
    form.nodeList.push(newNode);
  }

  function removeNode(index) {
    if (form.nodeList.length <= 1) {
      message.warning('审批节点至少需要1个');
      return;
    }
    form.nodeList.splice(index, 1);
    form.nodeList.forEach((node, idx) => {
      node.nodeOrder = idx + 1;
    });
  }

  function onRoleChange(record, roleId, roleInfo) {
    if (roleInfo) {
      record.approverIds = String(roleId);
      record.approverNames = roleInfo.roleName;
    }
  }

  function validateNodeList() {
    if (form.nodeList.length < 1 || form.nodeList.length > 3) {
      message.error('审批节点数量必须在1-3个之间');
      return false;
    }
    for (let i = 0; i < form.nodeList.length; i++) {
      const node = form.nodeList[i];
      if (!node.nodeName) {
        message.error(`第${i + 1}个节点的名称不能为空`);
        return false;
      }
      if (!node.approverType) {
        message.error(`第${i + 1}个节点的审批人类型不能为空`);
        return false;
      }
      if (node.approverType === 3 && !node.roleId) {
        message.error(`第${i + 1}个节点选择了角色审批，请选择角色`);
        return false;
      }
    }
    return true;
  }

  function onSubmit() {
    formRef.value
      .validate()
      .then(async () => {
        if (!validateNodeList()) {
          return;
        }

        SmartLoading.show();
        try {
          const submitData = {
            ...form,
            nodeList: form.nodeList.map((node, idx) => ({
              nodeName: node.nodeName,
              nodeCode: node.nodeCode || `NODE_${idx + 1}`,
              nodeOrder: idx + 1,
              approverType: node.approverType,
              approverIds: node.approverIds,
              approverNames: node.approverNames,
              roleId: node.roleId,
              remark: node.remark,
            })),
          };

          if (form.approvalFlowId) {
            await approvalFlowApi.update(submitData);
          } else {
            await approvalFlowApi.add(submitData);
          }
          message.success(`${form.approvalFlowId ? '修改' : '添加'}成功`);
          onClose();
          emit('reloadList');
        } catch (error) {
          smartSentry.captureError(error);
        } finally {
          SmartLoading.hide();
        }
      })
      .catch((error) => {
        console.log('error', error);
        message.error('参数验证错误，请仔细填写表单数据!');
      });
  }

  defineExpose({
    showDrawer,
  });
</script>
