import request from "../request";
import {testApi} from "../request";

export const commodityApi = {
  //======================商品======================
  // 导入商品
  importCommodity(file) {
    const formData = new FormData()
    formData.append('commodity.csv', file) //后端接收字段为commodity.csv
    return request({
      url: '/commodity/importCommodity',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'  // 设置正确的 Content-Type
      }
    })
  },
  // 创建商品
  createCommodity(data) {
    return request({
      url: '/commodity/createCommodity',
      method: 'post',
      data: data
    })
  },

  // 搜索商品
  filterCommodity(data) {
    return request({
      url: '/commodity/filterCommodity',
      method: 'post',
      data: data
    })
  },

  // 修改商品
  updateCommodity(data) {
    return request({
      url: '/commodity/updateCommodity',
      method: 'post',
      data: data
    })
  },

  // 删除商品
  deleteCommodity(data) {
    return request({
      url: '/commodity/deleteCommodity',
      method: 'post',
      data: data
    })
  },
  //======================品类======================
  // 导入品类
  importCategory(file) {
    const formData = new FormData()
    formData.append('category.csv', file) //后端接收字段为category.csv
    return request({
      url: '/commodity/importCategory',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'  // 设置正确的 Content-Type
      }
    })
  },

  // 创建品类
  createCategory(data) {
    return request({
      url: '/commodity/createCategory',
      method: 'post',
      data: data
    })
  },

  // 搜索品类
  filterCategory(data) {
    return request({
      url: '/commodity/filterCategory',
      method: 'post',
      data: data
    })
  },

  // 修改品类
  updateCategory(data) {
    return request({
      url: '/commodity/updateCategory',
      method: 'post',
      data: data
    })
  },

  // 删除品类
  deleteCategory(data) {
    return request({
      url: '/commodity/deleteCategory',
      method: 'post',
      data: data
    })
  }
}
