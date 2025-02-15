const UserConstantData = {
  userRole: 2,
  getUserName: () => localStorage.getItem('user_name') || '',
  title: '易架构',
  companyName: '公司',
  companyId: '1',
  adminLargeName: '大管理员',
  adminSmallName: '小管理员',
  userName: '用户',
}

export default UserConstantData
