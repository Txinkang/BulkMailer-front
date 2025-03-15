import request from "../../request";
import {testApi} from "../../request";

export const templateApi = {
  // 查看模板
  checkTemplate(data) {
    return request({
      url: '/emailTemplate/checkTemplate',
      method: 'post',
      data: data
    })
  },
  // 筛选模板
  filterTemplate(data) {
    return request({
      url: '/emailTemplate/filterTemplate',
      method: 'post',
      data: data
    })
  },
  // 保存模板
  saveTemplate(data) {
    return request({
      url: '/emailTemplate/saveTemplate',
      method: 'post',
      data: data
    })
  },
  // 修改模板
  updateTemplate(data) {
    return request({
      url: '/emailTemplate/updateTemplate',
      method: 'post',
      data: data
    })
  },
  // 删除模板
  deleteTemplate(data) {
    return request({
      url: '/emailTemplate/deleteTemplate',
      method: 'delete',
      data: data
    })
  },
  // 分配模板
  assignTemplate(data) {
    return request({
      url: '/emailTemplate/assignTemplate',
      method: 'post',
      data: data
    })
  },
  // 分配模板详情
  assignTemplateDetails(data) {
    return request({
      url: '/emailTemplate/assignTemplateDetails',
      method: 'post',
      data: data
    })
  }
}
