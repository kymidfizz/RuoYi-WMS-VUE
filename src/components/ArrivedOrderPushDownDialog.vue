<template>
  <el-dialog v-model="visible" title="下推到到货单" width="800px">
    <el-form label-width="100px">
      <el-form-item label="采购单号">{{ order.orderNo }}</el-form-item>
      <el-form-item label="供应商">{{ order.merchantName }}</el-form-item>
      <el-form-item label="采购日期">{{ order.purchaseDate }}</el-form-item>
      <!-- 可根据需要添加更多表头字段 -->
    </el-form>
    <el-table :data="details" style="width: 100%; margin-bottom: 20px;">
      <el-table-column label="商品名称" prop="itemName" />
      <el-table-column label="采购数量" prop="quantity" />
      <el-table-column label="到货数量">
        <template #default="{ row }">
          <el-input-number v-model="row.arrivedQuantity" :min="0" :max="row.quantity" />
        </template>
      </el-table-column>
      <!-- 可根据需要添加更多明细字段 -->
    </el-table>
    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定下推</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
const props = defineProps({
  visible: Boolean,
  order: Object,
  details: Array
});
const emit = defineEmits(['update:visible', 'confirm']);

const visible = ref(props.visible);
watch(() => props.visible, v => visible.value = v);
watch(visible, v => emit('update:visible', v));

// 深拷贝明细，避免父组件数据被直接修改
const details = ref([]);
watch(() => props.details, d => {
  details.value = d ? d.map(item => ({ ...item, arrivedQuantity: item.arrivedQuantity ?? item.quantity })) : [];
}, { immediate: true });

const order = ref({});
watch(() => props.order, o => {
  order.value = o ? { ...o } : {};
}, { immediate: true });

function close() {
  visible.value = false;
}

function handleConfirm() {
  // 校验到货数量不能大于采购数量
  for (const item of details.value) {
    if (item.arrivedQuantity > item.quantity) {
      return window.$message?.error?.('到货数量不能大于采购数量！') || alert('到货数量不能大于采购数量！');
    }
  }
  emit('confirm', { ...order.value, details: details.value });
  visible.value = false;
}
</script> 