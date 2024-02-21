// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  return request<{
    data: API.CurrentUser;
  }>('/wcapi/account/currentuser', {
    method: 'GET',
    ...(options || {}),
    credentials: 'include',
    headers: {
      Authorization: 'Basic ' + sessionStorage.getItem('auth')
    },
  });
}

/** 退出登录接口 POST /api/login/outLogin */
export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/wcapi/login/outLogin', {
    method: 'POST',
    ...(options || {}),
    headers: {
      Authorization: 'Basic ' + sessionStorage.getItem('auth')
    },
  });
}

/** 登录接口 POST /api/login/account */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>('/wcapi/login/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    data: body,
    ...(options || {}),
  });
}

export async function getAccounts(params){
  return request('/wcapi/account',{
    params: {...params},
    headers: {
      Authorization: 'Basic ' + sessionStorage.getItem('auth')
    },
  });
}

//根据作品查找对应推荐单位
export async function getTjdwAccount(worksId){
  return request('/wcapi/account/tjdw/works/' + worksId,{
    headers: {
      Authorization: 'Basic ' + sessionStorage.getItem('auth')
    },
  });
}

export async function addAccount(params){
  return request('/wcapi/account', {
    method: 'POST',
    data: params,
    headers: {
      Authorization: 'Basic ' + sessionStorage.getItem('auth')
    },
  })
}

export async function updateAccount(params){
  return request('/wcapi/account', {
    method: 'PUT',
    data: params,
    headers: {
      Authorization: 'Basic ' + sessionStorage.getItem('auth')
    },
  })
}

export async function updateAccountPassword(id, password){
  return request('/wcapi/account/password/'+id, {
    method: 'PUT',
    params: {password},
    headers: {
      Authorization: 'Basic ' + sessionStorage.getItem('auth')
    },
  })
}

export async function deleteAccount(id){
  return request('/wcapi/account/' + id, {
    method: 'DELETE',
    headers: {
      Authorization: 'Basic ' + sessionStorage.getItem('auth')
    },
  })
}


export async function getWorks(params: any){
  return request('/wcapi/works', {
    params: {...params},
    headers: {
      Authorization: 'Basic ' + sessionStorage.getItem('auth')
    },
  });
}

export async function addWorks(params: any){
  return request('/wcapi/works', {
    method: 'POST',
    data: params,
    headers: {
      Authorization: 'Basic ' + sessionStorage.getItem('auth')
    },
  })
}

export async function updateWorks(params: any){
  return request('/wcapi/works/'+params.id, {
    method: 'PUT',
    data: params,
    headers: {
      Authorization: 'Basic ' + sessionStorage.getItem('auth')
    },
  })
}

export async function returnWorks(id: any, returnReason: string){
  return request('/wcapi/works/return/' + id, {
    method: 'PUT',
    params: {'returnReason': returnReason},
    headers: {
      Authorization: 'Basic ' + sessionStorage.getItem('auth')
    },
  })
}

export async function getBrand(params: any){
  return request('/wcapi/brand/', {
    params: {...params},
    headers: {
      Authorization: 'Basic ' + sessionStorage.getItem('auth')
    },
  });
}

export async function addBrand(params: any){
  return request('/wcapi/brand/', {
    method: 'POST',
    data: params,
    headers: {
      Authorization: 'Basic ' + sessionStorage.getItem('auth')
    },
  })
}

export async function updateBrand(params: any){
  return request('/wcapi/brand/' + params.id, {
    method: 'PUT',
    data: params,
    headers: {
      Authorization: 'Basic ' + sessionStorage.getItem('auth')
    },
  })
}

export async function returnBrand(id: any, reason: string){
  return request('/wcapi/brand/return/' + id, {
    method: 'PUT',
    params: {'returnReason': reason},
    headers: {
      Authorization: 'Basic ' + sessionStorage.getItem('auth')
    },
  })
}

export async function getOutstandingPeople(params: any){
  return request('/wcapi/people/', {
    params: {...params},
    headers: {
      Authorization: 'Basic ' + sessionStorage.getItem('auth')
    },
  });
}

export async function addOutstandingPeople(params: any){
  return request('/wcapi/people/', {
    method: 'POST',
    data: params,
    headers: {
      Authorization: 'Basic ' + sessionStorage.getItem('auth')
    },
  })
}

export async function updateOutstandingPeople(params: any){
  return request('/wcapi/people/' + params.id, {
    method: 'PUT',
    data: params,
    headers: {
      Authorization: 'Basic ' + sessionStorage.getItem('auth')
    },
  })
}

export async function returnOutstandingPeople(id: any, returnReason: string){
  return request('/wcapi/people/return/' + id, {
    method: 'PUT',
    params: {'returnReason': returnReason},
    headers: {
      Authorization: 'Basic ' + sessionStorage.getItem('auth')
    },
  })
}

export async function getPopsciMgmt(params: any){
  return request('/wcapi/popsci/', {
    params: {...params},
    headers: {
      Authorization: 'Basic ' + sessionStorage.getItem('auth')
    },
  });
}

export async function addPopsciMgmt(params: any){
  return request('/wcapi/popsci/', {
    method: 'POST',
    data: params,
    headers: {
      Authorization: 'Basic ' + sessionStorage.getItem('auth')
    },
  })
}

export async function updatePopsciMgmt(params: any){
  return request('/wcapi/popsci/' + params.id, {
    method: 'PUT',
    data: params,
    headers: {
      Authorization: 'Basic ' + sessionStorage.getItem('auth')
    },
  })
}

export async function returnPopsciMgmt(id: any, returnReason: string){
  return request('/wcapi/popsci/return/' + id, {
    method: 'PUT',
    params: {'returnReason': returnReason},
    headers: {
      Authorization: 'Basic ' + sessionStorage.getItem('auth')
    },
  })
}

export async function getDict(){
  const dicts = await request('/wcapi/common/dict',{
    headers: {
      Authorization: 'Basic ' + sessionStorage.getItem('auth')
    },
  });
  return dicts;
}

export async function getOrgTypes() {
  return request('/wcapi/common/orgtype', {
    headers: {
      Authorization: 'Basic ' + sessionStorage.getItem('auth')
    },
  })
}

export async function deleteTempFile(filePath: any){
  return request('/wcapi/noauth/deletetempfile', {
    method: 'POST',
    params: {
      filePath
    },
    headers: {
      Authorization: 'Basic ' + sessionStorage.getItem('auth')
    },
  })
}

export async function getStats(params: any){
  return request('/wcapi/stats', {
    params: {...params},
    headers: {
      Authorization: 'Basic ' + sessionStorage.getItem('auth')
    },
  });
}

export const API_UPLOADFILE = "/wcapi/noauth/uploadfile";
export const exportWorksApi = '/wcapi/noauth/exportworksexcel/'; //导出作品
export const exportBrandApi = '/wcapi/noauth/exportbrandexcel/'; //导出
export const exportPeopleApi = '/wcapi/noauth/exportpeopleexcel/'; //导出
export const exportMgmtApi = '/wcapi/noauth/exportmgmtexcel/'; //导出
export const printReccApi = '/wcapi/noauth/print/'; //打印申报表格
export const uploadReccFormApi = '/wcapi/noauth/upload_reccform/'; //上传申报表格
