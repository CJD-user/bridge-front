/*
 * 审批流程 API
 *
 * @Author:    1024创新实验室
 * @Date:      2024-01-01
 * @Copyright  1024创新实验室
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const approvalFlowApi = {
  query: (param) => {
    return postRequest('/approvalFlow/query', param);
  },

  getDetail: (approvalFlowId) => {
    return getRequest(`/approvalFlow/detail/${approvalFlowId}`);
  },

  add: (param) => {
    return postRequest('/approvalFlow/add', param);
  },

  update: (param) => {
    return postRequest('/approvalFlow/update', param);
  },

  delete: (approvalFlowId) => {
    return getRequest(`/approvalFlow/delete/${approvalFlowId}`);
  },

  updateStatus: (approvalFlowId, status) => {
    return getRequest(`/approvalFlow/updateStatus/${approvalFlowId}`, { status });
  },

  listByBusinessType: (businessType) => {
    return getRequest('/approvalFlow/listByBusinessType', { businessType });
  },
};

export const approvalNodeApi = {
  listByFlowId: (approvalFlowId) => {
    return getRequest(`/approvalNode/list/${approvalFlowId}`);
  },

  add: (param) => {
    return postRequest('/approvalNode/add', param);
  },

  update: (param) => {
    return postRequest('/approvalNode/update', param);
  },

  delete: (approvalNodeId) => {
    return getRequest(`/approvalNode/delete/${approvalNodeId}`);
  },

  batchSave: (param) => {
    return postRequest('/approvalNode/batchSave', param);
  },
};
