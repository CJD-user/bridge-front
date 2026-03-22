/*
 * 材料分类 API
 *
 * @Author:    1024创新实验室
 * @Date:      2024-01-01
 * @Copyright  1024创新实验室
 */
import { getRequest, postRequest } from '/@/lib/axios';

export const materialCategoryApi = {
  add: (param) => {
    return postRequest('/materialCategory/add', param);
  },

  update: (param) => {
    return postRequest('/materialCategory/update', param);
  },

  getDetail: (materialCategoryId) => {
    return getRequest(`/materialCategory/detail/${materialCategoryId}`);
  },

  queryTree: (param) => {
    return postRequest('/materialCategory/tree', param);
  },

  delete: (materialCategoryId) => {
    return getRequest(`/materialCategory/delete/${materialCategoryId}`);
  },

  updateDisabled: (materialCategoryId, disabledFlag) => {
    return getRequest(`/materialCategory/updateDisabled/${materialCategoryId}`, { disabledFlag });
  },

  listAll: () => {
    return getRequest('/materialCategory/listAll');
  },
};
