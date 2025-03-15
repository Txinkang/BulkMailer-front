import request from "../request";
import {testApi} from "../request";
export const countryApi = {
  //导入国家
  importCountry(file) {
    const formData = new FormData();
    formData.append('country.csv', file);
    return request({
      url: '/country/importCountry',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 创建国家
  createCountry(data) {
    return request({
      url: '/country/createCountry',
      method: 'post',
      data: data
    })
  },

  // 搜索国家
  filterCountry(data) {
    return request({
      url: '/country/filterCountry',
      method: 'post',
      data: data
    })
  },

  // 修改国家
  updateCountry(data) {
    return request({
      url: '/country/updateCountry',
      method: 'post',
      data: data
    })
  },

  // 删除国家
  deleteCountry(data) {
    return request({
      url: '/country/deleteCountry',
      method: 'post',
      data: data
    })
  }
}
