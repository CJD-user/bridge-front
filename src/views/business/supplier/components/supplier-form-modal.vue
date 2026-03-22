<!--
  * 供应商表单
  *
  * @Author:    1024创新实验室
  * @Date:      2024-01-01
  * @Copyright  1024创新实验室
-->
<template>
  <a-drawer :title="form.supplierId ? '编辑' : '添加'" :width="720" :open="visible" :body-style="{ paddingBottom: '80px' }" @close="onClose">
    <a-form ref="formRef" :model="form" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="basic" tab="基本信息">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="供应商编码" name="supplierCode">
                <a-input v-model:value="form.supplierCode" placeholder="请输入供应商编码" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="供应商名称" name="supplierName">
                <a-input v-model:value="form.supplierName" placeholder="请输入供应商名称" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="简称" name="shortName">
                <a-input v-model:value="form.shortName" placeholder="请输入简称" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="统一社会信用代码" name="unifiedSocialCreditCode">
                <a-input v-model:value="form.unifiedSocialCreditCode" placeholder="请输入统一社会信用代码" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="资质等级" name="qualificationLevel">
                <a-input v-model:value="form.qualificationLevel" placeholder="请输入资质等级" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="供应商评级" name="rating">
                <a-rate v-model:value="form.rating" :count="5" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="经营范围" name="businessScope" :label-col="{ span: 3 }" :wrapper-col="{ span: 20 }">
                <a-textarea v-model:value="form.businessScope" placeholder="请输入经营范围" :rows="3" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-tab-pane>

        <a-tab-pane key="contact" tab="联系信息">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="联系人" name="contactPerson">
                <a-input v-model:value="form.contactPerson" placeholder="请输入联系人" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="联系电话" name="contactPhone">
                <a-input v-model:value="form.contactPhone" placeholder="请输入联系电话" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="邮箱" name="email">
                <a-input v-model:value="form.email" placeholder="请输入邮箱" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="省份" name="province">
                <a-input v-model:value="form.provinceName" placeholder="请选择省份" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="城市" name="city">
                <a-input v-model:value="form.cityName" placeholder="请选择城市" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="详细地址" name="address" :label-col="{ span: 3 }" :wrapper-col="{ span: 20 }">
                <a-input v-model:value="form.address" placeholder="请输入详细地址" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-tab-pane>

        <a-tab-pane key="finance" tab="财务信息">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="开户银行" name="bankName">
                <a-input v-model:value="form.bankName" placeholder="请输入开户银行" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="银行账号" name="bankAccount">
                <a-input v-model:value="form.bankAccount" placeholder="请输入银行账号" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-tab-pane>

        <a-tab-pane key="other" tab="其他信息">
          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="营业执照" name="businessLicense" :label-col="{ span: 3 }" :wrapper-col="{ span: 20 }">
                <a-input v-model:value="form.businessLicense" placeholder="请输入营业执照附件URL" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="资质文件" name="qualificationFile" :label-col="{ span: 3 }" :wrapper-col="{ span: 20 }">
                <a-input v-model:value="form.qualificationFile" placeholder="请输入资质文件附件URL" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="禁用状态" name="disabledFlag">
                <a-radio-group v-model:value="form.disabledFlag">
                  <a-radio :value="false">启用</a-radio>
                  <a-radio :value="true">禁用</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item label="备注" name="remark" :label-col="{ span: 3 }" :wrapper-col="{ span: 20 }">
                <a-textarea v-model:value="form.remark" placeholder="请输入备注" :rows="3" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-tab-pane>
      </a-tabs>
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
  import { ref, nextTick, reactive } from 'vue';
  import { message } from 'ant-design-vue';
  import { SmartLoading } from '/@/components/framework/smart-loading';
  import _ from 'lodash';
  import { supplierApi } from '/@/api/business/supplier/supplier-api';
  import { smartSentry } from '/@/lib/smart-sentry';

  const emit = defineEmits(['reloadList']);

  const formRef = ref();
  const activeKey = ref('basic');

  const formDefault = {
    supplierId: undefined,
    supplierCode: undefined,
    supplierName: undefined,
    shortName: undefined,
    unifiedSocialCreditCode: undefined,
    qualificationLevel: undefined,
    businessScope: undefined,
    contactPerson: undefined,
    contactPhone: undefined,
    email: undefined,
    address: undefined,
    province: undefined,
    provinceName: undefined,
    city: undefined,
    cityName: undefined,
    bankName: undefined,
    bankAccount: undefined,
    businessLicense: undefined,
    qualificationFile: undefined,
    rating: 3,
    remark: undefined,
    disabledFlag: false,
  };

  let form = reactive({ ...formDefault });

  const rules = {
    supplierCode: [{ required: true, message: '供应商编码不能为空' }],
    supplierName: [{ required: true, message: '供应商名称不能为空' }],
  };

  const visible = ref(false);

  function showDrawer(rowData) {
    Object.assign(form, formDefault);
    activeKey.value = 'basic';
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

  function onSubmit() {
    formRef.value
      .validate()
      .then(async () => {
        SmartLoading.show();
        try {
          if (form.supplierId) {
            await supplierApi.update(form);
          } else {
            await supplierApi.add(form);
          }
          message.success(`${form.supplierId ? '修改' : '添加'}成功`);
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
