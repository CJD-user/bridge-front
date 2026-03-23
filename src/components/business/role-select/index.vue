<!--
  * 角色选择组件
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
    <a-select-option v-for="item in roleList" :key="item.roleId" :value="item.roleId">
      {{ item.roleName }}
    </a-select-option>
  </a-select>
</template>

<script setup>
  import { ref, watch, onMounted } from 'vue';
  import { roleApi } from '/@/api/system/role-api';
  import { smartSentry } from '/@/lib/smart-sentry';

  const props = defineProps({
    value: [Number, String],
    placeholder: {
      type: String,
      default: '请选择角色',
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

  const roleList = ref([]);

  async function queryRoleList() {
    try {
      let resp = await roleApi.queryAll();
      roleList.value = resp.data || [];
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
    const roleInfo = roleList.value.find((item) => item.roleId === value);
    emit('update:value', value);
    emit('change', value, roleInfo);
  }

  onMounted(queryRoleList);
</script>
