/**
 * 查询用户信息参数
 */
export interface GetUserOpts {
  id: number
}

/**
 * 用户信息
 */
export interface UserInfo {
  id: number
  user_name: string
  phone: string
  email?: string
}
