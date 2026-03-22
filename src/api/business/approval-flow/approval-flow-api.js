/**
 * 审批流程配置表 api 封装
 *
 * @Author:    hyc
 * @Date:      2026-03-22 15:50:20
 * @Copyright  /
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const approvalFlowApi = {

    /**
     * 分页查询  @author  hyc
     */
    queryPage : (param) => {
        return postRequest('/approvalFlow/queryPage', param);
    },

    /**
     * 增加  @author  hyc
     */
    add: (param) => {
        return postRequest('/approvalFlow/add', param);
    },

    /**
     * 修改  @author  hyc
     */
    update: (param) => {
        return postRequest('/approvalFlow/update', param);
    },


    /**
     * 删除  @author  hyc
     */
    delete: (id) => {
        return getRequest(`/approvalFlow/delete/${id}`);
    },

    /**
     * 批量删除  @author  hyc
     */
    batchDelete: (idList) => {
        return postRequest('/approvalFlow/batchDelete', idList);
    },

};
