/*
 * 库存管理常量
 *
 * @Author:    1024创新实验室
 * @Date:      2024-01-01
 * @Copyright  1024创新实验室
 */

export const WARNING_STATUS_ENUM = {
  NORMAL: {
    value: 0,
    desc: '正常',
    color: 'green',
  },
  LOW_STOCK: {
    value: 1,
    desc: '库存不足',
    color: 'orange',
  },
  EXPIRING: {
    value: 2,
    desc: '即将过期',
    color: 'gold',
  },
  EXPIRED: {
    value: 3,
    desc: '已过期',
    color: 'red',
  },
};

export const ADJUST_TYPE_ENUM = {
  INBOUND: {
    value: 1,
    desc: '入库',
  },
  OUTBOUND: {
    value: 2,
    desc: '出库',
  },
  CHECK: {
    value: 3,
    desc: '盘点',
  },
};

export default {
  WARNING_STATUS_ENUM,
  ADJUST_TYPE_ENUM,
};
