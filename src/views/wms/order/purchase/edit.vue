<template>
  <div>
    <div class="receipt-order-edit-wrapper app-container" style="margin-bottom: 60px" v-loading="loading">
      <el-card header="采购订单基本信息">
        <el-form label-width="108px" :model="form" ref="receiptForm" :rules="rules">
          <el-row :gutter="24">
            <el-col :span="6">
              <el-form-item label="采购订单号" prop="orderNo">
                <el-input class="w200" v-model="form.orderNo" placeholder="采购订单号" :disabled="form.id"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="采购日期" prop="purchaseDate">
                <el-date-picker
                  v-model="form.purchaseDate"
                  type="date"
                  placeholder="选择日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  :default-value="new Date()"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="采购部门" prop="purchaseDeptId">
                <el-select v-model="form.purchaseDeptId" placeholder="请选择采购部门" filterable clearable>
                  <el-option v-for="dept in deptList" :key="dept.deptId" :label="dept.deptName" :value="dept.deptId" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="采购员" prop="purchaseUser">
                <el-select v-model="form.purchaseUser" placeholder="请选择采购员" filterable clearable>
                  <el-option v-for="user in userList" :key="user.userId" :label="user.nickName || user.userName" :value="user.userId" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="采购类型" prop="optType">
                <el-select v-model="form.optType" placeholder="请选择采购类型" clearable>
                  <el-option
                    v-for="item in wms_purchase_order_document_type_id"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="供应商" prop="merchantId">
                <div class="flex-space-between">
                  <el-input
                    v-model="selectedMerchantName"
                    placeholder="请选择供应商"
                    readonly
                    style="flex: 1; margin-right: 10px;"
                  />
                  <el-button type="primary" plain @click="showSelectMerchant" icon="Search">选择</el-button>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="业务单号" prop="bizOrderNo">
                <el-input v-model="form.bizOrderNo" placeholder="请输入业务单号"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="备注" prop="remark">
                <el-input
                  v-model="form.remark"
                  placeholder="备注...100个字符以内"
                  rows="4"
                  maxlength="100"
                  type="textarea"
                  show-word-limit="show-word-limit"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
                <el-form-item label="总金额" prop="totalAmount">
                <el-input-number style="width:100%" v-model="form.totalAmount" :controls="false" :precision="2" :disabled="true" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="总数量" prop="totalQuantity">
                <el-input-number style="width:100%" v-model="form.totalQuantity" :controls="false" :precision="0" :disabled="true"></el-input-number>
                </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
      <el-card header="商品明细" class="mt10">
        <div class="receipt-order-content">
          <div class="flex-space-between mb8">
            <!--            <div>-->
            <!--              <span>审批 | 一物一码：</span>-->
            <!--              <el-switch-->
            <!--                :before-change="goSaasTip"-->
            <!--                class="mr10 ml10"-->
            <!--                inline-prompt-->
            <!--                size="large"-->
            <!--                v-model="mode"-->
            <!--                :active-value="true"-->
            <!--                :inactive-value="false"-->
            <!--                active-text="开启"-->
            <!--                inactive-text="关闭"-->
            <!--              />-->
            <!--            </div>-->

            <el-button type="primary" plain="plain" size="default" @click="showAddItem" icon="Plus" >添加商品</el-button>

          </div>
          <el-table :data="form.details" border empty-text="暂无商品明细" style="min-width: 100%;">

            <el-table-column
              type="index"
              label="行号"
              width="60"
              align="center"
              :index="indexMethod"
            />
            <el-table-column label="商品信息" prop="itemSku.itemName" width="150">
              <template #default="{ row }">
                <div style="white-space: nowrap;">
                  <a
                    :href="`/basic/item`"
                    style="color: #409EFF; text-decoration: underline; cursor: pointer;"
                    @click.prevent="handleItemClick(row.itemSku.id)"
                  >
                  {{ row.item.itemName + (row.item.itemCode ? ('(' + row.item.itemCode + ')') : '') }}
                  </a>
                </div>
                <div style="white-space: nowrap;" v-if="row.item.itemBrand">品牌：{{ useWmsStore().itemBrandMap.get(row.item.itemBrand).brandName }}</div>
              </template>
            </el-table-column>

            <el-table-column label="规格信息">
              <template #default="{ row }">
                <div>{{ row.itemSku.skuName }}</div>
                <div v-if="row.itemSku.barcode">条码：{{row.itemSku.barcode}}</div>
              </template>
            </el-table-column>

            <el-table-column label="仓库" prop="warehouseId" width="180">
              <template #default="scope">
                <el-select v-model="scope.row.warehouseId" placeholder="请选择仓库" clearable filterable>
                  <el-option v-for="item in useWmsStore().warehouseList" :key="item.id" :label="item.warehouseName" :value="item.id"/>
                </el-select>
              </template>
            </el-table-column>

            <el-table-column label="货号" prop="artNo" width="180">
              <template #default="scope">
                <el-input
                  v-model="scope.row.artNo"
                  placeholder="货号"
                  :min="1"
                  :precision="0"
                ></el-input>
              </template>
            </el-table-column>

            <el-table-column label="批号" prop="batch" width="180">
              <template #default="scope">
                <el-input
                  v-model="scope.row.batch"
                  placeholder="批号"
                  :min="1"
                  :precision="0"
                ></el-input>
              </template>
            </el-table-column>

            <el-table-column label="计划到货日期" prop="arrivedPlanDate" width="180" >
              <template #default="scope">
                <el-date-picker
                  style="width:90%"
                  v-model="scope.row.arrivedPlanDate"
                  placeholder="计划到货日期"
                  :min="1"
                  :precision="0"
                ></el-date-picker>
              </template>
            </el-table-column>

            <el-table-column label="数量" prop="quantity" width="180" >
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.quantity"
                  placeholder="数量"
                  :min="1"
                  :precision="0"
                  :controls="false"
                  @change="handleAutoCalc"
                ></el-input-number>
              </template>
            </el-table-column>
            <el-table-column label="单价" prop="price" width="180">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.price"
                  placeholder="单价"
                  :precision="2"
                  :min="0"
                  :max="2147483647"
                  :controls="false"
                  @change="handleAutoCalc"
                ></el-input-number>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="right" fixed="right">
              <template #default="scope">
                <el-button icon="Delete" type="danger" plain size="small" @click="handleDeleteDetail(scope.row, scope.$index)" link>删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
      <SkuSelect
        ref="skuSelectRef"
        :model-value="skuSelectShow"
        :selected-sku="selectedSku"
        @handleOkClick="handleOkClick"
        @handleCancelClick="skuSelectShow = false"
        :size="'80%'"
      />
      <MerchantSelect
        ref="merchantSelectRef"
        :model-value="merchantSelectShow"
        @handleOkClick="handleMerchantOkClick"
        @handleCancelClick="merchantSelectShow = false"
        :size="'80%'"
      />
    </div>
    <div class="footer-global">
      <div class="btn-box">
        <div>
<!--          <el-button @click="doWarehousing" type="primary" class="ml10">完成采购订单</el-button>-->
<!--          <el-button @click="updateToInvalid" type="danger" v-if="form.id">作废</el-button>-->
        </div>
        <div>
          <el-button @click="save" type="primary">保存</el-button>
          <el-button @click="cancel" class="mr10">取消</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="ReceiptOrderEdit">
import {computed, getCurrentInstance, onMounted, reactive, ref, toRef, toRefs, watch} from "vue";
import {addPurchaseOrder, getPurchaseOrder, updatePurchaseOrder, warehousing} from "@/api/wms/purchaseOrder";
import {ElMessage, ElMessageBox} from "element-plus";
import SkuSelect from "@/views/components/SkuSelect.vue";
import MerchantSelect from "@/views/components/MerchantSelect.vue";
import {useRoute} from "vue-router";
import {useWmsStore} from '@/store/modules/wms'
import { numSub, generateNo } from '@/utils/ruoyi'
import { updateDetailById } from '@/api/wms/purchaseOrderDetail'
import {getWarehouseAndSkuKey} from "@/utils/wmsUtil";
import { listDept } from '@/api/system/dept'
import { listUser } from '@/api/system/user'

const {proxy} = getCurrentInstance();
const { wms_receipt_type } = proxy.useDict("wms_receipt_type");
const { wms_purchase_order_document_type_id } = proxy.useDict("wms_purchase_order_document_type_id");
const selectedSku = ref([])
const mode = ref(false)
const loading = ref(false)
const skuSelectRef = ref(null)
const merchantSelectRef = ref(null)
const deptList = ref([])
const userList = ref([])
const selectedMerchantName = ref('')
const merchantSelectShow = ref(false)
const initFormData = {
  id: undefined,
  orderNo: undefined,
  optType: "1", // 确保是字符串类型
  merchantId: undefined,
  bizOrderNo: undefined,
  totalAmount: undefined,
  orderStatus: 0,
  remark: undefined,
  warehouseId: undefined,
  totalQuantity: 0,
  purchaseDate: undefined,
  purchaseDeptId: undefined,
  purchaseUser: undefined,
  details: [],
}

const data = reactive({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderNo: undefined,
    optType: undefined,
    bizOrderNo: undefined,
    totalAmount: undefined,
    orderStatus: undefined,
    purchaseDate: undefined
  },
  rules: {
    orderNo: [
      {required: true, message: "采购订单号不能为空", trigger: "blur"}
    ],
    arrivedPlanDate: [
      {required: true, message: "计划到货日期不能为空", trigger: "blur"}
    ],
    quantity: [
      {required: true, message: "数量不能为空", trigger: "blur"}
    ],
    purchaseDate: [
      { required: true, message: "采购日期不能为空", trigger: "change" }
    ],
    optType: [
      { required: true, message: "采购类型不能为空", trigger: "change" }
    ],
    merchantId: [
      { required: true, message: "供应商不能为空", trigger: "change" }
    ]
    // warehouseId: [merchantId
    //   {required: true, message: "请选择仓库", trigger: ['blur', 'change']}
    // ]
  }
});
const { form, rules} = toRefs(data);

const cancel = async () => {
  await proxy?.$modal.confirm('确认取消编辑采购订单吗？');
  close()
}
const close = () => {
  const obj = {path: "/purchaseOrder"};
  proxy?.$tab.closeOpenPage(obj);
}
const skuSelectShow = ref(false)

// 选择商品 start
const showAddItem = () => {
  skuSelectRef.value.getList()
  skuSelectShow.value = true
}
// 选择成功
const handleOkClick = (item) => {
  skuSelectShow.value = false
  selectedSku.value = [...item]
  item.forEach((it) => {
    if (!form.value.details.find(detail => detail.itemSku.id === it.id)) {
      form.value.details.push(
        {
          itemSku: it.itemSku,
          item: it.item,
          amount: undefined,
          quantity: it.quantity,
          warehouseId: form.value.warehouseId
        }
      )
    }
  })
}
// 选择商品 end

// 选择供应商 start
const showSelectMerchant = () => {
  merchantSelectRef.value.getMerchantList()
  merchantSelectShow.value = true
}
// 供应商选择成功
const handleMerchantOkClick = (merchants) => {
  merchantSelectShow.value = false
  if (merchants && merchants.length > 0) {
    const merchant = merchants[0] // 只取第一个选中的供应商
    form.value.merchantId = merchant.id
    selectedMerchantName.value = merchant.merchantName
  }
}
// 选择供应商 end

// 初始化receipt-order-form ref
const receiptForm = ref()

const save = async () => {
  await proxy?.$modal.confirm('确认保存采购订单吗？');
  doSave()
}

const getParamsBeforeSave = (orderStatus) => {
  let details = []
  if (form.value.details?.length) {
    details = form.value.details.map((it, idx) => {
      const quantity = Number(it.quantity) || 0;
      const price = Number(it.price) || 0;
      return {
        id: it.id,
        skuId: it.itemSku.id,
        rowNo: idx + 1, // 行号字段名为rowNo
        amount: quantity * price, // 自动计算金额
        price: price,
        quantity: quantity,
        artNo: it.artNo,
        batch: it.batch, // 添加批号字段
        arrivedPlanDate: it.arrivedPlanDate,
        warehouseId: it.warehouseId
      }
    })
  }

  return {
    id: form.value.id,
    orderNo: form.value.orderNo,
    orderStatus,
    optType: form.value.optType, // 改回optType
    merchantId: form.value.merchantId,
    bizOrderNo: form.value.bizOrderNo,
    remark: form.value.remark,
    totalAmount: form.value.totalAmount,
    totalQuantity: form.value.totalQuantity,
    warehouseId: form.value.warehouseId,
    purchaseDate: form.value.purchaseDate,
    deptId: form.value.purchaseDeptId, // 改为deptId
    purchaseUserId: form.value.purchaseUser, // 改为purchaseUserId
    details: details
  }
}

const doSave = async (orderStatus = 0) => {
  //验证receiptForm表单
  receiptForm.value?.validate((valid) => {
    // 校验
    if (!valid) {
      return ElMessage.error('请填写必填项')
    }
    
    // 校验是否有明细
    if (!form.value.details || form.value.details.length === 0) {
      return ElMessage.error('请添加商品明细')
    }
    
    // 采购日期
    const purchaseDate = form.value.purchaseDate
    // 校验明细的计划到货日期
    for (const [index, detail] of form.value.details.entries()) {

      if (!detail.quantity) {
        return ElMessage.error(`第${index + 1}行的数量不能为空`)
      }
      if (!detail.arrivedPlanDate) {
        return ElMessage.error(`第${index + 1}行的计划到货日期不能为空`)
      }
      const planDate = new Date(detail.arrivedPlanDate)
      const purchaseDt = new Date(purchaseDate)
      planDate.setHours(0,0,0,0)
      purchaseDt.setHours(0,0,0,0)
      if (planDate < purchaseDt) {
        return ElMessage.error(`第${index + 1}行的计划到货日期不能早于采购日期`)
      }


    }
    const params = getParamsBeforeSave(orderStatus)
    loading.value = true
    if (params.id) {
      updatePurchaseOrder(params).then((res) => {
        if (res.code === 200) {
          ElMessage.success(res.msg)
          close()
        } else {
          ElMessage.error(res.msg)
        }
      }).finally(() => {
        loading.value = false
      })
    } else {
      addPurchaseOrder(params).then((res) => {
        if (res.code === 200) {
          ElMessage.success(res.msg)
          close()
        } else {
          ElMessage.error(res.msg)
        }
      }).finally(() => {
        loading.value = false
      })
    }
  })
}

const doWarehousing = async () => {
  await proxy?.$modal.confirm('确认保存吗？');
  receiptForm.value?.validate((valid) => {
    // 校验
    if (!valid) {
      return ElMessage.error('请填写必填项')
    }

    if (!form.value.details?.length) {
      return ElMessage.error('请选择商品')
    }
    if (form.value.details?.length) {
      const invalidQuantityList = form.value.details.filter(it => !it.quantity)
      if (invalidQuantityList?.length) {
        return ElMessage.error('请选择数量')
      }
    }
    const params = getParamsBeforeSave(1);
    loading.value = true
    warehousing(params).then((res) => {
      if (res.code === 200) {
        ElMessage.success('采购订成功')
        close()
      } else {
        ElMessage.error(res.msg)
      }
    }).finally(() => {
      loading.value = false
    })
  })
}

const updateToInvalid = async () => {
  await proxy?.$modal.confirm('确认作废采购订单吗？');
  doSave(-1)
}

const route = useRoute();
onMounted(() => {
  listDept().then(res => {
    deptList.value = res.data || res.rows || []
  })
  listUser({}).then(res => {
    userList.value = res.rows || res.data || []
  })
  const id = route.query && route.query.id;
  if (id) {
    loadDetail(id)
  } else {
    generateNo("CG").then(data => {
      if (data.code === 200) {
        form.value.orderNo = data.data.voucherCode;
      }
    });
  }
})

const indexMethod = (index) => index + 1
// 获取采购订单详情
const loadDetail = (id) => {
  loading.value = true
  getPurchaseOrder(id).then((response) => {
    form.value = { ...response.data }
    // 补全采购部门和采购员字段的赋值
    form.value.purchaseDeptId = response.data.sysDeptVo.deptId
    form.value.purchaseUser = response.data.sysUserVo.userId
    // 确保采购类型是字符串类型
    if (response.data.optType !== undefined) {
      form.value.optType = String(response.data.optType)
    }
    // 设置供应商名称
    if (response.data.merchantId) {
      const merchant = useWmsStore().merchantMap.get(response.data.merchantId)
      selectedMerchantName.value = merchant ? merchant.merchantName : ''
    }
    if (response.data.details?.length) {
      selectedSku.value = response.data.details.map(it => {
        return {
          id: it.skuId
        }
      })
    }
    Promise.resolve();
  }).then(() => {
  }).finally(() => {
    loading.value = false
  })
}

const handleChangeQuantity = () => {
  let sum = 0
  form.value.details.forEach(it => {
    if (it.quantity) {
      sum += Number(it.quantity)
    }
  })
  form.value.totalQuantity = sum
}

const handleAutoCalc = () => {
  let totalAmount = 0
  let totalQuantity = 0
  form.value.details.forEach(it => {
    if (it.quantity) {
      totalQuantity += Number(it.quantity)
      }
    if (it.quantity && it.price) {
      totalAmount += Number(it.quantity) * Number(it.price)
    }
  })
  form.value.totalAmount = totalAmount
  form.value.totalQuantity = totalQuantity
}

const handleDeleteDetail = (row, index) => {
  if (row.id) {
    proxy.$modal.confirm('确认删除本条商品明细吗？').then(function () {
      loading.value = true
      return updateDetailById(row.id);
    }).then(() => {
      form.value.details.splice(index, 1)
      proxy.$modal.msgSuccess("删除成功");
      handleAutoCalc();
    }).finally(() => {
      loading.value = false
    });
  } else {
    form.value.details.splice(index, 1)
    handleAutoCalc();
  }
  const indexOfSelected = selectedSku.value.findIndex(it => row.itemSku.id=== it.id)
  selectedSku.value.splice(indexOfSelected, 1)
}
// const goSaasTip = () => {
//   ElMessageBox.alert('如需体验，请在公众号内回复：saas', '请去Saas版本体验', {
//     confirmButtonText: '确定'
//   })
//   return false
// }
function handleItemClick(itemId) {
  const obj = { path: `/basic/item`, query: { id: itemId } };
  proxy?.$tab.openPage(obj);
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/variables.module";

.btn-box {
  width: calc(100% - #{$base-sidebar-width});
  display: flex;
  align-items: center;
  justify-content: space-between;
  float: right;
}
</style>
