<!--
  * 库存表单
  *
  * @Author:    1024创新实验室
  * @Date:      2024-01-01
  * @Copyright  1024创新实验室
-->
<template>
  <a-drawer :title="form.inventoryId ? '编辑库存' : '添加库存'" :width="600" :open="visible" :body-style="{ paddingBottom: '80px' }" @close="onClose">
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
      <a-form-item label="材料" name="materialId">
        <MaterialSelect v-model:value="form.materialId" @change="onMaterialChange" :disabled="!!form.inventoryId" />
      </a-form-item>
      <a-form-item label="批次号" name="batchNo">
        <a-input v-model:value="form.batchNo" placeholder="请输入批次号" :disabled="!!form.inventoryId" />
      </a-form-item>
      <a-form-item label="库存数量" name="quantity">
        <a-input-number style="width: 100%" v-model:value="form.quantity" placeholder="请输入库存数量" :min="0" :precision="2" />
      </a-form-item>
      <a-form-item label="单价" name="unitPrice">
        <a-input-number style="width: 100%" v-model:value="form.unitPrice" placeholder="请输入单价" :min="0" :precision="2" />
      </a-form-item>
      <a-form-item label="生产日期" name="productionDate">
        <a-date-picker v-model:value="form.productionDate" style="width: 100%" />
      </a-form-item>
      <a-form-item label="有效期至" name="expirationDate">
        <a-date-picker v-model:value="form.expirationDate" style="width: 100%" />
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
      <a-button type="primary" @click="onSubmit">提交</a-button>
    </div>
  </a-drawer>
</template>
<script setup>
  import { ref, nextTick, reactive } from 'vue';
  import { message } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import _ from 'lodash';
  import dayjs from 'dayjs';
  import { inventoryApi } from '/@/api/business/inventory/inventory-api';
  import { smartSentry } from '/@/lib/smart-sentry';
  import MaterialSelect from '/@/components/business/material-select/index.vue';

  const emit = defineEmits(['reloadList']);

  const formRef = ref();

  const formDefault = {
    inventoryId: undefined,
    materialId: undefined,
    materialCode: undefined,
    materialName: undefined,
    specificationModel: undefined,
    unit: undefined,
    batchNo: undefined,
    quantity: 0,
    unitPrice: undefined,
    productionDate: undefined,
    expirationDate: undefined,
    storageLocation: undefined,
    remark: undefined,
  };

  let form = reactive({ ...formDefault });

  const rules = {
    materialId: [{ required: true, message: '请选择材料' }],
    batchNo: [{ required: true, message: '请输入批次号' }],
    quantity: [{ required: true, message: '请输入库存数量' }],
  };

  const visible = ref(false);

  function showDrawer(rowData) {
    Object.assign(form, formDefault);
    if (rowData && !_.isEmpty(rowData)) {
      Object.assign(form, rowData);
      if (form.productionDate) {
        form.productionDate = dayjs(form.productionDate);
      }
      if (form.expirationDate) {
        form.expirationDate = dayjs(form.expirationDate);
      }
      form.quantity = Number(form.quantity) || 0;
      form.unitPrice = Number(form.unitPrice) || undefined;
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

  function onMaterialChange(materialId, materialInfo) {
    if (materialInfo) {
      form.materialCode = materialInfo.materialCode;
      form.materialName = materialInfo.materialName;
      form.specificationModel = materialInfo.specificationModel;
      form.unit = materialInfo.unit;
    }
  }

  function onSubmit() {
    formRef.value
      .validate()
      .then(async () => {
        SmartLoading.show();
        try {
          let params = { ...form };
          if (form.productionDate) {
            params.productionDate = dayjs(form.productionDate).format('YYYY-MM-DD');
          }
          if (form.expirationDate) {
            params.expirationDate = dayjs(form.expirationDate).format('YYYY-MM-DD');
          }
          if (form.inventoryId) {
            await inventoryApi.update(params);
          } else {
            await inventoryApi.add(params);
          }
          message.success(`${form.inventoryId ? '修改' : '添加'}成功`);
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
