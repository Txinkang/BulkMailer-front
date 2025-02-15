import request from "../request";

export const supplierApi = {
  // 导入供应商
  importSupplier(file) {
    const formData = new FormData();
    formData.append('file', file);
    return request({
      url: '/supplierManage/importSupplier',
      method: 'post',
      headers: {
        'Content-Type': 'multipart/form-data'  // 设置正确的 Content-Type
      },
      data: formData
    })
  },
  // 创建供应商
  createSupplier(data) {
    return request({
      url: '/supplierManage/createSupplier',
      method: 'post',
      data: data
    })
  },
  // 搜索供应商
  filterSupplier(data) {
    return request({
      url: '/supplierManage/filterSupplier',
      method: 'post',
      data: data
    })
  },
  // 更新供应商
  updateSupplier(data) {
    return request({
      url: '/supplierManage/updateSupplier',
      method: 'post',
      data: data
    })
  },
  // 删除供应商
  deleteSupplier(data) {
    return request({
      url: '/supplierManage/deleteSupplier',
      method: 'post',
      data: data
    })
  },
  // 分配供应商
  assignSupplier(data) {
    return request({
      url: '/supplierManage/assignSupplier',
      method: 'post',
      data: data
    })
  },
  // 获取供应商详情
  assignSupplierDetails(data) {
    return request({
      url: '/supplierManage/assignSupplierDetails',
      method: 'post',
      data: data
    })
  },
  // 批量分配供应商
  allAssignSupplier(data) {
    return request({
      url: '/supplierManage/allAssignSupplier',
      method: 'post',
      data: data
    })
  }
}
