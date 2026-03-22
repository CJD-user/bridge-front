<!--
  * 供应商评价表单
  *
  * @Author:    1024创新实验室
  * @Date:      2024-01-01
  * @Copyright  1024创新实验室
-->
<template>
  <a-drawer :title="form.evaluateId ? '编辑评价' : '添加评价'" :width="600" :open="visible" :body-style="{ paddingBottom: '80px' }" @close="onClose">
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
      <a-form-item label="供应商" name="supplierId">
        <SupplierSelect v-model:value="form.supplierId" placeholder="请选择供应商" :disabled="!!form.evaluateId" />
      </a-form-item>
      <a-form-item label="评价类型" name="evaluateType">
        <a-select v-model:value="form.evaluateType" placeholder="请选择评价类型">
          <a-select-option v-for="item in EVALUATE_TYPE_ENUM" :key="item.value" :value="item.value">
            {{ item.desc }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="评价日期" name="evaluateDate">
        <a-date-picker v-model:value="form.evaluateDate" style="width: 100%" />
      </a-form-item>
      <a-form-item label="质量评分" name="qualityScore">
        <a-row :gutter="8" align="middle">
          <a-col :span="18">
            <a-slider v-model:value="form.qualityScore" :min="1" :max="5" :step="0.1" />
          </a-col>
          <a-col :span="6">
            <a-input-number v-model:value="form.qualityScore" :min="1" :max="5" :step="0.1" />
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item label="交付评分" name="deliveryScore">
        <a-row :gutter="8" align="middle">
          <a-col :span="18">
            <a-slider v-model:value="form.deliveryScore" :min="1" :max="5" :step="0.1" />
          </a-col>
          <a-col :span="6">
            <a-input-number v-model:value="form.deliveryScore" :min="1" :max="5" :step="0.1" />
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item label="服务评分" name="serviceScore">
        <a-row :gutter="8" align="middle">
          <a-col :span="18">
            <a-slider v-model:value="form.serviceScore" :min="1" :max="5" :step="0.1" />
          </a-col>
          <a-col :span="6">
            <a-input-number v-model:value="form.serviceScore" :min="1" :max="5" :step="0.1" />
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item label="价格评分" name="priceScore">
        <a-row :gutter="8" align="middle">
          <a-col :span="18">
            <a-slider v-model:value="form.priceScore" :min="1" :max="5" :step="0.1" />
          </a-col>
          <a-col :span="6">
            <a-input-number v-model:value="form.priceScore" :min="1" :max="5" :step="0.1" />
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item label="综合评分">
        <a-tag :color="getScoreColor(computedTotalScore)" style="font-size: 14px; padding: 4px 12px">
          {{ computedTotalScore.toFixed(1) }}
        </a-tag>
      </a-form-item>
      <a-form-item label="评价内容" name="evaluateContent">
        <a-textarea v-model:value="form.evaluateContent" placeholder="请输入评价内容" :rows="4" />
      </a-form-item>
      <a-form-item label="附件" name="attachment">
        <a-input v-model:value="form.attachment" placeholder="请输入附件URL" />
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
  import { ref, nextTick, reactive, computed } from 'vue';
  import { message } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import _ from 'lodash';
  import dayjs from 'dayjs';
  import { supplierEvaluateApi } from '/@/api/business/supplier/supplier-evaluate-api';
  import { smartSentry } from '/@/lib/smart-sentry';
  import { EVALUATE_TYPE_ENUM } from '/@/constants/business/supplier/supplier-evaluate-const';
  import SupplierSelect from '/@/components/business/supplier-select/index.vue';

  const emit = defineEmits(['reloadList']);

  const formRef = ref();

  const formDefault = {
    evaluateId: undefined,
    supplierId: undefined,
    evaluateType: undefined,
    evaluateDate: undefined,
    qualityScore: 3,
    deliveryScore: 3,
    serviceScore: 3,
    priceScore: 3,
    evaluateContent: undefined,
    attachment: undefined,
  };

  let form = reactive({ ...formDefault });

  const computedTotalScore = computed(() => {
    const total = (form.qualityScore + form.deliveryScore + form.serviceScore + form.priceScore) / 4;
    return Math.round(total * 10) / 10;
  });

  const rules = {
    supplierId: [{ required: true, message: '请选择供应商' }],
    evaluateType: [{ required: true, message: '请选择评价类型' }],
    evaluateDate: [{ required: true, message: '请选择评价日期' }],
  };

  const visible = ref(false);

  function getScoreColor(score) {
    if (score >= 4.5) return 'green';
    if (score >= 3.5) return 'blue';
    if (score >= 2.5) return 'orange';
    return 'red';
  }

  function showDrawer(rowData) {
    Object.assign(form, formDefault);
    if (rowData && !_.isEmpty(rowData)) {
      Object.assign(form, rowData);
      if (form.evaluateDate) {
        form.evaluateDate = dayjs(form.evaluateDate);
      }
      form.qualityScore = Number(form.qualityScore) || 3;
      form.deliveryScore = Number(form.deliveryScore) || 3;
      form.serviceScore = Number(form.serviceScore) || 3;
      form.priceScore = Number(form.priceScore) || 3;
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
          let params = { ...form };
          params.totalScore = computedTotalScore.value;
          if (form.evaluateId) {
            await supplierEvaluateApi.update(params);
          } else {
            await supplierEvaluateApi.add(params);
          }
          message.success(`${form.evaluateId ? '修改' : '添加'}成功`);
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
