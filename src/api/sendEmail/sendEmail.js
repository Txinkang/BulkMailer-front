import request from "../request";
import {testApi} from "../request";

export const sendEmailApi = {
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
      url: '/customers/filter',
      method: 'post',
      data: data
    })
  },
  // 全选客户
  selectAllCustomer(data) {
    return request({
      url: '/customers/filterAll',
      method: 'post',
      data: data
    })
  },
  // 获取供应商列表
  getSupplier(data) {
    return request({
      url: '/suppliers/filter',
      method: 'post',
      data: data
    })
  },
  // 全选供应商
  selectAllSupplier(data) {
    return request({
      url: '/suppliers/filterAll',
      method: 'post',
      data: data
    })
  },
}
