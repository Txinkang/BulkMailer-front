import request from "../request";

export const sendEmailApi = {
  // 使用模板
  useTemplate(template) {
    return request({
      url: `/templates/useTemplate/${template}`,
      method: 'get',
    })
  },
  // 筛选图片
  searchImg(data) {
    return request({
      url: '/imgs/search',
      method: 'get',
      params: data
    })
  },
  // 手动发送邮件
  sendEmail(data) {
    return request({
      url: '/email-tasks/create',
      method: 'post',
      data: data
    })
  },
  // 循环发送邮件
  sendEmailCycle(data) {
    return request({
      url: '/email-tasks/createCycle',
      method: 'post',
      data: data
    })
  },
  // 获取发送条件
  getSendCondition(data) {
    return request({
      url: '/api/send-conditions',
      method: 'get',
      params: data
    })
  },
  // 获取客户列表
  getCustomer(data) {
    return request({
      url: '/customers/search',
      method: 'get',
      params: data
    })
  },
  // 全选客户
  selectAllCustomer(data) {
    return request({
      url: '/customers/search-all',
      method: 'get',
      params: data
    })
  },
  // 获取供应商列表
  getSupplier(data) {
    return request({
      url: '/suppliers/search',
      method: 'get',
      params: data
    })
  },
  // 全选供应商
  selectAllSupplier(data) {
    return request({
      url: '/suppliers/search-all',
      method: 'get',
      params: data
    })
  },
  // 获取模板列表
  getTemplate(data) {
    return request({
      url: '/templates/search',
      method: 'get',
      params: data
    })
  },
  // 获取附件列表
  getAttachment(data) {
    return request({
      url: '/attachments/search',
      method: 'get',
      params: data
    })
  }
}
