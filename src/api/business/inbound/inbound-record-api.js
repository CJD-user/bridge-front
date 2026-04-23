/*
 * 入库记录 API
 *
 * @Author:    1024创新实验室
 * @Date:      2024-01-01
 * @Copyright  1024创新实验室
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const inboundRecordApi = {
  query: (param) => {
    return postRequest('/inboundRecord/query', param);
  },

  add: (param) => {
    return postRequest('/inboundRecord/add', param);
  },
};
