/*
 * 库存管理 API
 *
 * @Author:    1024创新实验室
 * @Date:      2024-01-01
 * @Copyright  1024创新实验室
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const inventoryApi = {
  query: (param) => {
    return postRequest('/inventory/query', param);
  },

  getDetail: (inventoryId) => {
    return getRequest(`/inventory/detail/${inventoryId}`);
  },

  listByMaterial: (materialId) => {
    return getRequest(`/inventory/listByMaterial/${materialId}`);
  },

  add: (param) => {
    return postRequest('/inventory/add', param);
  },

  update: (param) => {
    return postRequest('/inventory/update', param);
  },

  adjust: (param) => {
    return postRequest('/inventory/adjust', param);
  },

  warningList: (warningStatus) => {
    return getRequest('/inventory/warning/list', { warningStatus });
  },

  refreshWarning: () => {
    return getRequest('/inventory/warning/refresh');
  },
};
