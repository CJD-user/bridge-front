/*
 * 采购申请 API
 *
 * @Author:    1024创新实验室
 * @Date:      2024-01-01
 * @Copyright  1024创新实验室
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const purchaseOrderApi = {
  query: (param) => {
    return postRequest('/purchaseOrder/query', param);
  },

  queryMy: (param) => {
    return postRequest('/purchaseOrder/queryMy', param);
  },

  getDetail: (purchaseOrderId) => {
    return getRequest(`/purchaseOrder/detail/${purchaseOrderId}`);
  },

  add: (param) => {
    return postRequest('/purchaseOrder/add', param);
  },

  approval: (param) => {
    return postRequest('/purchaseOrder/approval', param);
  },

  approvalRecords: (purchaseOrderId) => {
    return getRequest(`/purchaseOrder/approvalRecords/${purchaseOrderId}`);
  },

  withdraw: (purchaseOrderId) => {
    return getRequest(`/purchaseOrder/withdraw/${purchaseOrderId}`);
  },
};
