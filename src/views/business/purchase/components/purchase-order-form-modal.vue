<!--
  * 采购申请表单
  *
  * @Author:    1024创新实验室
  * @Date:      2024-01-01
  * @Copyright  1024创新实验室
-->
<template>
  <a-drawer title="发起采购申请" :width="900" :open="visible" :body-style="{ paddingBottom: '80px' }" @close="onClose">
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="项目名称" name="projectId" :label-col="{ span: 8 }">
            <ProjectSelect v-model:value="form.projectId" @change="onProjectChange" placeholder="请选择项目" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="采购类型" name="purchaseType" :label-col="{ span: 8 }">
            <a-select v-model:value="form.purchaseType" placeholder="请选择采购类型">
              <a-select-option v-for="item in PURCHASE_TYPE_ENUM" :key="item.value" :value="item.value">
                {{ item.desc }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="期望到货日期" name="expectedArrivalDate" :label-col="{ span: 8 }">
            <a-date-picker v-model:value="form.expectedArrivalDate" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="审批流程" name="approvalFlowId" :label-col="{ span: 8 }">
            <ApprovalFlowSelect v-model:value="form.approvalFlowId" :businessType="1" placeholder="请选择审批流程" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="采购原因" name="purchaseReason">
            <a-textarea v-model:value="form.purchaseReason" placeholder="请输入采购原因" :rows="2" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="备注" name="remark">
            <a-textarea v-model:value="form.remark" placeholder="请输入备注" :rows="2" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-divider>采购明细</a-divider>

      <a-form-item label="" :wrapper-col="{ span: 24 }">
        <div style="margin-bottom: 8px">
          <a-button type="primary" size="small" @click="addItem">
            <PlusOutlined /> 添加材料
          </a-button>
          <span style="margin-left: 16px; color: #999">合计数量: {{ totalQuantity }} 件，合计金额: ¥{{ totalAmount.toLocaleString() }}</span>
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
            <template v-if="column.dataIndex === 'purchaseQuantity'">
              <a-input-number v-model:value="record.purchaseQuantity" size="small" :min="1" :precision="2" style="width: 100%" @change="calcAmount(record)" />
            </template>
            <template v-if="column.dataIndex === 'unitPrice'">
              <a-input-number v-model:value="record.unitPrice" size="small" :min="0" :precision="2" style="width: 100%" @change="calcAmount(record)" />
            </template>
            <template v-if="column.dataIndex === 'totalPrice'">
              <span>{{ record.totalPrice ? '¥' + record.totalPrice : '' }}</span>
            </template>
            <template v-if="column.dataIndex === 'supplierId'">
              <SupplierSelect v-model:value="record.supplierId" size="small" @change="(val, info) => onSupplierChange(record, val, info)" />
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
  import { purchaseOrderApi } from '/@/api/business/purchase/purchase-order-api';
  import { smartSentry } from '/@/lib/smart-sentry';
  import { PURCHASE_TYPE_ENUM } from '/@/constants/business/purchase/purchase-const';
  import MaterialSelect from '/@/components/business/material-select/index.vue';
  import SupplierSelect from '/@/components/business/supplier-select/index.vue';
  import ProjectSelect from '/@/components/business/project-select/index.vue';
  import ApprovalFlowSelect from '/@/components/business/approval-flow-select/index.vue';

  const emit = defineEmits(['reloadList']);

  const formRef = ref();

  const itemColumns = ref([
    {
      title: '材料',
      dataIndex: 'materialId',
      width: 180,
    },
    {
      title: '规格型号',
      dataIndex: 'specificationModel',
      width: 100,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      width: 60,
    },
    {
      title: '采购数量',
      dataIndex: 'purchaseQuantity',
      width: 100,
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      width: 100,
    },
    {
      title: '总价',
      dataIndex: 'totalPrice',
      width: 100,
    },
    {
      title: '建议供应商',
      dataIndex: 'supplierId',
      width: 150,
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
    purchaseQuantity: 1,
    unitPrice: null,
    totalPrice: null,
    supplierId: undefined,
    supplierName: '',
    remark: '',
  });

  const formDefault = {
    projectId: undefined,
    projectName: '',
    purchaseType: 1,
    expectedArrivalDate: null,
    approvalFlowId: undefined,
    purchaseReason: '',
    remark: '',
    itemList: [createEmptyItem()],
  };

  let form = reactive({ ...formDefault });

  const totalQuantity = computed(() => {
    return form.itemList.reduce((sum, item) => sum + (Number(item.purchaseQuantity) || 0), 0);
  });

  const totalAmount = computed(() => {
    return form.itemList.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
  });

  const rules = {
    purchaseType: [{ required: true, message: '请选择采购类型' }],
    expectedArrivalDate: [{ required: true, message: '请选择期望到货日期' }],
    approvalFlowId: [{ required: true, message: '请选择审批流程' }],
  };

  const visible = ref(false);

  function showDrawer() {
    Object.assign(form, _.cloneDeep(formDefault));
    visible.value = true;
    nextTick(() => {
      formRef.value.clearValidate();
    });
  }

  function onClose() {
    Object.assign(form, _.cloneDeep(formDefault));
    visible.value = false;
  }

  function onProjectChange(value, info) {
    if (info) {
      form.projectName = info.projectName;
    } else {
      form.projectName = '';
    }
  }

  function addItem() {
    form.itemList.push(createEmptyItem());
  }

  function removeItem(index) {
    if (form.itemList.length <= 1) {
      message.warning('至少需要一条采购明细');
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
      record.unitPrice = materialInfo.unitPrice;
      calcAmount(record);
    }
  }

  function onSupplierChange(record, supplierId, supplierInfo) {
    if (supplierInfo) {
      record.supplierName = supplierInfo.supplierName;
    } else {
      record.supplierName = '';
    }
  }

  function calcAmount(record) {
    const qty = Number(record.purchaseQuantity) || 0;
    const price = Number(record.unitPrice) || 0;
    record.totalPrice = (qty * price).toFixed(2);
  }

  function validateItemList() {
    if (form.itemList.length < 1) {
      message.error('至少需要一条采购明细');
      return false;
    }
    for (let i = 0; i < form.itemList.length; i++) {
      const item = form.itemList[i];
      if (!item.materialId) {
        message.error(`第${i + 1}条明细请选择材料`);
        return false;
      }
      if (!item.purchaseQuantity || item.purchaseQuantity < 1) {
        message.error(`第${i + 1}条明细数量必须大于0`);
        return false;
      }
    }
    return true;
  }

  function buildSubmitData() {
    return {
      projectId: form.projectId || undefined,
      projectName: form.projectName || undefined,
      purchaseType: form.purchaseType,
      expectedArrivalDate: form.expectedArrivalDate ? dayjs(form.expectedArrivalDate).format('YYYY-MM-DD') : null,
      approvalFlowId: form.approvalFlowId,
      purchaseReason: form.purchaseReason || undefined,
      remark: form.remark || undefined,
      totalAmount: totalAmount.value,
      itemList: form.itemList.map((item) => ({
        materialId: item.materialId,
        materialCode: item.materialCode,
        materialName: item.materialName,
        specificationModel: item.specificationModel,
        unit: item.unit,
        purchaseQuantity: item.purchaseQuantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        supplierId: item.supplierId || undefined,
        supplierName: item.supplierName || undefined,
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
          await purchaseOrderApi.add(submitData);
          message.success('提交成功，等待审批');
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
