/*
 * 库存预警 API
 *
 * @Author:    1024创新实验室
 * @Date:      2024-01-01
 * @Copyright  1024创新实验室
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const inventoryWarningApi = {
  query: (param) => {
    return postRequest('/inventoryWarning/query', param);
  },

  handle: (param) => {
    return postRequest('/inventoryWarning/handle', param);
  },
};
