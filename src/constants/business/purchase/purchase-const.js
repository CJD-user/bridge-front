/*
 * 采购申请常量
 *
 * @Author:    1024创新实验室
 * @Date:      2024-01-01
 * @Copyright  1024创新实验室
 */

export const PURCHASE_TYPE_ENUM = {
  NORMAL: {
    value: 1,
    desc: '常规采购',
  },
  URGENT: {
    value: 2,
    desc: '紧急采购',
  },
  REPLENISH: {
    value: 3,
    desc: '补货采购',
  },
};

export const PURCHASE_APPROVAL_STATUS_ENUM = {
  DRAFT: {
    value: 0,
    desc: '待提交',
    color: 'default',
  },
  PENDING: {
    value: 1,
    desc: '审批中',
    color: 'orange',
  },
  APPROVED: {
    value: 2,
    desc: '已通过',
    color: 'green',
  },
  REJECTED: {
    value: 3,
    desc: '已驳回',
    color: 'red',
  },
  WITHDRAWN: {
    value: 4,
    desc: '已撤回',
    color: 'default',
  },
};

export default {
  PURCHASE_TYPE_ENUM,
  PURCHASE_APPROVAL_STATUS_ENUM,
};
