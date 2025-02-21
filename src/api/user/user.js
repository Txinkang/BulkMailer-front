import request from '../request'

export const userApi = {
  // 批量导入用户
  importUser(data) {
    const formData = new FormData();
    formData.append('file', data);
    return request({
      url: '/userManage/importUser',
      method: 'post',
      headers: {
        'Content-Type': 'multipart/form-data'  // 设置正确的 Content-Type
      },
      data: formData
    })
  },
  //创建用户
  createUser(data) {
    return request({
      url: '/userManage/createUser',
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    })
  },
  //搜索用户
  filterUser(data) {
    return request({
      url: '/userManage/filterUser',
      method: 'get',
      params: data
    })
  },
  // 删除用户
  deleteUser(data) {
    return request({
      url: '/userManage/deleteUser',
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      params: data
    })
  },
  //分配用户
  assignUser(data) {
    return request({
      url: '/userManage/assignUser',
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      params: data
    })
  },
  // 用户分配详情
  assignUserDetails(data) {
    return request({
      url: '/userManage/assignUserDetails',
      method: 'get',
      // // headers: {
      // //   'Content-Type': 'application/json'
      // // },
      params: data
    })
  },
  // 查看用户
  checkUser(data) {
    return request({
      url: '/userManage/checkUser',
      method: 'get',
      // headers: {
      //   'Content-Type': 'application/json'
      // },
      params: data
    })
  },
  // 修改用户信息
  updateUserinfo(data) {
    return request({
      url: '/userManage/updateUserinfo',
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    })
  },
  // 获取权限信息
  getAuth() {
    return request({
      url: '/userManage/getAuth',
      method: 'get',
    })
  },
  // 获取用户权限信息
  getUserAuth(data){
    return request({
      url: '/userManage/getUserAuth',
      method: 'get',
      // headers: {
      //   'Content-Type': 'application/json'
      // },
      params: data
    })

  },
  // 修改用户权限
  updateUserAuth(data) {
    return request({
      url: '/userManage/updateUserAuth',
      method: 'post',
      paramsSerializer: {
        indexes: null // 这会将数组转换为 user_auth_id=1&user_auth_id=2 格式
      },
      params: {  // 使用 params 而不是 data
        user_id: data.user_id,
        user_auth_id: data.user_auth_id,  // 数组会自动被正确处理
        user_role: data.user_role
      }
    })
  },



  // 登录
  login(data) {
    return request({
      url: '/user/login',
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    })
  },


  // 登出
  logout() {
    return request({
      url: '/user/logout',
      method: 'get',

    })
  }
}
