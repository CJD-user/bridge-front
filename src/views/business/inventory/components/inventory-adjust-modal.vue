<!--
  * 库存调整
  *
  * @Author:    1024创新实验室
  * @Date:      2024-01-01
  * @Copyright  1024创新实验室
-->
<template>
  <a-modal :open="visible" title="库存调整" :width="500" @ok="onSubmit" @cancel="onClose">
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
      <a-form-item label="材料名称">
        <span>{{ form.materialName }}</span>
      </a-form-item>
      <a-form-item label="批次号">
        <span>{{ form.batchNo }}</span>
      </a-form-item>
      <a-form-item label="当前库存">
        <span>{{ form.quantity }}</span>
      </a-form-item>
      <a-form-item label="调整类型" name="adjustType">
        <a-radio-group v-model:value="form.adjustType">
          <a-radio :value="1">入库</a-radio>
          <a-radio :value="2">出库</a-radio>
          <a-radio :value="3">盘点</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="调整数量" name="adjustQuantity">
        <a-input-number style="width: 100%" v-model:value="form.adjustQuantity" placeholder="请输入调整数量" :min="0" :precision="2" />
      </a-form-item>
      <a-form-item label="调整后库存">
        <span :style="{ color: afterQuantity < 0 ? 'red' : '' }">{{ afterQuantity }}</span>
      </a-form-item>
      <a-form-item label="备注" name="remark">
        <a-textarea v-model:value="form.remark" placeholder="请输入备注" :rows="3" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script setup>
  import { ref, nextTick, reactive, computed } from 'vue';
  import { message } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import _ from 'lodash';
  import { inventoryApi } from '/@/api/business/inventory/inventory-api';
  import { smartSentry } from '/@/lib/smart-sentry';

  const emit = defineEmits(['reloadList']);

  const formRef = ref();

  const formDefault = {
    inventoryId: undefined,
    materialName: undefined,
    batchNo: undefined,
    quantity: 0,
    adjustType: 1,
    adjustQuantity: 0,
    remark: undefined,
  };

  let form = reactive({ ...formDefault });

  const afterQuantity = computed(() => {
    const currentQty = Number(form.quantity) || 0;
    const adjustQty = Number(form.adjustQuantity) || 0;
    if (form.adjustType === 1) {
      return currentQty + adjustQty;
    } else if (form.adjustType === 2) {
      return currentQty - adjustQty;
    } else {
      return adjustQty;
    }
  });

  const rules = {
    adjustType: [{ required: true, message: '请选择调整类型' }],
    adjustQuantity: [{ required: true, message: '请输入调整数量' }],
  };

  const visible = ref(false);

  function showDrawer(rowData) {
    Object.assign(form, formDefault);
    if (rowData && !_.isEmpty(rowData)) {
      form.inventoryId = rowData.inventoryId;
      form.materialName = rowData.materialName;
      form.batchNo = rowData.batchNo;
      form.quantity = Number(rowData.quantity) || 0;
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

  function onSubmit() {
    formRef.value
      .validate()
      .then(async () => {
        if (form.adjustType === 2 && afterQuantity.value < 0) {
          message.error('出库数量不能大于当前库存');
          return;
        }
        SmartLoading.show();
        try {
          let params = {
            inventoryId: form.inventoryId,
            adjustType: form.adjustType,
            adjustQuantity: form.adjustQuantity,
            remark: form.remark,
          };
          await inventoryApi.adjust(params);
          message.success('调整成功');
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
