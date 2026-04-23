/*
 * 库存预警常量
 *
 * @Author:    1024创新实验室
 * @Date:      2024-01-01
 * @Copyright  1024创新实验室
 */

export const WARNING_TYPE_ENUM = {
  LOW_STOCK: {
    value: 1,
    desc: '库存不足',
  },
};

export const WARNING_LEVEL_ENUM = {
  NORMAL: {
    value: 1,
    desc: '一般',
    color: 'orange',
  },
};

export const HANDLE_STATUS_ENUM = {
  UNHANDLED: {
    value: 0,
    desc: '未处理',
    color: 'red',
  },
  HANDLED: {
    value: 1,
    desc: '已处理',
    color: 'green',
  },
  IGNORED: {
    value: 2,
    desc: '已忽略',
    color: 'default',
  },
};

export default {
  WARNING_TYPE_ENUM,
  WARNING_LEVEL_ENUM,
  HANDLE_STATUS_ENUM,
};
