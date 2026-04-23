<!--
  * 项目表单
  *
  * @Author:    1024创新实验室
  * @Date:      2024-01-01
  * @Copyright  1024创新实验室
-->
<template>
  <a-drawer :title="form.projectId ? '编辑项目' : '新建项目'" :width="800" :open="visible" :body-style="{ paddingBottom: '80px' }" @close="onClose">
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="项目编号" name="projectNo" :label-col="{ span: 6 }">
            <a-input v-model:value="form.projectNo" placeholder="请输入项目编号" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="项目名称" name="projectName" :label-col="{ span: 6 }">
            <a-input v-model:value="form.projectName" placeholder="请输入项目名称" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="项目类型" name="projectType" :label-col="{ span: 6 }">
            <a-select v-model:value="form.projectType" placeholder="请选择项目类型">
              <a-select-option v-for="item in PROJECT_TYPE_ENUM" :key="item.value" :value="item.value">
                {{ item.desc }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="项目状态" name="projectStatus" :label-col="{ span: 6 }">
            <a-select v-model:value="form.projectStatus" placeholder="请选择项目状态">
              <a-select-option v-for="item in PROJECT_STATUS_ENUM" :key="item.value" :value="item.value">
                {{ item.desc }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="项目地址" name="projectAddress">
            <a-input v-model:value="form.projectAddress" placeholder="请输入项目地址" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="计划开始日期" name="startDate" :label-col="{ span: 6 }">
            <a-date-picker v-model:value="form.startDate" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="计划结束日期" name="endDate" :label-col="{ span: 6 }">
            <a-date-picker v-model:value="form.endDate" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="项目经理" name="managerName" :label-col="{ span: 6 }">
            <a-input v-model:value="form.managerName" placeholder="请输入项目经理姓名" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="联系电话" name="managerPhone" :label-col="{ span: 6 }">
            <a-input v-model:value="form.managerPhone" placeholder="请输入联系电话" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="预算金额" name="budgetAmount" :label-col="{ span: 6 }">
            <a-input-number v-model:value="form.budgetAmount" :min="0" :precision="2" style="width: 100%" placeholder="请输入预算金额" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="合同金额" name="contractAmount" :label-col="{ span: 6 }">
            <a-input-number v-model:value="form.contractAmount" :min="0" :precision="2" style="width: 100%" placeholder="请输入合同金额" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="委托单位" name="clientName" :label-col="{ span: 6 }">
            <a-input v-model:value="form.clientName" placeholder="请输入委托单位" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="委托方联系人" name="clientContact" :label-col="{ span: 6 }">
            <a-input v-model:value="form.clientContact" placeholder="请输入委托方联系人" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="委托方电话" name="clientPhone" :label-col="{ span: 6 }">
            <a-input v-model:value="form.clientPhone" placeholder="请输入委托方联系电话" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="项目描述" name="description">
            <a-textarea v-model:value="form.description" placeholder="请输入项目描述" :rows="3" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="备注" name="remark">
            <a-textarea v-model:value="form.remark" placeholder="请输入备注" :rows="2" />
          </a-form-item>
        </a-col>
      </a-row>
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
  import dayjs from 'dayjs';
  import { projectApi } from '/@/api/business/project/project-api';
  import { smartSentry } from '/@/lib/smart-sentry';
  import { PROJECT_TYPE_ENUM, PROJECT_STATUS_ENUM } from '/@/constants/business/project/project-const';

  const emit = defineEmits(['reloadList']);

  const formRef = ref();

  const formDefault = {
    projectId: undefined,
    projectNo: '',
    projectName: '',
    projectType: 1,
    projectStatus: 0,
    projectAddress: '',
    startDate: null,
    endDate: null,
    managerName: '',
    managerPhone: '',
    budgetAmount: null,
    contractAmount: null,
    clientName: '',
    clientContact: '',
    clientPhone: '',
    description: '',
    remark: '',
  };

  let form = reactive({ ...formDefault });

  const rules = {
    projectNo: [{ required: true, message: '请输入项目编号' }],
    projectName: [{ required: true, message: '请输入项目名称' }],
    projectType: [{ required: true, message: '请选择项目类型' }],
  };

  const visible = ref(false);

  function showDrawer(rowData) {
    Object.assign(form, _.cloneDeep(formDefault));
    if (rowData && !_.isEmpty(rowData)) {
      Object.assign(form, rowData);
      if (form.startDate) {
        form.startDate = dayjs(form.startDate);
      }
      if (form.endDate) {
        form.endDate = dayjs(form.endDate);
      }
    }
    visible.value = true;
    nextTick(() => {
      formRef.value.clearValidate();
    });
  }

  function onClose() {
    Object.assign(form, _.cloneDeep(formDefault));
    visible.value = false;
  }

  function buildSubmitData() {
    const data = { ...form };
    if (data.startDate) {
      data.startDate = dayjs(data.startDate).format('YYYY-MM-DD');
    }
    if (data.endDate) {
      data.endDate = dayjs(data.endDate).format('YYYY-MM-DD');
    }
    return data;
  }

  function onSubmit() {
    formRef.value
      .validate()
      .then(async () => {
        SmartLoading.show();
        try {
          const submitData = buildSubmitData();
          if (form.projectId) {
            await projectApi.update(submitData);
            message.success('更新成功');
          } else {
            await projectApi.add(submitData);
            message.success('添加成功');
          }
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
