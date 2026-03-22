/*
 * 材料管理 API
 *
 * @Author:    1024创新实验室
 * @Date:      2024-01-01
 * @Copyright  1024创新实验室
 */
import { postRequest, getRequest, getDownload } from '/@/lib/axios';

export const materialApi = {
  query: (param) => {
    return postRequest('/material/query', param);
  },

  getDetail: (materialId) => {
    return getRequest(`/material/detail/${materialId}`);
  },

  add: (param) => {
    return postRequest('/material/add', param);
  },

  update: (param) => {
    return postRequest('/material/update', param);
  },

  delete: (materialId) => {
    return getRequest(`/material/delete/${materialId}`);
  },

  batchDelete: (idList) => {
    return postRequest('/material/batchDelete', idList);
  },

  updateDisabled: (materialId, disabledFlag) => {
    return getRequest(`/material/updateDisabled/${materialId}`, { disabledFlag });
  },

  listAll: () => {
    return getRequest('/material/listAll');
  },

  importMaterial: (file) => {
    return postRequest('/material/import', file);
  },

  exportMaterial: () => {
    return getDownload('/material/export');
  },

  downloadTemplate: () => {
    return getDownload('/material/downloadTemplate');
  },
};
