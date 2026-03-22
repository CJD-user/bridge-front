<!--
  * 材料表单
  *
  * @Author:    1024创新实验室
  * @Date:      2024-01-01
  * @Copyright  1024创新实验室
-->
<template>
  <a-drawer :title="form.materialId ? '编辑' : '添加'" :width="600" :open="visible" :body-style="{ paddingBottom: '80px' }" @close="onClose">
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }">
      <a-form-item label="材料编码" name="materialCode">
        <a-input v-model:value="form.materialCode" placeholder="请输入材料编码" />
      </a-form-item>
      <a-form-item label="材料名称" name="materialName">
        <a-input v-model:value="form.materialName" placeholder="请输入材料名称" />
      </a-form-item>
      <a-form-item label="材料分类" name="materialCategoryId">
        <MaterialCategoryTreeSelect v-model:value="form.materialCategoryId" placeholder="请选择材料分类" />
      </a-form-item>
      <a-form-item label="规格型号" name="specificationModel">
        <a-input v-model:value="form.specificationModel" placeholder="请输入规格型号" />
      </a-form-item>
      <a-form-item label="计量单位" name="unit">
        <a-input v-model:value="form.unit" placeholder="请输入计量单位" />
      </a-form-item>
      <a-form-item label="参考单价" name="unitPrice">
        <a-input-number style="width: 100%" placeholder="请输入参考单价" v-model:value="form.unitPrice" :min="0" :precision="2" />
      </a-form-item>
      <a-form-item label="安全库存阈值" name="safetyStockThreshold">
        <a-input-number style="width: 100%" placeholder="请输入安全库存阈值" v-model:value="form.safetyStockThreshold" :min="0" :precision="2" />
      </a-form-item>
      <a-form-item label="保质期(天)" name="shelfLifeDays">
        <a-input-number style="width: 100%" placeholder="请输入保质期天数" v-model:value="form.shelfLifeDays" :min="0" />
      </a-form-item>
      <a-form-item label="品牌" name="brand">
        <a-input v-model:value="form.brand" placeholder="请输入品牌" />
      </a-form-item>
      <a-form-item label="生产厂家" name="manufacturer">
        <a-input v-model:value="form.manufacturer" placeholder="请输入生产厂家" />
      </a-form-item>
      <a-form-item label="材料图片" name="materialImage">
        <a-input v-model:value="form.materialImage" placeholder="请输入材料图片URL" />
      </a-form-item>
      <a-form-item label="附件" name="attachment">
        <a-input v-model:value="form.attachment" placeholder="多个fileKey逗号分隔" />
      </a-form-item>
      <a-form-item label="禁用状态" name="disabledFlag">
        <a-radio-group v-model:value="form.disabledFlag">
          <a-radio :value="false">启用</a-radio>
          <a-radio :value="true">禁用</a-radio>
        </a-radio-group>
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
  import MaterialCategoryTreeSelect from '/@/components/business/material-category-tree-select/index.vue';
  import { message } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import _ from 'lodash';
  import { materialApi } from '/@/api/business/material/material-api';
  import { smartSentry } from '/@/lib/smart-sentry';

  const emit = defineEmits(['reloadList']);

  const formRef = ref();

  const formDefault = {
    materialId: undefined,
    materialCode: undefined,
    materialName: undefined,
    materialCategoryId: undefined,
    specificationModel: undefined,
    unit: undefined,
    unitPrice: undefined,
    safetyStockThreshold: undefined,
    shelfLifeDays: undefined,
    brand: undefined,
    manufacturer: undefined,
    materialImage: undefined,
    attachment: undefined,
    disabledFlag: false,
    remark: undefined,
  };

  let form = reactive({ ...formDefault });

  const rules = {
    materialCode: [{ required: true, message: '材料编码不能为空' }],
    materialName: [{ required: true, message: '材料名称不能为空' }],
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

  function onSubmit() {
    formRef.value
      .validate()
      .then(async () => {
        SmartLoading.show();
        try {
          if (form.materialId) {
            await materialApi.update(form);
          } else {
            await materialApi.add(form);
          }
          message.success(`${form.materialId ? '修改' : '添加'}成功`);
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
