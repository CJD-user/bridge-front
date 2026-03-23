/*
 * 审批流程常量
 *
 * @Author:    1024创新实验室
 * @Date:      2024-01-01
 * @Copyright  1024创新实验室
 */

export const BUSINESS_TYPE_ENUM = {
  PURCHASE: {
    value: 1,
    desc: '采购申请',
  },
  OUTBOUND: {
    value: 2,
    desc: '出库申请',
  },
};

export const FLOW_STATUS_ENUM = {
  DISABLED: {
    value: 0,
    desc: '停用',
  },
  ENABLED: {
    value: 1,
    desc: '启用',
  },
};

export const APPROVER_TYPE_ENUM = {
  // SPECIFIED: {
  //   value: 1,
  //   desc: '指定人员',
  // },
  // DEPT_LEADER: {
  //   value: 2,
  //   desc: '部门负责人',
  // },
  ROLE: {
    value: 3,
    desc: '角色',
  },
  // SELF_SELECT: {
  //   value: 4,
  //   desc: '发起人自选',
  // },
};

export default {
  BUSINESS_TYPE_ENUM,
  FLOW_STATUS_ENUM,
  APPROVER_TYPE_ENUM,
};
