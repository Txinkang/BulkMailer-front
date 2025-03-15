import request from '../request'
import {testApi} from '../request'
export const fileApi = {
  //----------------------------------附件----------------------------------
  // 上传附件信息到 ES
  uploadAttachment(data) {
    return request({
      url: '/file/attachment/uploadAttachment',
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    })
  },

  // 搜索附件
  filterAttachment(data) {
    return request({
      url: '/file/attachment/filterAttachment',
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    })
  },

  // 删除附件
  deleteAttachment(data) {
    return request({
      url: '/file/attachment/deleteAttachment',
      method: 'delete',
      data: data
    })
  },

  // 分配附件
  assignAttachment(data) {
    return request({
      url: '/file/attachment/assignAttachment',
      method: 'post',
      data: data
    })
  },

  // 获取附件分配详情
  assignAttachmentDetails(data) {
    return request({
      url: '/file/attachment/assignAttachmentDetails',
      method: 'post',
      data: data
    })
  },

  //----------------------------------图片----------------------------------
  // 上传图片信息到 ES
  uploadImg(data) {
    return request({
      url: '/file/img/uploadImg',
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    })
  },
  // 搜索图片
  filterImg(data) {
    return request({
      url: '/file/img/filterImg',
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    })
  },

  // 删除图片
  deleteImg(data) {
    return request({
      url: '/file/img/deleteImg',
      method: 'delete',
      data: data
    })
  },

  // 分配图片
  assignImg(data) {
    return request({
      url: '/file/img/assignImg',
      method: 'post',
      data: data
    })
  },

  // 获取图片分配详情
  assignImgDetails(data) {
    return request({
      url: '/file/img/assignImgDetails',
      method: 'post',
      data: data
    })
  },

  //----------------------------------分配管理----------------------------------
  // 搜索用户
  filterUser(data) {
    return request({
      url: '/file/filterUser',
      method: 'post',
      data: data
    })
  },

  // 搜索管理员
  filterAdmin(data) {
    return request({
      url: '/file/filterAdmin',
      method: 'post',
      data: data
    })
  }
}
