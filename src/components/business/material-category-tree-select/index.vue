<!--
  * 材料分类 树形选择组件
  *
  * @Author:    1024创新实验室
  * @Date:      2024-01-01
  * @Copyright  1024创新实验室
-->
<template>
  <a-tree-select
    v-model:value="selectValue"
    :style="`width:${width}`"
    :dropdown-style="{ maxHeight: '400px', overflowX: 'auto' }"
    :tree-data="categoryTreeData"
    :placeholder="placeholder"
    :allowClear="true"
    tree-default-expand-all
    :field-names="{ label: 'categoryName', value: 'materialCategoryId', children: 'children' }"
    @change="onChange"
  />
</template>

<script setup>
  import { ref, watch, onMounted } from 'vue';
  import { materialCategoryApi } from '/@/api/business/material/material-category-api';
  import { smartSentry } from '/@/lib/smart-sentry';

  const props = defineProps({
    value: Number,
    placeholder: {
      type: String,
      default: '请选择材料分类',
    },
    width: {
      type: String,
      default: '100%',
    },
  });

  const emit = defineEmits(['update:value', 'change']);

  const categoryTreeData = ref([]);

  async function queryCategoryTree() {
    try {
      let resp = await materialCategoryApi.listAll();
      categoryTreeData.value = resp.data || [];
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

  function onChange(value) {
    emit('update:value', value);
    emit('change', value);
  }

  onMounted(queryCategoryTree);
</script>
