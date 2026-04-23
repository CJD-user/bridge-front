/*
 * 项目管理常量
 *
 * @Author:    1024创新实验室
 * @Date:      2024-01-01
 * @Copyright  1024创新实验室
 */

export const PROJECT_TYPE_ENUM = {
  BRIDGE: {
    value: 1,
    desc: '桥梁工程',
  },
  ROAD: {
    value: 2,
    desc: '道路工程',
  },
  TUNNEL: {
    value: 3,
    desc: '隧道工程',
  },
  OTHER: {
    value: 4,
    desc: '其他',
  },
};

export const PROJECT_STATUS_ENUM = {
  PREPARING: {
    value: 0,
    desc: '筹备中',
    color: 'default',
  },
  IN_PROGRESS: {
    value: 1,
    desc: '进行中',
    color: 'blue',
  },
  COMPLETED: {
    value: 2,
    desc: '已完工',
    color: 'green',
  },
  PAUSED: {
    value: 3,
    desc: '已暂停',
    color: 'orange',
  },
  CANCELLED: {
    value: 4,
    desc: '已取消',
    color: 'red',
  },
};

export default {
  PROJECT_TYPE_ENUM,
  PROJECT_STATUS_ENUM,
};
