<!--
  * 项目选择组件
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
    <a-select-option v-for="item in projectList" :key="item.projectId" :value="item.projectId">
      {{ item.projectName }}
    </a-select-option>
  </a-select>
</template>

<script setup>
  import { ref, watch, onMounted } from 'vue';
  import { projectApi } from '/@/api/business/project/project-api';
  import { smartSentry } from '/@/lib/smart-sentry';

  const props = defineProps({
    value: Number,
    placeholder: {
      type: String,
      default: '请选择项目',
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

  const projectList = ref([]);

  async function queryProjectList() {
    try {
      let resp = await projectApi.listAll();
      projectList.value = resp.data || [];
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
    emit('update:value', value);
    const selected = projectList.value.find((item) => item.projectId === value);
    emit('change', value, selected);
  }

  onMounted(queryProjectList);
</script>
