/*
 * 入库记录常量
 *
 * @Author:    1024创新实验室
 * @Date:      2024-01-01
 * @Copyright  1024创新实验室
 */

export const INBOUND_TYPE_ENUM = {
  PURCHASE: {
    value: 1,
    desc: '采购入库',
  },
  RETURN: {
    value: 2,
    desc: '退货入库',
  },
  OTHER: {
    value: 3,
    desc: '其他',
  },
};

export default {
  INBOUND_TYPE_ENUM,
};
