<!--
  * 入库记录表单
  *
  * @Author:    1024创新实验室
  * @Date:      2024-01-01
  * @Copyright  1024创新实验室
-->
<template>
  <a-drawer title="新增入库记录" :width="600" :open="visible" :body-style="{ paddingBottom: '80px' }" @close="onClose">
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
      <a-form-item label="材料" name="materialId">
        <MaterialSelect v-model:value="form.materialId" @change="onMaterialChange" placeholder="请选择材料" />
      </a-form-item>
      <a-form-item label="批次号" name="batchNo">
        <a-input v-model:value="form.batchNo" placeholder="请输入批次号" />
      </a-form-item>
      <a-form-item label="入库数量" name="quantity">
        <a-input-number v-model:value="form.quantity" :min="1" :precision="2" style="width: 100%" placeholder="请输入入库数量" @change="calcAmount" />
      </a-form-item>
      <a-form-item label="单价" name="unitPrice">
        <a-input-number v-model:value="form.unitPrice" :min="0" :precision="2" style="width: 100%" placeholder="请输入单价" @change="calcAmount" />
      </a-form-item>
      <a-form-item label="总价" name="totalPrice">
        <a-input-number v-model:value="form.totalPrice" :min="0" :precision="2" style="width: 100%" placeholder="自动计算" :disabled="true" />
      </a-form-item>
      <a-form-item label="入库类型" name="inboundType">
        <a-select v-model:value="form.inboundType" placeholder="请选择入库类型">
          <a-select-option v-for="item in INBOUND_TYPE_ENUM" :key="item.value" :value="item.value">
            {{ item.desc }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="存放位置" name="storageLocation">
        <a-input v-model:value="form.storageLocation" placeholder="请输入存放位置" />
      </a-form-item>
      <a-form-item label="备注" name="remark">
        <a-textarea v-model:value="form.remark" placeholder="请输入备注" :rows="3" />
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
      <a-button type="primary" @click="onSubmit">确定</a-button>
    </div>
  </a-drawer>
</template>
<script setup>
  import { ref, nextTick, reactive } from 'vue';
  import { message } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import _ from 'lodash';
  import { inboundRecordApi } from '/@/api/business/inbound/inbound-record-api';
  import { smartSentry } from '/@/lib/smart-sentry';
  import { INBOUND_TYPE_ENUM } from '/@/constants/business/inbound/inbound-const';
  import MaterialSelect from '/@/components/business/material-select/index.vue';

  const emit = defineEmits(['reloadList']);

  const formRef = ref();

  const formDefault = {
    materialId: undefined,
    materialCode: '',
    materialName: '',
    specificationModel: '',
    unit: '',
    batchNo: '',
    quantity: 1,
    unitPrice: null,
    totalPrice: null,
    inboundType: 1,
    storageLocation: '',
    remark: '',
  };

  let form = reactive({ ...formDefault });

  const rules = {
    materialId: [{ required: true, message: '请选择材料' }],
    quantity: [{ required: true, message: '请输入入库数量' }],
    inboundType: [{ required: true, message: '请选择入库类型' }],
  };

  const visible = ref(false);

  function showDrawer() {
    Object.assign(form, _.cloneDeep(formDefault));
    visible.value = true;
    nextTick(() => {
      formRef.value.clearValidate();
    });
  }

  function onClose() {
    Object.assign(form, _.cloneDeep(formDefault));
    visible.value = false;
  }

  function onMaterialChange(materialId, materialInfo) {
    if (materialInfo) {
      form.materialCode = materialInfo.materialCode;
      form.materialName = materialInfo.materialName;
      form.specificationModel = materialInfo.specificationModel;
      form.unit = materialInfo.unit;
      form.unitPrice = materialInfo.unitPrice;
      calcAmount();
    }
  }

  function calcAmount() {
    const qty = Number(form.quantity) || 0;
    const price = Number(form.unitPrice) || 0;
    form.totalPrice = (qty * price).toFixed(2);
  }

  function onSubmit() {
    formRef.value
      .validate()
      .then(async () => {
        SmartLoading.show();
        try {
          await inboundRecordApi.add(form);
          message.success('入库成功');
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
