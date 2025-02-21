import request, { testApi } from '../request'

export const reportApi = {
  // 获取单任务报表数据
  checkSingleReport(data) {
    return request({
      url: '/reportManage/checkSingleReport',
      method: 'get',
      params: data
    })
  },
  // 获取手动发送报表数据
  checkManualReport(data) {
    return request({
      url: '/reportManage/checkManualReport',
      method: 'get',
      params: data
    })
  }
}
