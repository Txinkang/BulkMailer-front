import request from '../../request'
import {testApi} from "../../request";

export const undeliveredEmailApi = {
  // 获取未送达邮件列表
  searchUndeliveredEmail(data) {
    return request({
      url: '/emailDetails/undelivered-emails',
      method: 'get',
      params: data
    })
  },
  // 发送未送达邮件
  sendUndeliveredEmail(data) {
    return request({
      url: "/emails/resend",
      method: 'post',
      data: data
    })
  }
}
