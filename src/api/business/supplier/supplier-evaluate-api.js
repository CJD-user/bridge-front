/*
 * 供应商评价 API
 *
 * @Author:    1024创新实验室
 * @Date:      2024-01-01
 * @Copyright  1024创新实验室
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const supplierEvaluateApi = {
  query: (param) => {
    return postRequest('/supplierEvaluate/query', param);
  },

  listBySupplierId: (supplierId) => {
    return getRequest(`/supplierEvaluate/list/${supplierId}`);
  },

  getDetail: (evaluateId) => {
    return getRequest(`/supplierEvaluate/detail/${evaluateId}`);
  },

  add: (param) => {
    return postRequest('/supplierEvaluate/add', param);
  },

  update: (param) => {
    return postRequest('/supplierEvaluate/update', param);
  },

  delete: (evaluateId) => {
    return getRequest(`/supplierEvaluate/delete/${evaluateId}`);
  },
};
