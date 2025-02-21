import request from '../request'
import {testApi} from '../request'
export const emailTypeApi = {
  // 创建邮件类型
  createEmailType(data) {
    return request({
      url: '/dictionary/createEmailType',
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    })
  },


  // 搜索邮件类型
  filterEmailType(data) {
    return testApi({
      url: '/dictionary/filterEmailType',
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    })
  },

  // 修改邮件类型
  updateEmailType(data) {
    return request({
      url: '/dictionary/updateEmailType',
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    })
  },

  // 删除邮件类型
  deleteEmailType(data) {
    return request({
      url: '/dictionary/deleteEmailType',
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    })
  }
}
