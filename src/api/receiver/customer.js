import request from "../request";

export const customerApi = {
  // 导入客户
  importCustomer(file) {
    const formData = new FormData();
    formData.append('file', file);
    return request({
      url: '/customerManage/importCustomer',
      method: 'post',
      headers: {
        'Content-Type': 'multipart/form-data'  // 设置正确的 Content-Type
      },
      data: formData
    })
  },
  // 创建客户
  createCustomer(data) {
    return request({
      url: '/customerManage/createCustomer',
      method: 'post',
      data: data
    })
  },
  // 搜索客户
  filterCustomer(data) {
    return request({
      url: '/customerManage/filterCustomer',
      method: 'post',
      data: data
    })
  },
  // 更新客户
  updateCustomer(data) {
    return request({
      url: '/customerManage/updateCustomer',
      method: 'post',
      data: data
    })
  },
  // 删除客户
  deleteCustomer(data) {
    return request({
      url: '/customerManage/deleteCustomer',
      method: 'post',
      data: data
    })
  },
  // 分配客户
  assignCustomer(data) {
    return request({
      url: '/customerManage/assignCustomer',
      method: 'post',
      data: data
    })
  },
  // 获取客户详情
  assignCustomerDetails(data) {
    return request({
      url: '/customerManage/assignCustomerDetails',
      method: 'post',
      data: data
    })
  },
  // 批量分配客户
  allAssignCustomer(data) {
    return request({
      url: '/customerManage/allAssignCustomer',
      method: 'post',
      data: data
    })
  }
}
