import request from '../../request'

export const emailTaskApi = {
  // 更新邮件任务状态
  updateStatus(data) {
    return request({
      url: '/email-tasks/update-status',
      method: 'put',
      data: data
    })
  },
  // 更新生日邮件任务状态
  updateBirthdayTaskStatus(taskId, data) {
    return request({
      url: `/email-tasks/${taskId}`,  // 路径参数
      method: 'put',
      data: data
    })
  },
  // 重置邮件
  resetStatus(data) {
    return request({
      url: '/email-tasks/reset-status',
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
