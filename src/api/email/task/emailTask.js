import request from '../../request'
import {testApi} from "../../request";

export const emailTaskApi = {
  // 更新邮件任务状态
  updateStatus(data) {
    return request({
      url: '/emails/update-status',
      method: 'put',
      data: data
    })
  },
  // 更新生日邮件任务状态
  updateBirthdayTaskStatus(data) {
    return request({
      url: '/email-tasks/updateBirth/birth',
      method: 'put',
      data: data
    })
  },
  // 重置邮件
  resetStatus(data) {
    return request({
      url: '/emails/reset-status',
      method: 'put',
      data: data
    })
  },
  // 发送节日邮件
  createFestival(data) {
    return request({
      url: '/email-tasks/createFestival',
      method: 'post',
      data: data
    })
  }
}
