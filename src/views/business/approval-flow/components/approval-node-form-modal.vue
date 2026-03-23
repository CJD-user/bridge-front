<!--
  * 审批节点表单
  *
  * @Author:    1024创新实验室
  * @Date:      2024-01-01
  * @Copyright  1024创新实验室
-->
<template>
  <a-modal :title="form.approvalNodeId ? '编辑节点' : '添加节点'" :width="500" :open="visible" @ok="onSubmit" @cancel="onClose">
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
      <a-form-item label="节点名称" name="nodeName">
        <a-input v-model:value="form.nodeName" placeholder="请输入节点名称" />
      </a-form-item>
      <a-form-item label="节点编码" name="nodeCode">
        <a-input v-model:value="form.nodeCode" placeholder="请输入节点编码" />
      </a-form-item>
      <a-form-item label="节点顺序" name="nodeOrder">
        <a-input-number style="width: 100%" v-model:value="form.nodeOrder" placeholder="节点顺序" :min="1" :max="3" />
      </a-form-item>
      <a-form-item label="审批人类型" name="approverType">
        <a-select v-model:value="form.approverType" placeholder="请选择审批人类型" @change="onApproverTypeChange">
          <a-select-option v-for="item in APPROVER_TYPE_ENUM" :key="item.value" :value="item.value">
            {{ item.desc }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="选择角色" name="roleId" v-if="form.approverType === 3">
        <RoleSelect v-model:value="form.roleId" @change="onRoleChange" />
      </a-form-item>
      <a-form-item label="备注" name="remark">
        <a-textarea v-model:value="form.remark" placeholder="请输入备注" :rows="2" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script setup>
  import { ref, nextTick, reactive } from 'vue';
  import { message } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import _ from 'lodash';
  import { approvalNodeApi } from '/@/api/business/approval-flow/approval-flow-api';
  import { smartSentry } from '/@/lib/smart-sentry';
  import { APPROVER_TYPE_ENUM } from '/@/constants/business/approval-flow/approval-flow-const';
  import RoleSelect from '/@/components/business/role-select/index.vue';

  const emit = defineEmits(['reloadList']);

  const formRef = ref();

  const formDefault = {
    approvalNodeId: undefined,
    approvalFlowId: undefined,
    nodeName: undefined,
    nodeCode: undefined,
    nodeOrder: 1,
    approverType: 3,
    approverIds: undefined,
    approverNames: undefined,
    roleId: undefined,
    remark: undefined,
  };

  let form = reactive({ ...formDefault });

  const rules = {
    nodeName: [{ required: true, message: '节点名称不能为空' }],
    nodeOrder: [{ required: true, message: '节点顺序不能为空' }],
    approverType: [{ required: true, message: '请选择审批人类型' }],
  };

  const visible = ref(false);

  function showDrawer(rowData) {
    Object.assign(form, formDefault);
    if (rowData && !_.isEmpty(rowData)) {
      Object.assign(form, rowData);
    }
    visible.value = true;
    nextTick(() => {
      formRef.value.clearValidate();
    });
  }

  function onClose() {
    Object.assign(form, formDefault);
    visible.value = false;
  }

  function onApproverTypeChange() {
    form.approverIds = undefined;
    form.approverNames = undefined;
    form.roleId = undefined;
  }

  function onRoleChange(roleId, roleInfo) {
    if (roleInfo) {
      form.approverIds = roleId;
      form.approverNames = roleInfo.roleName;
    }
  }

  function onSubmit() {
    formRef.value
      .validate()
      .then(async () => {
        SmartLoading.show();
        try {
          if (form.approvalNodeId) {
            await approvalNodeApi.update(form);
          } else {
            await approvalNodeApi.add(form);
          }
          message.success(`${form.approvalNodeId ? '修改' : '添加'}成功`);
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
