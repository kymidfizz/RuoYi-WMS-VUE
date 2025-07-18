<template>
  <div class="app-container">
    <el-card>
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
        <el-form-item label="单据状态" prop="receiptOrderStatus">
          <el-radio-group v-model="queryParams.orderStatus" @change="handleQuery">
            <el-radio-button
              :key="-2"
              :label="-2"
            >
              全部
            </el-radio-button>
            <el-radio-button
              v-for="item in order_status"
              :key="item.value"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="到货类型" prop="orderStatus">
          <el-radio-group v-model="queryParams.optType" @change="handleQuery">
            <el-radio-button
              :key="-1"
              :label="-1"
            >
              全部
            </el-radio-button>
            <el-radio-button
              v-for="item in wms_arrived_order_document_type_id"
              :key="item.value"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="订单号" prop="orderNo">
          <el-input
            v-model="queryParams.orderNo"
            placeholder="请输入到货订单号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="到货日期" prop="bizOrderNo">
          <el-date-picker
            v-model="dateValue"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt20">

      <el-row :gutter="10" class="mb8" type="flex" justify="space-between">
        <el-col :span="6"><span style="font-size: large">到货单</span></el-col>
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['wms:receipt:all']"
          >新增</el-button>
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="arrivedOrderList" border class="mt20"
                @expand-change="handleExpandExchange"
                :row-key="getRowKey"
                :expand-row-keys="expandedRowKeys"
                empty-text="暂无到货单"
                cell-class-name="vertical-top-cell"
                @row-click="handleRowClick"
      >
        <el-table-column type="expand">
          <template #default="props">
            <div style="padding: 0 50px 20px 50px">
              <h3>商品明细</h3>
              <el-table :data="props.row.details" v-loading="detailLoading[props.$index]" empty-text="暂无商品明细">
                <el-table-column label="商品编码">
                  <template #default="{ row }">
                    <div>{{ row?.itemSku?.skuCode }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="商品名称">
                  <template #default="{ row }">
                    <a
                      href="javascript:;"
                      class="item-link"
                      style="color: #409EFF; text-decoration: underline; cursor: pointer;"
                      @click.stop.prevent="handleItemClick(row?.itemSku?.id)"
                    >
                      {{ row?.item?.itemName + (row?.item?.itemCode ? ('(' + row?.item?.itemCode + ')') : '') }}
                    </a>
                  </template>
                </el-table-column>
                <el-table-column label="规格名称">
                  <template #default="{ row }">
                    <div>{{ row?.itemSku?.skuName }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="货号" width="120">
                  <template #default="{ row }">
                    <div>{{ row?.artNo || '-' }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="批号" width="120">
                  <template #default="{ row }">
                    <div>{{ row?.batch || '-' }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="实际到货日期">
                  <template #default="{ row }">
                    <div>{{ parseTime(row.arrivedDate, '{yyyy}-{mm}-{dd}') }}</div>
                  </template>
                </el-table-column>

                <el-table-column label="到货状态">
                  <template #default="{ row }">
                    <div>{{ arrivedStatusMap[row.arrivedStatus] }}</div>
                  </template>
                </el-table-column>

                <el-table-column label="入库状态">
                  <template #default="{ row }">
                    <div>{{ receiptStatusMap[row.receiptStatus] }}</div>
                  </template>
                </el-table-column>

                <el-table-column label="数量" prop="quantity" align="right">
                  <template #default="{ row }">
                    <el-statistic :value="Number(row.quantity)" :precision="0"/>
                  </template>
                </el-table-column>
                <el-table-column label="单价(元)" align="right">
                  <template #default="{ row }">
                    <el-statistic v-if="Number(row.price) > 0" :precision="2" :value="Number(row.price)" />
                    <div v-else>-</div>
                  </template>
                </el-table-column>
                <el-table-column label="金额(元)" align="right">
                  <template #default="{ row }">
                    <el-statistic v-if="Number(row.amount) > 0" :precision="2" :value="Number(row.amount)" />
                    <div v-else>-</div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="单号/业务单号" align="left" min-width="120">
          <template #default="{ row }">
            <div>单号：{{ row.orderNo }}</div>
            <div v-if="row.bizOrderNo">业务单号：{{ row.bizOrderNo }}</div>
          </template>
        </el-table-column>
        <el-table-column label="到货日期" align="left">
          <template #default="{ row }">
            <div>{{ parseTime(row.arrivedDate, '{yyyy}-{mm}-{dd}')  }}</div>
          </template>
        </el-table-column>
        <el-table-column label="总数量" align="right" min-width="80">
          <template #default="{ row }">
            <el-statistic :value="Number(row.totalQuantity)" :precision="0"/>
          </template>
        </el-table-column>
        <el-table-column label="总金额(元)" align="right" min-width="100">
          <template #default="{ row }">
            <el-statistic v-if="Number(row.totalAmount) > 0" :precision="2" :value="Number(row.totalAmount)" />
            <div v-else>-</div>
          </template>
        </el-table-column>
        <el-table-column label="单据状态" align="center" prop="orderStatus" width="80">
          <template #default="{ row }">
            <dict-tag :options="order_status" :value="row.orderStatus" />
          </template>
        </el-table-column>
        <el-table-column label="到货类型" align="center" prop="optType" width="100">
          <template #default="{ row }">
            <dict-tag :options="wms_arrived_order_document_type_id" :value="row.optType" />
          </template>
        </el-table-column>
        <el-table-column label="供应商" align="left" prop="merchantId">
          <template #default="{ row }">
            <a
              href="javascript:;"
              class="merchant-link"
              style="color: #409EFF; text-decoration: underline; cursor: pointer;"
              @click.stop.prevent="handleMerchantClick(row.merchantId)"
            >
              {{ useWmsStore().merchantMap.get(row.merchantId)?.merchantName }}
            </a>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" />
        <el-table-column label="操作" align="right" class-name="small-padding fixed-width" width="120">
          <template #default="scope">
            <div>
              <el-popover
                placement="left"
                title="提示"
                :width="300"
                trigger="hover"
                :disabled="scope.row.orderStatus === 0"
                :content="'到货单【' + scope.row.orderNo + '】已' + (scope.row.orderStatus === 0 ? '开立' : '审核') + '，无法修改！' "
              >
                <template #reference>
                  <el-button link type="primary" @click="handleUpdate(scope.row)" v-hasPermi="['wms:arrived:all']" :disabled="[-1, 1].includes(scope.row.orderStatus)">修改</el-button>
                </template>
              </el-popover>
              <el-button link type="primary" @click="handleGoDetail(scope.row)" v-hasPermi="['wms:arrived:query']">{{ expandedRowKeys.includes(scope.row.id) ? '收起' : '查看' }}</el-button>

              <el-button link type="primary" @click="handleAudit(scope.row)" v-hasPermi="['wms:arrived:all']">
                {{ scope.row.orderStatus === 0 ? '审核' : '弃审' }}
              </el-button>

              <el-button link type="primary" @click="handleDelete(scope.row)" v-hasPermi="['wms:arrived:all']" :disabled="scope.row.orderStatus !== 1">下推</el-button>
            </div>
            <div class="mt10">
              <el-popover
                placement="left"
                title="提示"
                :width="300"
                trigger="hover"
                :disabled="[-1, 0].includes(scope.row.orderStatus)"
                :content="'到货单【' + scope.row.orderNo + '】已审核，无法删除！' "
              >
                <template #reference>
                  <el-button link type="danger" @click="handleDelete(scope.row)" v-hasPermi="['wms:arrived:all']" :disabled="scope.row.orderStatus === 1">删除</el-button>
                </template>
              </el-popover>
              <el-button link type="primary" @click="handlePrint(scope.row)" v-hasPermi="['wms:arrived:all']">打印</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-row>
        <pagination
          v-show="total>0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
        />
      </el-row>
    </el-card>
  </div>
</template>

<script setup name="ArrivedOrder">
import {delArrivedOrder, getArrivedOrder, listArrivedOrder, updateArrivedOrder} from "@/api/wms/arrivedOrder";
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {useWmsStore} from "../../../../store/modules/wms";
import {listByArrivedOrderId} from "@/api/wms/arrivedOrderDetail";
import {ElMessageBox} from "element-plus";
import arrivedPanel from "@/components/PrintTemplate/arrived-panel";

const { proxy } = getCurrentInstance();
const {order_status, wms_receipt_status, wms_receipt_type, wms_arrived_order_document_type_id } = proxy.useDict("order_status" ,"wms_receipt_status", "wms_receipt_type" ,"wms_arrived_order_document_type_id");
const arrivedOrderList = ref([]);
const open = ref(false);
const buttonLoading = ref(false);
const loading = ref(true);
const ids = ref([]);
const total = ref(0);
const title = ref("");
// 当前展开集合
const expandedRowKeys = ref([])
// 商品明细table的loading状态集合
const detailLoading = ref([])
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderNo: undefined,
    optType: -1,
    documentTypeId: -1,
    merchantId: undefined,
    bizOrderNo: undefined,
    totalAmount: undefined,
    orderStatus: -2,
  },
});

const { queryParams } = toRefs(data);

/** 查询到货单列表 */
function getList() {
  loading.value = true;
  const query = {...queryParams.value}
  if (query.orderStatus === -2) query.orderStatus = null
  if (query.documentTypeId === -1) query.documentTypeId = null
  if (query.optType === -1) query.optType = null
  listArrivedOrder(query)
    .then(response => {
      arrivedOrderList.value = response.rows;
      total.value = response.total;
      loading.value = false;
    })
    .catch(error => {
      console.error('接口报错', error);
      loading.value = false;
    });
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 新增按钮操作 */
function handleAdd() {
  proxy.$router.push({ path: "/arrivedOrderEdit" });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('确认删除到货单【' + row.orderNo + '】吗？').then(function() {
    loading.value = true;
    delArrivedOrder(_ids).then(() => {
      proxy.$modal.msgSuccess("删除成功");
    }).finally(() => {
      loading.value = false;
      getList();
    });
  })
}

function handleUpdate(row) {
  proxy.$router.push({ path: "/arrivedOrderEdit",  query: { id: row.id } });
}

function handleGoDetail(row) {
  const index = expandedRowKeys.value.indexOf(row.id)
  if (index !== -1) {
    // 收起
    expandedRowKeys.value.splice(index, 1)
  } else {
    // 展开
    expandedRowKeys.value.push(row.id)
    loadArrivedOrderDetail(row)
  }
}

/** 审核*/
function handleAudit(row) {
  const isAudit = row.orderStatus === 0;
  const actionText = isAudit ? '审核' : '弃审';
  const newStatus = isAudit ? 1 : 0;
  proxy.$modal.confirm(`确认${actionText}到货单【${row.orderNo}】吗？`).then(function() {
    loading.value = true;
    updateArrivedOrder({
      id: row.id,
      orderStatus: newStatus
    }).then(() => {
      proxy.$modal.msgSuccess(`${actionText}成功`);
    }).finally(() => {
      loading.value = false;
      getList();
    });
  })
}

// 定义状态映射对象
const arrivedStatusMap = {
  "NOT_ARRIVED": "未到货",
  "PARTIAL_ARRIVED": "部分到货",
  "FULL_ARRIVED": "全部到货",
  "OVER_ARRIVED": "超额到货"
};

const receiptStatusMap = {
  "NOT_RECEIPT": "未入库",
  "PARTIAL_RECEIPT": "部分入库",
  "FULL_RECEIPT": "全部入库",
  "OVER_RECEIPT": "超额入库"
};

/** 导出按钮操作 */
async function handlePrint(row) {
  const res = await getArrivedOrder(row.id)
  const arrivedOrder = res.data
  let table = []
  if (arrivedOrder.details?.length) {
    table = arrivedOrder.details.map(detail => {
      return {
        itemName: detail.item.itemName,
        skuName: detail.itemSku.skuName,
        skuCode: detail.itemSku.skuCode,
        arrivedDate: detail.arrivedDate,
        arrivedStatus: statusMap[detail.arrivedStatus] || "未知状态",
        receiptStatus: detail.receiptStatus,
        quantity: Number(detail.quantity).toFixed(0),
        amount: detail.amount
      }
    })
  }

  const printData = {
    orderNo: arrivedOrder.orderNo,
    sysUserVo: arrivedOrder.sysUserVo,
    sysDeptVo: arrivedOrder.sysDeptVo,
    documentStatus: arrivedOrder.documentStatus,
    arrivedDate: arrivedOrder.arrivedDate,
    documentTypeId: proxy.selectDictLabel(wms_arrived_order_document_type_id.value, arrivedOrder.documentTypeId),
    optType: proxy.selectDictLabel(wms_arrived_order_document_type_id.value, arrivedOrder.documentTypeId),
    orderStatus: proxy.selectDictLabel(order_status.value, arrivedOrder.documentStatus),
    merchantName: useWmsStore().merchantMap.get(arrivedOrder.merchantId)?.merchantName,
    bizOrderNo: arrivedOrder.bizOrderNo,
    warehouseName: useWmsStore().warehouseMap.get(arrivedOrder.warehouseId)?.warehouseName,
    totalQuantity: Number(arrivedOrder.totalQuantity).toFixed(0),
    totalAmount: ((arrivedOrder.totalAmount || arrivedOrder.totalAmount === 0) ? (arrivedOrder.totalAmount + '元') : ''),
    createBy: arrivedOrder.createBy,
    createTime: proxy.parseTime(arrivedOrder.createTime, '{mm}-{dd} {hh}:{ii}'),
    updateBy: arrivedOrder.updateBy,
    updateTime: proxy.parseTime(arrivedOrder.updateTime, '{mm}-{dd} {hh}:{ii}'),
    remark: arrivedOrder.remark,
    table
  }
  let printTemplate = new proxy.$hiprint.PrintTemplate({template: arrivedPanel})
  printTemplate.print(printData, {}, {
    styleHandler: () => {
      return '<link href="https://cyl-press.oss-cn-shenzhen.aliyuncs.com/print-lock.css" media="print" rel="stylesheet">'
    }
  })
}

function handleExpandExchange(value, expandedRows) {
  if (!ifExpand(expandedRows)) {
    return
  }
  expandedRowKeys.value = expandedRows.map(it => it.id)
  loadArrivedOrderDetail(value)
}

function loadArrivedOrderDetail(row) {
  const index = arrivedOrderList.value.findIndex(it => it.id === row.id)
  detailLoading.value[index] = true
  listByArrivedOrderId(row.id).then(res => {
    if (res.data?.length) {
      const details = res.data.map(it => {
        return {
          ...it,
          warehouseName: useWmsStore().warehouseMap.get(it.warehouseId)?.warehouseName,
        }
      })
      arrivedOrderList.value[index].details = details
    }
  }).finally(() => {
    detailLoading.value[index] = false
  })
}

function ifExpand(expandedRows) {
  if (expandedRows.length < expandedRowKeys.value.length) {
    expandedRowKeys.value = expandedRows.map(it => it.id)
    return false;
  }
  return true
}

function handleRowClick(row, column, event) {
  // 如果点击的是操作列（class包含'fixed-width'或点击了el-button），则不展开
  if (
    column &&
    (column.className?.includes('fixed-width') ||
     event?.target?.closest('.el-button'))
  ) {
    return;
  }
  // 如果点击的是商品名称的a标签（item-link）或供应商链接（merchant-link），则不展开/收起
  if (event?.target?.closest('a') &&
      (event?.target?.closest('a').classList.contains('item-link') ||
       event?.target?.closest('a').classList.contains('merchant-link'))) {
    return;
  }
  const index = expandedRowKeys.value.indexOf(row.id)
  if (index !== -1) {
    expandedRowKeys.value.splice(index, 1)
  } else {
    expandedRowKeys.value.push(row.id)
    loadArrivedOrderDetail(row)
  }
}

function handleItemClick(itemId) {
  const obj = { path: `/basic/item`, query: { id: itemId } };
  proxy?.$tab.openPage(obj);
}

function handleMerchantClick(merchantId) {
  const obj = { path: `/basic/merchant`, query: { id: merchantId } };
  proxy?.$tab.openPage(obj);
}

function getRowKey(row) {
  return row.id
}
// onActivated(() => {
//   getList(); // 注释：切换tab时不再自动查询
// });
getList();
</script>
<style lang="scss">
.el-statistic__content {
  font-size: 14px;
}
.el-table .vertical-top-cell {
  vertical-align: top
}
</style>
