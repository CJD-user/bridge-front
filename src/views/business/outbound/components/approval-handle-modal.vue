<!--
  * 审批处理
  *
  * @Author:    1024创新实验室
  * @Date:      2024-01-01
  * @Copyright  1024创新实验室
-->
<template>
  <a-modal title="审批处理" :width="500" :open="visible" @ok="onSubmit" @cancel="onClose">
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
      <a-form-item label="出库单号">
        <span>{{ orderInfo.outboundOrderNo }}</span>
      </a-form-item>
      <a-form-item label="申请人">
        <span>{{ orderInfo.createUserName }}</span>
      </a-form-item>
      <a-form-item label="项目名称">
        <span>{{ orderInfo.projectName || '-' }}</span>
      </a-form-item>
      <a-form-item label="出库类型">
        <span>{{ getOutboundTypeDesc(orderInfo.outboundType) }}</span>
      </a-form-item>
      <a-form-item label="领用人">
        <span>{{ orderInfo.receiverName || '-' }}</span>
      </a-form-item>
      <a-form-item label="审批结果" name="approvalStatus">
        <a-radio-group v-model:value="form.approvalStatus">
          <a-radio :value="1">通过</a-radio>
          <a-radio :value="2">打回</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="审批意见" name="approvalOpinion">
        <a-textarea v-model:value="form.approvalOpinion" placeholder="请输入审批意见" :rows="3" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script setup>
  import { ref, nextTick, reactive } from 'vue';
  import { message } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import _ from 'lodash';
  import { outboundOrderApi } from '/@/api/business/outbound/outbound-order-api';
  import { smartSentry } from '/@/lib/smart-sentry';
  import { OUTBOUND_TYPE_ENUM } from '/@/constants/business/outbound/outbound-const';

  const emit = defineEmits(['reloadList']);

  const formRef = ref();

  const formDefault = {
    businessType: 2,
    businessId: undefined,
    approvalStatus: 1,
    approvalOpinion: '',
    attachment: '',
  };

  let form = reactive({ ...formDefault });
  const orderInfo = ref({});

  const rules = {
    approvalStatus: [{ required: true, message: '请选择审批结果' }],
  };

  const visible = ref(false);

  function getOutboundTypeDesc(value) {
    for (const key in OUTBOUND_TYPE_ENUM) {
      if (OUTBOUND_TYPE_ENUM[key].value === value) {
        return OUTBOUND_TYPE_ENUM[key].desc;
      }
    }
    return '';
  }

  function show(record) {
    Object.assign(form, _.cloneDeep(formDefault));
    orderInfo.value = {
      outboundOrderNo: record.outboundOrderNo,
      createUserName: record.createUserName,
      projectName: record.projectName,
      outboundType: record.outboundType,
      receiverName: record.receiverName,
    };
    form.businessId = record.outboundOrderId;
    visible.value = true;
    nextTick(() => {
      formRef.value.clearValidate();
    });
  }

  function onClose() {
    Object.assign(form, _.cloneDeep(formDefault));
    visible.value = false;
  }

  function onSubmit() {
    formRef.value
      .validate()
      .then(async () => {
        SmartLoading.show();
        try {
          await outboundOrderApi.approval(form);
          message.success('审批成功');
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
    show,
  });
</script>
