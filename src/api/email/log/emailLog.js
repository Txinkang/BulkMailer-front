import request from '../../request'

export const emailLogApi = {
  // 查询邮件任务
  searchEmailTask(data) {
    return request({
      url: '/api/email/querylog',
      method: 'get',
      params: data
    })
  },
  // 查询邮件详情
  searchEmailDetail(data) {
    return request({
      url: '/api/email/queryonelog',
      method: 'get',
      params: data
    })
  },
  // 查询未发送邮件
  searchUndeliveredEmail(data) {
    return request({
      url: '/api/email/faillog',
      method: 'get',
      params: data
    })
  }
}
