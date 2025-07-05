import request from '@/utils/request'

// 查询入库单详情列表
export function listReceiptOrderDetail(query) {
  return request({
    url: '/wms/purchaseOrderDetail/list',
    method: 'get',
    params: query
  })
}

// 查询入库单详情详细
export function getReceiptOrderDetail(id) {
  return request({
    url: '/wms/purchaseOrderDetail/' + id,
    method: 'get'
  })
}

// 新增入库单详情
export function addReceiptOrderDetail(data) {
  return request({
    url: '/wms/purchaseOrderDetail',
    method: 'post',
    data: data
  })
}

// 修改入库单详情
export function updateReceiptOrderDetail(data) {
  return request({
    url: '/wms/purchaseOrderDetail',
    method: 'put',
    data: data
  })
}

// 删除入库单详情
export function delReceiptOrderDetail(id) {
  return request({
    url: '/wms/purchaseOrderDetail/' + id,
    method: 'delete'
  })
}

// 查询入库单详情列表
export function listByReceiptOrderId(receiptOrderId) {
  return request({
    url: '/wms/purchaseOrderDetail/list/' + receiptOrderId,
    method: 'get'
  })
}

// 根据ID更新采购订单详情
export function updateDetailById(id) {
  return request({
    url: '/wms/purchaseOrderDetail/updateDetailById',
    method: 'put',
    data: { id: id }
  })
}
