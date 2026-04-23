/*
 * 项目管理 API
 *
 * @Author:    1024创新实验室
 * @Date:      2024-01-01
 * @Copyright  1024创新实验室
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const projectApi = {
  query: (param) => {
    return postRequest('/project/query', param);
  },

  getDetail: (projectId) => {
    return getRequest(`/project/detail/${projectId}`);
  },

  listAll: () => {
    return getRequest('/project/listAll');
  },

  add: (param) => {
    return postRequest('/project/add', param);
  },

  update: (param) => {
    return postRequest('/project/update', param);
  },

  delete: (projectId) => {
    return getRequest(`/project/delete/${projectId}`);
  },

  updateStatus: (projectId, projectStatus) => {
    return getRequest(`/project/updateStatus/${projectId}/${projectStatus}`);
  },

  outboundMaterials: (projectId) => {
    return getRequest(`/project/outboundMaterials/${projectId}`);
  },
};
