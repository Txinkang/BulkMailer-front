import request from "../request";
import {testApi} from "../request";

// 获取区域列表
export const areaApi = {
  // 创建区域
  createArea: (data) => {
    return request({
      url: "/area/createArea",
      method: "post",
      data: data
    });
  },
  // 搜索区域
  filterArea: (data) => {
    return request({
      url: "/area/filterArea",
      method: "post",
      data: data
    });
  },
  // 修改区域
  updateArea: (data) => {
    return request({
      url: "/area/updateArea",
      method: "post",
      data: data
    });
  },
  // 删除区域
  deleteArea: (data) => {
    return request({
      url: "/area/deleteArea",
      method: "post",
      data: data
    });
  },

};
