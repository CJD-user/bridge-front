<!--
  * 库存预警处理
-->
<template>
  <a-modal title="处理库存预警" :width="500" :open="visible" @ok="onSubmit" @cancel="onClose">
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
      <a-form-item label="材料名称">
        <span>{{ warningInfo.materialName }}</span>
      </a-form-item>
      <a-form-item label="当前数量">
        <span>{{ warningInfo.currentQuantity }}</span>
      </a-form-item>
      <a-form-item label="阈值数量">
        <span>{{ warningInfo.thresholdQuantity }}</span>
      </a-form-item>
      <a-form-item label="预警内容">
        <span>{{ warningInfo.warningContent }}</span>
      </a-form-item>
      <a-form-item label="处理方式" name="handleStatus">
        <a-radio-group v-model:value="form.handleStatus">
          <a-radio :value="1">已处理</a-radio>
          <a-radio :value="2">已忽略</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="处理备注" name="handleRemark">
        <a-textarea v-model:value="form.handleRemark" placeholder="请输入处理备注" :rows="3" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script setup>
  import { ref, nextTick, reactive } from 'vue';
  import { message } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import _ from 'lodash';
  import { inventoryWarningApi } from '/@/api/business/inventory-warning/inventory-warning-api';
  import { smartSentry } from '/@/lib/smart-sentry';

  const emit = defineEmits(['reloadList']);

  const formRef = ref();

  const formDefault = {
    warningId: undefined,
    handleStatus: 1,
    handleRemark: '',
  };

  let form = reactive({ ...formDefault });
  const warningInfo = ref({});

  const rules = {
    handleStatus: [{ required: true, message: '请选择处理方式' }],
  };

  const visible = ref(false);

  function show(record) {
    Object.assign(form, _.cloneDeep(formDefault));
    warningInfo.value = {
      materialName: record.materialName,
      currentQuantity: record.currentQuantity,
      thresholdQuantity: record.thresholdQuantity,
      warningContent: record.warningContent,
    };
    form.warningId = record.warningId;
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
          await inventoryWarningApi.handle(form);
          message.success('处理成功');
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
