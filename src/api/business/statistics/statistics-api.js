/*
 * 统计 API
 *
 * @Author:    1024创新实验室
 * @Date:      2024-01-01
 * @Copyright  1024创新实验室
 */
import { getRequest } from '/@/lib/axios';

export const statisticsApi = {
  top10Inventory: () => {
    return getRequest('/statistics/top10Inventory');
  },

  purchaseStatistics: (type) => {
    return getRequest(`/statistics/purchase/${type}`);
  },

  outboundStatistics: (type) => {
    return getRequest(`/statistics/outbound/${type}`);
  },

  baseStatistics: () => {
    return getRequest('/statistics/base');
  },
};
