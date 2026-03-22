/*
 * 供应商管理 API
 *
 * @Author:    1024创新实验室
 * @Date:      2024-01-01
 * @Copyright  1024创新实验室
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const supplierApi = {
  query: (param) => {
    return postRequest('/supplier/query', param);
  },

  getDetail: (supplierId) => {
    return getRequest(`/supplier/detail/${supplierId}`);
  },

  add: (param) => {
    return postRequest('/supplier/add', param);
  },

  update: (param) => {
    return postRequest('/supplier/update', param);
  },

  delete: (supplierId) => {
    return getRequest(`/supplier/delete/${supplierId}`);
  },

  batchDelete: (idList) => {
    return postRequest('/supplier/batchDelete', idList);
  },

  updateDisabled: (supplierId, disabledFlag) => {
    return getRequest(`/supplier/updateDisabled/${supplierId}`, { disabledFlag });
  },

  listAll: () => {
    return getRequest('/supplier/listAll');
  },
};
