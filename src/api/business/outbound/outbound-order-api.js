/*
 * 出库申请 API
 *
 * @Author:    1024创新实验室
 * @Date:      2024-01-01
 * @Copyright  1024创新实验室
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const outboundOrderApi = {
  query: (param) => {
    return postRequest('/outboundOrder/query', param);
  },

  queryMy: (param) => {
    return postRequest('/outboundOrder/queryMy', param);
  },

  getDetail: (outboundOrderId) => {
    return getRequest(`/outboundOrder/detail/${outboundOrderId}`);
  },

  add: (param) => {
    return postRequest('/outboundOrder/add', param);
  },

  update: (param) => {
    return postRequest('/outboundOrder/update', param);
  },

  submit: (outboundOrderId) => {
    return getRequest(`/outboundOrder/submit/${outboundOrderId}`);
  },

  approval: (param) => {
    return postRequest('/outboundOrder/approval', param);
  },

  approvalRecords: (outboundOrderId) => {
    return getRequest(`/outboundOrder/approvalRecords/${outboundOrderId}`);
  },

  withdraw: (outboundOrderId) => {
    return getRequest(`/outboundOrder/withdraw/${outboundOrderId}`);
  },

  confirm: (outboundOrderId) => {
    return getRequest(`/outboundOrder/confirm/${outboundOrderId}`);
  },

  cancel: (outboundOrderId) => {
    return getRequest(`/outboundOrder/cancel/${outboundOrderId}`);
  },
};
