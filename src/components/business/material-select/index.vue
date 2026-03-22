<!--
  * 材料选择组件
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
    show-search
    :filter-option="filterOption"
    :disabled="disabled"
    @change="onChange"
  >
    <a-select-option v-for="item in materialList" :key="item.materialId" :value="item.materialId">
      {{ item.materialCode }} - {{ item.materialName }}
    </a-select-option>
  </a-select>
</template>

<script setup>
  import { ref, watch, onMounted } from 'vue';
  import { materialApi } from '/@/api/business/material/material-api';
  import { smartSentry } from '/@/lib/smart-sentry';

  const props = defineProps({
    value: Number,
    placeholder: {
      type: String,
      default: '请选择材料',
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

  const materialList = ref([]);

  async function queryMaterialList() {
    try {
      let resp = await materialApi.listAll();
      materialList.value = resp.data || [];
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

  function filterOption(input, option) {
    return option.children[0].children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  }

  function onChange(value) {
    const materialInfo = materialList.value.find((item) => item.materialId === value);
    emit('update:value', value);
    emit('change', value, materialInfo);
  }

  onMounted(queryMaterialList);
</script>
