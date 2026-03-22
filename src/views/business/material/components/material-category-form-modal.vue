<!--
  * 材料分类表单
  *
  * @Author:    1024创新实验室
  * @Date:      2024-01-01
  * @Copyright  1024创新实验室
-->
<template>
  <a-modal :open="visible" :title="form.materialCategoryId ? '编辑' : '添加'" ok-text="确认" cancel-text="取消" @ok="onSubmit" @cancel="onClose">
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
      <a-form-item label="分类名称" name="categoryName">
        <a-input v-model:value="form.categoryName" placeholder="请输入分类名称" />
      </a-form-item>
      <a-form-item label="分类编码" name="categoryCode">
        <a-input v-model:value="form.categoryCode" placeholder="请输入分类编码" />
      </a-form-item>
      <a-form-item label="排序" name="sort">
        <a-input-number style="width: 100%" v-model:value="form.sort" placeholder="请输入排序" :min="0" />
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
  </a-modal>
</template>
<script setup>
  import { ref, reactive, nextTick } from 'vue';
  import { message } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import _ from 'lodash';
  import { materialCategoryApi } from '/@/api/business/material/material-category-api';
  import { smartSentry } from '/@/lib/smart-sentry';

  const emit = defineEmits(['reloadList']);

  const formRef = ref();

  const visible = ref(false);

  function showModal(parentId, rowData) {
    Object.assign(form, formDefault);
    form.parentId = parentId || 0;
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

  const formDefault = {
    materialCategoryId: undefined,
    categoryName: '',
    categoryCode: '',
    parentId: 0,
    sort: 0,
    remark: '',
    disabledFlag: false,
  };

  let form = reactive({ ...formDefault });

  const rules = {
    categoryName: [{ required: true, message: '请输入分类名称' }],
  };

  function onSubmit() {
    formRef.value
      .validate()
      .then(async () => {
        SmartLoading.show();
        try {
          if (form.materialCategoryId) {
            await materialCategoryApi.update(form);
          } else {
            await materialCategoryApi.add(form);
          }
          message.success(`${form.materialCategoryId ? '修改' : '添加'}成功`);
          emit('reloadList', form.parentId);
          onClose();
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
    showModal,
  });
</script>
