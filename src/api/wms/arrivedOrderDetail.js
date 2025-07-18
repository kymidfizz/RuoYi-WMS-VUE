import request from '@/utils/request'

// 查询到货单详情列表
export function listArrivedOrderDetail(query) {
  return request({
    url: '/wms/arrivedOrderDetail/list',
    method: 'get',
    params: query
  })
}

// 查询到货单详情详细
export function getArrivedOrderDetail(id) {
  return request({
    url: '/wms/arrivedOrderDetail/' + id,
    method: 'get'
  })
}

// 新增到货单详情
export function addArrivedOrderDetail(data) {
  return request({
    url: '/wms/arrivedOrderDetail',
    method: 'post',
    data: data
  })
}

// 修改到货单详情
export function updateArrivedOrderDetail(data) {
  return request({
    url: '/wms/arrivedOrderDetail',
    method: 'put',
    data: data
  })
}

// 删除到货单详情
export function delArrivedOrderDetail(id) {
  return request({
    url: '/wms/arrivedOrderDetail/' + id,
    method: 'delete'
  })
}

// 查询到货单详情列表
export function listByArrivedOrderId(arrivedOrderId) {
  return request({
    url: '/wms/arrivedOrderDetail/list/' + arrivedOrderId,
    method: 'get'
  })
}

// 根据ID更新到货单详情
export function updateDetailById(id) {
  return request({
    url: '/wms/arrivedOrderDetail/updateDetailById',
    method: 'put',
    data: { id: id }
  })
}
