<!--
  * 审批流程选择组件
  *
  * @Author:    1024创新实验室
  * @Date:      2024-01-01
  * @Copyright  1024创新实验室
-->
<template>
  <a-select
    v-model:value="selectValue"
    :style="`width:${width}`"
    :placeholder="placeholder"
    :allowClear="true"
    :disabled="disabled"
    @change="onChange"
  >
    <a-select-option v-for="item in flowList" :key="item.approvalFlowId" :value="item.approvalFlowId">
      {{ item.flowName }}
    </a-select-option>
  </a-select>
</template>

<script setup>
  import { ref, watch, onMounted } from 'vue';
  import { approvalFlowApi } from '/@/api/business/approval-flow/approval-flow-api';
  import { smartSentry } from '/@/lib/smart-sentry';

  const props = defineProps({
    value: Number,
    businessType: {
      type: Number,
      default: 2,
    },
    placeholder: {
      type: String,
      default: '请选择审批流程',
    },
    width: {
      type: String,
      default: '100%',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits(['update:value', 'change']);

  const flowList = ref([]);

  async function queryFlowList() {
    try {
      let resp = await approvalFlowApi.listByBusinessType(props.businessType);
      flowList.value = resp.data || [];
    } catch (e) {
      smartSentry.captureError(e);
    }
  }

  const selectValue = ref(props.value);

  watch(
    () => props.value,
    (newValue) => {
      selectValue.value = newValue;
    }
  );

  watch(
    () => props.businessType,
    () => {
      queryFlowList();
    }
  );

  function onChange(value) {
    emit('update:value', value);
    const selected = flowList.value.find((item) => item.approvalFlowId === value);
    emit('change', value, selected);
  }

  onMounted(queryFlowList);
</script>
