import request from "../request";

export const sendEmailApi = {
  useTemplate(params) {
    return request({
      url: '/templates/useTemplate/',
      method: 'get',
      params: params
    })
  }
}
