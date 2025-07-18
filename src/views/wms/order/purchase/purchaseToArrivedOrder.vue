<template>
  <div class="receipt-order-edit-wrapper app-container" v-loading="loading">
    <el-card header="生成到货单">
      <el-form label-width="108px" :model="order" ref="formRef">
        <el-row :gutter="24">
          <el-col :span="6">
            <el-form-item label="采购订单号">
              <el-input v-model="order.orderNo" disabled/>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="采购日期">
              <el-input v-model="order.purchaseDate" disabled/>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="供应商">
              <el-input v-model="order.merchantName" disabled/>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="业务单号">
              <el-input v-model="order.bizOrderNo" disabled/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="6">
            <el-form-item label="总数量">
              <el-input v-model="order.totalQuantity" disabled/>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="总金额">
              <el-input v-model="order.totalAmount" disabled/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注">
              <el-input v-model="order.remark" disabled/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
    <el-card header="商品明细" class="mt10">
      <el-table :data="details" border empty-text="暂无商品明细">
        <el-table-column label="商品编码">
          <template #default="{ row }">
            {{ row.itemSku?.skuCode }}
          </template>
        </el-table-column>
        <el-table-column label="商品名称">
          <template #default="{ row }">
            {{ row.item?.itemName }}
          </template>
        </el-table-column>
        <el-table-column label="规格名称">
          <template #default="{ row }">
            {{ row.itemSku?.skuName }}
          </template>
        </el-table-column>
        <el-table-column label="货号" prop="artNo">
          <template #default="{ row }">
            <el-input v-model="row.artNo"/>
          </template>
        </el-table-column>
        <el-table-column label="批号" prop="batch">
          <template #default="{ row }">
            <el-input v-model="row.batch"/>
          </template>
        </el-table-column>
        <el-table-column label="采购数量" prop="quantity"/>
        <el-table-column label="已到货数量">
          <template #default="{ row }">
            <el-input v-model="row.arrivedQuantity" :disabled="true"/>
          </template>
        </el-table-column>
        <el-table-column label="本次到货数量">
          <template #default="{ row }">
            <el-input
              v-model.number="row.currentArrivedQuantity"
              type="number"
              @input="updateAmount(row)"
              :min="0"
              :max="row.quantity - row.arrivedQuantity"
            />
          </template>
        </el-table-column>
        <el-table-column label="单价(元)">
          <template #default="{ row }">
            <el-input
              v-model.number="row.price"
              type="number"
              @input="updateAmount(row)"
              :min="0"
              step="0.01"
            />
          </template>
        </el-table-column>
        <el-table-column label="金额(元)">
          <template #default="{ row }">
            <el-input v-model="row.amount" :disabled="true"/>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="80">
          <template #default="{ $index }">
            <el-button type="danger" size="small" @click="removeDetail($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <div style="margin-top: 24px; text-align: right">
      <el-button @click="goBack">取消</el-button>
      <el-button type="primary" @click="handlePushDown">生成到货单</el-button>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, getCurrentInstance} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {getPurchaseOrder} from '@/api/wms/purchaseOrder';
import {listByReceiptOrderId} from '@/api/wms/purchaseOrderDetail';
import {pushDownPurchaseOrder} from '@/api/wms/arrivedOrder';
import {useWmsStore} from '@/store/modules/wms';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const order = ref({});
const details = ref([]);
const wmsStore = useWmsStore();
const {proxy} = getCurrentInstance();

onMounted(async () => {
  loading.value = true;
  const id = route.query.id;
  // 获取采购订单表头
  const res = await getPurchaseOrder(id);
  order.value = res.data || {};
  // 通过 merchantId 查 merchantName
  if (order.value.merchantId) {
    const merchant = wmsStore.merchantMap.get(String(order.value.merchantId));
    order.value.merchantName = merchant ? merchant.merchantName : '';
  }
  // 获取明细
  const detailRes = await listByReceiptOrderId(id);
  details.value = (detailRes.data || []).map(item => {
    const arrivedQuantity = item.arrivedQuantity || 0; // 已到货
    const currentArrivedQuantity = 0; // 本次到货
    const price = item.price;
    const amount = Number(((arrivedQuantity + currentArrivedQuantity) * (price || 0)).toFixed(2));
    return {
      ...item,
      arrivedQuantity,
      currentArrivedQuantity,
      amount
    };
  });
  updateAllTotal();
  loading.value = false;
});

function updateAmount(row) {
  const qty = Number(row.arrivedQuantity || 0) + Number(row.currentArrivedQuantity || 0);
  const price = Number(row.price) || 0;
  row.amount = Number((qty * price).toFixed(2));
  updateAllTotal();
}

function updateAllTotal() {
  order.value.totalQuantity = details.value.reduce(
    (sum, d) => sum + Number(d.currentArrivedQuantity || 0), 0
  );
  order.value.totalAmount = details.value.reduce(
    (sum, d) => sum + (Number(d.amount) || 0), 0
  ).toFixed(2);
}

function handlePushDown() {
  for (const item of details.value) {
    if ((Number(item.arrivedQuantity || 0) + Number(item.currentArrivedQuantity || 0)) > item.quantity) {
      proxy.$modal.msgError('到货数量不能大于采购数量！');
      return;
    }
  }
  loading.value = true;
  const detailsToSend = details.value.map(item => ({
    ...item,
    arrivedQuantity: Number(item.arrivedQuantity || 0) + Number(item.currentArrivedQuantity || 0),
    bcArrivedQuantity: Number(item.currentArrivedQuantity || 0), // 新增本次到货数量
  }));
  pushDownPurchaseOrder({ ...order.value, details: detailsToSend })
    .then(() => {
      proxy.$modal.msgSuccess('生成到货单成功！');
      proxy.$tab.closeOpenPage();
      proxy.$tab.openPage({ path: '/arrivedOrder' });
    })
    .catch(() => {
      proxy.$modal.msgError('生成到货单失败！');
    })
    .finally(() => {
      loading.value = false;
    });
}

function goBack() {
  router.back();
}

function removeDetail(index) {
  details.value.splice(index, 1);
  updateAllTotal();
}
</script>

<style scoped>
.mt10 {
  margin-top: 10px;
}
</style>
