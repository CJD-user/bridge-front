<!--
  * 出库申请表单
  *
  * @Author:    1024创新实验室
  * @Date:      2024-01-01
  * @Copyright  1024创新实验室
-->
<template>
  <a-drawer :title="form.outboundOrderId ? '编辑出库申请' : '发起出库申请'" :width="900" :open="visible" :body-style="{ paddingBottom: '80px' }" @close="onClose">
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="项目名称" name="projectName" :label-col="{ span: 8 }">
            <a-input v-model:value="form.projectName" placeholder="请输入项目名称" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="出库类型" name="outboundType" :label-col="{ span: 8 }">
            <a-select v-model:value="form.outboundType" placeholder="请选择出库类型">
              <a-select-option v-for="item in OUTBOUND_TYPE_ENUM" :key="item.value" :value="item.value">
                {{ item.desc }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="出库日期" name="outboundDate" :label-col="{ span: 8 }">
            <a-date-picker v-model:value="form.outboundDate" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="审批流程" name="approvalFlowId" :label-col="{ span: 8 }">
            <ApprovalFlowSelect v-model:value="form.approvalFlowId" :businessType="2" placeholder="请选择审批流程" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="领用人" name="receiverName" :label-col="{ span: 8 }">
            <a-input v-model:value="form.receiverName" placeholder="请输入领用人姓名" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="联系电话" name="receiverPhone" :label-col="{ span: 8 }">
            <a-input v-model:value="form.receiverPhone" placeholder="请输入联系电话" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="施工班组" name="teamName" :label-col="{ span: 8 }">
            <a-input v-model:value="form.teamName" placeholder="请输入施工班组" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="使用部位" name="usePosition" :label-col="{ span: 8 }">
            <a-input v-model:value="form.usePosition" placeholder="请输入使用部位" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="备注" name="remark">
            <a-textarea v-model:value="form.remark" placeholder="请输入备注" :rows="2" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-divider>出库明细</a-divider>

      <a-form-item label="" :wrapper-col="{ span: 24 }">
        <div style="margin-bottom: 8px">
          <a-button type="primary" size="small" @click="addItem">
            <PlusOutlined /> 添加材料
          </a-button>
          <span style="margin-left: 16px; color: #999">合计数量: {{ totalQuantity }} 件</span>
        </div>

        <a-table
          :dataSource="form.itemList"
          :columns="itemColumns"
          rowKey="key"
          bordered
          :pagination="false"
          size="small"
        >
          <template #bodyCell="{ text, record, column, index }">
            <template v-if="column.dataIndex === 'materialId'">
              <MaterialSelect v-model:value="record.materialId" size="small" @change="(val, info) => onMaterialChange(record, val, info)" />
            </template>
            <template v-if="column.dataIndex === 'requestQuantity'">
              <a-input-number v-model:value="record.requestQuantity" size="small" :min="1" :precision="2" style="width: 100%" />
            </template>
            <template v-if="column.dataIndex === 'batchNo'">
              <a-input v-model:value="record.batchNo" size="small" placeholder="批号" />
            </template>
            <template v-if="column.dataIndex === 'storageLocation'">
              <a-input v-model:value="record.storageLocation" size="small" placeholder="存放位置" />
            </template>
            <template v-if="column.dataIndex === 'action'">
              <a-button type="link" danger size="small" @click="removeItem(index)">删除</a-button>
            </template>
          </template>
        </a-table>
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
      <a-button type="primary" @click="onSubmit">提交申请</a-button>
    </div>
  </a-drawer>
</template>
<script setup>
  import { ref, nextTick, reactive, computed } from 'vue';
  import { message } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import _ from 'lodash';
  import dayjs from 'dayjs';
  import { outboundOrderApi } from '/@/api/business/outbound/outbound-order-api';
  import { smartSentry } from '/@/lib/smart-sentry';
  import { OUTBOUND_TYPE_ENUM } from '/@/constants/business/outbound/outbound-const';
  import MaterialSelect from '/@/components/business/material-select/index.vue';
  import ApprovalFlowSelect from '/@/components/business/approval-flow-select/index.vue';

  const emit = defineEmits(['reloadList']);

  const formRef = ref();

  const itemColumns = ref([
    {
      title: '材料',
      dataIndex: 'materialId',
      width: 200,
    },
    {
      title: '规格型号',
      dataIndex: 'specificationModel',
      width: 120,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      width: 60,
    },
    {
      title: '申请数量',
      dataIndex: 'requestQuantity',
      width: 100,
    },
    {
      title: '批号',
      dataIndex: 'batchNo',
      width: 100,
    },
    {
      title: '存放位置',
      dataIndex: 'storageLocation',
      width: 120,
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 60,
    },
  ]);

  const createEmptyItem = () => ({
    key: Date.now() + Math.random(),
    materialId: undefined,
    materialCode: '',
    materialName: '',
    specificationModel: '',
    unit: '',
    requestQuantity: 1,
    batchNo: '',
    storageLocation: '',
    remark: '',
  });

  const formDefault = {
    outboundOrderId: undefined,
    projectName: '',
    outboundType: 1,
    outboundDate: dayjs(),
    approvalFlowId: undefined,
    receiverName: '',
    receiverPhone: '',
    teamName: '',
    usePosition: '',
    remark: '',
    itemList: [createEmptyItem()],
  };

  let form = reactive({ ...formDefault });

  const totalQuantity = computed(() => {
    return form.itemList.reduce((sum, item) => sum + (Number(item.requestQuantity) || 0), 0);
  });

  const rules = {
    outboundType: [{ required: true, message: '请选择出库类型' }],
    outboundDate: [{ required: true, message: '请选择出库日期' }],
    approvalFlowId: [{ required: true, message: '请选择审批流程' }],
    receiverName: [{ required: true, message: '请输入领用人姓名' }],
  };

  const visible = ref(false);

  function showDrawer(rowData) {
    Object.assign(form, _.cloneDeep(formDefault));
    if (rowData && !_.isEmpty(rowData)) {
      Object.assign(form, rowData);
      if (form.outboundDate) {
        form.outboundDate = dayjs(form.outboundDate);
      }
      if (rowData.itemList && rowData.itemList.length > 0) {
        form.itemList = rowData.itemList.map((item, idx) => ({
          ...item,
          key: Date.now() + idx,
        }));
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

  function addItem() {
    form.itemList.push(createEmptyItem());
  }

  function removeItem(index) {
    if (form.itemList.length <= 1) {
      message.warning('至少需要一条出库明细');
      return;
    }
    form.itemList.splice(index, 1);
  }

  function onMaterialChange(record, materialId, materialInfo) {
    if (materialInfo) {
      record.materialCode = materialInfo.materialCode;
      record.materialName = materialInfo.materialName;
      record.specificationModel = materialInfo.specificationModel;
      record.unit = materialInfo.unit;
    }
  }

  function validateItemList() {
    if (form.itemList.length < 1) {
      message.error('至少需要一条出库明细');
      return false;
    }
    for (let i = 0; i < form.itemList.length; i++) {
      const item = form.itemList[i];
      if (!item.materialId) {
        message.error(`第${i + 1}条明细请选择材料`);
        return false;
      }
      if (!item.requestQuantity || item.requestQuantity < 1) {
        message.error(`第${i + 1}条明细数量必须大于0`);
        return false;
      }
    }
    return true;
  }

  function buildSubmitData() {
    return {
      projectName: form.projectName || undefined,
      outboundType: form.outboundType,
      outboundDate: form.outboundDate ? dayjs(form.outboundDate).format('YYYY-MM-DD') : null,
      approvalFlowId: form.approvalFlowId,
      receiverName: form.receiverName,
      receiverPhone: form.receiverPhone || undefined,
      teamName: form.teamName || undefined,
      usePosition: form.usePosition || undefined,
      remark: form.remark || undefined,
      itemList: form.itemList.map((item) => ({
        materialId: item.materialId,
        requestQuantity: item.requestQuantity,
        batchNo: item.batchNo || undefined,
        storageLocation: item.storageLocation || undefined,
        remark: item.remark || undefined,
      })),
    };
  }

  function onSubmit() {
    formRef.value
      .validate()
      .then(async () => {
        if (!validateItemList()) return;

        SmartLoading.show();
        try {
          const submitData = buildSubmitData();
          const resp = await outboundOrderApi.add(submitData);
          if (resp.ok) {
            message.success('提交成功，等待审批');
            onClose();
            emit('reloadList');
          }
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
