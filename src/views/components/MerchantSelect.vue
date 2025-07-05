<template>
  <el-dialog
    :model-value="modelValue"
    title="选择供应商"
    :width="size"
    append-to-body
    @close="handleCancelClick"
  >
    <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
      <el-form-item label="编号" prop="merchantCode">
        <el-input
          v-model="queryParams.merchantCode"
          placeholder="请输入编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="名称" prop="merchantName">
        <el-input
          v-model="queryParams.merchantName"
          placeholder="请输入名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="企业类型" prop="merchantType">
        <el-select v-model="queryParams.merchantType" placeholder="请选择企业类型" clearable>
          <el-option
            v-for="dict in merchant_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="merchantList"
      border
      class="mt20"
      empty-text="暂无供应商"
      @row-click="handleRowClick"
      highlight-current-row
      :current-row-key="selectedMerchantId"
    >
      <el-table-column label="编号" prop="merchantCode" />
      <el-table-column label="名称" prop="merchantName" />
      <el-table-column label="企业类型" prop="merchantType">
        <template #default="scope">
          <dict-tag :options="merchant_type" :value="scope.row.merchantType"/>
        </template>
      </el-table-column>
      <el-table-column label="级别" prop="merchantLevel" />
      <el-table-column label="联系人" prop="contactPerson" />
      <el-table-column label="备注" prop="remark" />
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

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancelClick">取 消</el-button>
        <el-button type="primary" @click="handleOkClick">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup name="MerchantSelect">
import { listMerchant } from "@/api/wms/merchant";
import { getCurrentInstance, reactive, ref, toRefs, watch } from "vue";

const { proxy } = getCurrentInstance();
const { merchant_type } = proxy.useDict('merchant_type');

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  selectedMerchant: {
    type: Array,
    default: () => []
  },
  size: {
    type: String,
    default: '80%'
  }
});

const emit = defineEmits(['update:modelValue', 'handleOkClick', 'handleCancelClick']);

const merchantList = ref([]);
const loading = ref(true);
const total = ref(0);
const selectedMerchantData = ref(null);
const selectedMerchantId = ref(null);

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    merchantCode: undefined,
    merchantName: undefined,
    merchantType: undefined,
  }
});

const { queryParams } = toRefs(data);

/** 查询供应商列表 */
function getList() {
  loading.value = true;
  listMerchant(queryParams.value).then(response => {
    merchantList.value = response.rows;
    total.value = response.total;
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

/** 行点击事件 */
function handleRowClick(row) {
  selectedMerchantData.value = row;
  selectedMerchantId.value = row.id;
}

/** 确定按钮操作 */
function handleOkClick() {
  if (!selectedMerchantData.value) {
    proxy.$modal.msgError("请选择供应商");
    return;
  }
  emit('handleOkClick', [selectedMerchantData.value]);
}

/** 取消按钮操作 */
function handleCancelClick() {
  emit('update:modelValue', false);
  emit('handleCancelClick');
}

/** 获取列表 */
function getMerchantList() {
  getList();
}

// 暴露方法给父组件
defineExpose({
  getMerchantList
});

// 监听弹窗显示状态
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    getMerchantList();
    // 重置选中状态
    selectedMerchantData.value = null;
    selectedMerchantId.value = null;
  }
});
</script> 