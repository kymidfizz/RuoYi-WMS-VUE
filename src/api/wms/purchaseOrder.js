import request from '@/utils/request'

// 查询采购订单列表
export function listPurchaseOrder(query) {
  return request({
    url: '/wms/purchaseOrder/list',
    method: 'get',
    params: query
  })
}

// 查询采购订单详细
export function getPurchaseOrder(id) {
  return request({
    url: '/wms/purchaseOrder/' + id,
    method: 'get'
  })
}

// 新增采购订单
export function addPurchaseOrder(data) {
  return request({
    url: '/wms/purchaseOrder/add',
    method: 'post',
    data: data
  })
}

// 修改采购订单
export function updatePurchaseOrder(data) {
  return request({
    url: '/wms/purchaseOrder/update',
    method: 'post',
    data: data
  })
}

// 删除采购订单
export function delPurchaseOrder(id) {
  return request({
    url: '/wms/purchaseOrder/update',
    method: 'POST',
    data:{
      id: id,
      isDelete: 0
    }
  })
}

// 执行采购订单
export function warehousing(data) {
  return request({
    url: '/wms/purchaseOrder/warehousing',
    method: 'post',
    data: data
  })
}


