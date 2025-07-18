import request from '@/utils/request'

// 查询到货单列表
export function listArrivedOrder(query) {
  return request({
    url: '/wms/arrivedOrder/list',
    method: 'get',
    params: query
  })
}

// 查询到货单详细
export function getArrivedOrder(id) {
  return request({
    url: '/wms/arrivedOrder/' + id,
    method: 'get'
  })
}

// 新增到货单
export function addArrivedOrder(data) {
  return request({
    url: '/wms/arrivedOrder/add',
    method: 'post',
    data: data
  })
}

// 修改到货单
export function updateArrivedOrder(data) {
  return request({
    url: '/wms/arrivedOrder/edit',
    method: 'put',
    data: data
  })
}

// 删除到货单
export function delArrivedOrder(id) {
  return request({
    url: '/wms/arrivedOrder/' + id,
    method: 'delete'
  })
}

// 到货
export function arrived(data) {
  return request({
    url: '/wms/arrivedOrder/arrived',
    method: 'post',
    data: data
  })
}

// 下推采购订单生成到货单
export function pushDownPurchaseOrder(data) {
  return request({
    url: '/wms/arrivedOrder/addByPurchaseOrder',
    method: 'post',
    data
  })
}
