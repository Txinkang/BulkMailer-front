import request from '../request'
import { testApi } from '../request'

export const emailApi = {
  // 获取邮件任务列表
  filterTask(data) {
    return request({
      url: '/emailManage/filterTask',
      method: 'get',
      params: data
    })
  },
  // 获取邮件详情
  filterEmail(data) {
    return request({
      url: '/emailManage/filterEmail',
      method: 'get',
      params: data
    })
  }
}
