/*
 * 出库申请常量
 *
 * @Author:    1024创新实验室
 * @Date:      2024-01-01
 * @Copyright  1024创新实验室
 */

export const OUTBOUND_TYPE_ENUM = {
  COLLECTION: {
    value: 1,
    desc: '领用出库',
  },
  TRANSFER: {
    value: 2,
    desc: '调拨出库',
  },
  SCRAP: {
    value: 3,
    desc: '报废出库',
  },
};

export const APPROVAL_STATUS_ENUM = {
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

export const OUTBOUND_STATUS_ENUM = {
  PENDING: {
    value: 0,
    desc: '待审批',
    color: 'default',
  },
  APPROVED: {
    value: 1,
    desc: '已审批待出库',
    color: 'blue',
  },
  COMPLETED: {
    value: 2,
    desc: '已出库',
    color: 'green',
  },
  CANCELLED: {
    value: 3,
    desc: '已作废',
    color: 'red',
  },
};

export const RECORD_APPROVAL_STATUS_ENUM = {
  APPROVED: {
    value: 1,
    desc: '通过',
    color: 'green',
  },
  REJECTED: {
    value: 2,
    desc: '打回',
    color: 'red',
  },
};

export default {
  OUTBOUND_TYPE_ENUM,
  APPROVAL_STATUS_ENUM,
  OUTBOUND_STATUS_ENUM,
  RECORD_APPROVAL_STATUS_ENUM,
};
