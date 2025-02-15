import request from "../request";

export const receiverApi = {
  // 搜索用户
  filterUser(data) {
    return request({
      url: '/receiverManage/filterUser',
      method: 'post',
      data: data
    })
  },
  // 所属用户变更
  changeBelongUser(data) {
    return request({
      url: '/receiverManage/changeBelongUser',
      method: 'post',
      data: data
    })
  }
}
