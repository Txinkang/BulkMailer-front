import request from '../../request'

export const undeliveredEmailApi = {
  // 获取未送达邮件列表
  searchUndeliveredEmail(data) {
    return request({
      url: '/undelivered-emails/search',
      method: 'get',
      params: data
    })
  },
  // 发送未送达邮件
  sendUndeliveredEmail(emailId) {
    return request({
      url: `/undelivered-emails/resend-status/${emailId}`,
      method: 'put',
    })
  }
}
