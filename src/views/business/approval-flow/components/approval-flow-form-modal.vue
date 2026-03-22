<!--
  * 审批流程配置表
  *
  * @Author:    hyc
  * @Date:      2026-03-22 15:50:20
  * @Copyright  /
-->
<template>
  <a-drawer
      :title="form.approvalFlowId ? '编辑' : '添加'"
      width="500px"
      :open="visibleFlag"
      @close="onClose"
      :maskClosable="false"
      :destroyOnClose="true"
  >
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }" >
      <a-form-item label="审批流程ID"  name="approvalFlowId">
        <a-input-number style="width: 100%" v-model:value="form.approvalFlowId" placeholder="审批流程ID" />
      </a-form-item>
      <a-form-item label="流程名称"  name="flowName">
        <a-input style="width: 100%" v-model:value="form.flowName" placeholder="流程名称" />
      </a-form-item>
      <a-form-item label="流程编码"  name="flowCode">
        <a-input style="width: 100%" v-model:value="form.flowCode" placeholder="流程编码" />
      </a-form-item>
      <a-form-item label="业务类型: 1-采购申请 2-出库申请 3-供应商评价"  name="businessType">
        <a-input-number style="width: 100%" v-model:value="form.businessType" placeholder="业务类型: 1-采购申请 2-出库申请 3-供应商评价" />
      </a-form-item>
    </a-form>

    <template #footer>
      <a-space>
        <a-button @click="onClose">取消</a-button>
        <a-button type="primary" @click="onSubmit">保存</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>
<script setup lang="ts">
import { reactive, ref, nextTick } from 'vue';
import _ from 'lodash';
import { message } from 'ant-design-vue';
import { SmartLoading } from '/@/components/framework/smart-loading';
import { approvalFlowApi } from '/@/api/business/approval-flow/approval-flow-api';
import { smartSentry } from '/@/lib/smart-sentry';

// ------------------------ 事件 ------------------------

const emits = defineEmits(['reloadList']);

// ------------------------ 显示与隐藏 ------------------------
// 是否显示
const visibleFlag = ref(false);

function show(rowData) {
  Object.assign(form, formDefault);
  if (rowData && !_.isEmpty(rowData)) {
    Object.assign(form, rowData);
  }
  // 使用字典时把下面这注释修改成自己的字典字段 有多个字典字段就复制多份同理修改 不然打开表单时不显示字典初始值
  // if (form.status && form.status.length > 0) {
  //   form.status = form.status.map((e) => e.valueCode);
  // }
  visibleFlag.value = true;
  nextTick(() => {
    formRef.value.clearValidate();
  });
}

function onClose() {
  Object.assign(form, formDefault);
  visibleFlag.value = false;
}

// ------------------------ 表单 ------------------------

// 组件ref
const formRef = ref();

const formDefault = {
  approvalFlowId: undefined, //审批流程ID
  flowName: undefined, //流程名称
  flowCode: undefined, //流程编码
  businessType: undefined, //业务类型: 1-采购申请 2-出库申请 3-供应商评价
};

let form = reactive({ ...formDefault });

const rules = {
  approvalFlowId: [{ required: true, message: '审批流程ID 必填' }],
  flowName: [{ required: true, message: '流程名称 必填' }],
  flowCode: [{ required: true, message: '流程编码 必填' }],
  businessType: [{ required: true, message: '业务类型: 1-采购申请 2-出库申请 3-供应商评价 必填' }],
};

// 点击确定，验证表单
async function onSubmit() {
  try {
    await formRef.value.validateFields();
    save();
  } catch (err) {
    message.error('参数验证错误，请仔细填写表单数据!');
  }
}

// 新建、编辑API
async function save() {
  SmartLoading.show();
  try {
    if (form.approvalFlowId) {
      await approvalFlowApi.update(form);
    } else {
      await approvalFlowApi.add(form);
    }
    message.success('操作成功');
    emits('reloadList');
    onClose();
  } catch (err) {
    smartSentry.captureError(err);
  } finally {
    SmartLoading.hide();
  }
}

defineExpose({
  show,
});
</script>
