<template>
  <div class="company-container">
    <el-tabs>
      <el-tab-pane label="供应商管理">
        <!-- 顶部按钮 -->
        <div class="button-group">
          <el-button type="primary" @click="openCreateSupplierDialog">创建供应商</el-button>
          <el-upload
              action="#"
              :auto-upload="false"
              @change="importSupplier"
              :show-file-list="false"
              accept=".csv"
              class="upload-center"
            >
              <div class="upload-button">
                <el-button>导入</el-button>
              </div>
            </el-upload>
        </div>

        <!-- 搜索框 -->
        <div>
          <el-form style="display: flex;flex-flow: row wrap;margin-bottom: 20px;gap: 10px">
            <el-form-item>
              <el-input v-model="searchSupplierForm.supplierName" placeholder="请搜索供应商名称" clearable style="width:200px;margin-right: 10px">
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-input v-model="searchSupplierForm.contactPerson" placeholder="请搜索联系人" clearable style="width:200px;margin-right: 10px">
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-input v-model="searchSupplierForm.contactWay" placeholder="请搜索联系方式" clearable style="width:200px;margin-right: 10px">
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-input v-model="searchSupplierForm.commodityName" placeholder="请搜索商品名称" clearable style="width:200px;margin-right: 10px">
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-input v-model="searchSupplierForm.email" placeholder="请搜索邮箱" clearable style="width:200px;margin-right: 10px">
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-input v-model="searchSupplierForm.belongUserName" placeholder="请搜索所属用户名称" clearable style="width:200px;margin-right: 10px">
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-input v-model="searchSupplierForm.creatorName" placeholder="请搜索创建人名称" clearable style="width:200px;margin-right: 10px">
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-select
                v-model="searchSupplierForm.supplierCountryId"
                placeholder="请搜索国家名称"
                filterable
                remote
                :remote-method="debouncedSearchCountry"
                clearable
                style="width:200px;margin-right: 10px"
                >
                <el-option
                v-for="country in searchSupplierForm.countryOptions"
                :key="country.country_id"
                :label="country.country_name"
                :value="country.country_id" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select
                v-model="searchSupplierForm.acceptEmailTypeId"
                placeholder="可接受邮件类型(可多选)"
                filterable
                remote
                multiple
                :remote-method="debouncedSearchEmailType"
                clearable
                style="width:200px;margin-right: 10px"
                >
                <el-option
                v-for="emailType in searchSupplierForm.emailTypeOptions"
                :key="emailType.email_type_id"
                :label="emailType.email_type_name"
                :value="emailType.email_type_id" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select v-model="searchSupplierForm.supplierLevel" style="width:200px;margin-right: 10px" clearable placeholder="供应商等级">
                <el-option label="初级" value="1"></el-option>
                <el-option label="中级" value="2"></el-option>
                <el-option label="高级" value="3"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select v-model="searchSupplierForm.tradeType" style="width:200px;margin-right: 10px" clearable placeholder="贸易类型">
                <el-option label="工厂" value="1"></el-option>
                <el-option label="贸易商" value="2"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select v-model="searchSupplierForm.status" style="width:200px;margin-right: 10px" clearable placeholder="分配状态">
                <el-option label="未分配" value="1"></el-option>
                <el-option label="已分配" value="2"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select v-model="searchSupplierForm.sex" style="width:200px;margin-right: 10px" clearable placeholder="性别" >
                <el-option label="男" value="男"></el-option>
                <el-option label="女" value="女"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-date-picker v-model="searchSupplierForm.birth" style="width:200px;margin-right: 10px" type="date" clearable placeholder="请选择出生日期"  />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="searchSupplierClick">搜索</el-button>
              <el-button type="primary" @click="resetSearchSupplier"><el-icon><Refresh /></el-icon></el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 批量分配按钮 -->
        <div style="display: flex;flex-direction: column">
          <div style="display: flex;flex-flow: row wrap;gap: 10px;margin: 0 0 20px 0">
            <el-button type="primary" :disabled="selectedRows.length === 0" @click="openAllAssignSupplierDialog">
              批量分配
            </el-button>
            <el-button type="primary" @click="changeBelongUser">
              所属用户变更
            </el-button>
          </div>

          <!-- 表格 -->
          <div>
            <el-table ref="supplierTableRef" :data="supplierCurrentPageData" border @selection-change="handleSelectionChange" :row-key="row => row.supplier_id" style="width: 1000px">
              <!-- 多选框列 -->
              <el-table-column type="selection" width="55" :reserve-selection="true"></el-table-column>
              <!-- 供应商名称列 -->
              <el-table-column show-overflow-tooltip label="供应商名称" align="left" min-width="200">
                <template #default="{ row }">
                  <span>{{ row.supplier_name }}</span>
                </template>
              </el-table-column>
              <!-- 创建人名称列 -->
              <el-table-column label="创建人名称" prop="creatorName" min-width="150">
                <template #default="{ row }">
                  <span>{{ row.creator_name }}</span>
                </template>
              </el-table-column>
              <!-- 所属用户列 -->
              <el-table-column label="所属用户" prop="user" min-width="150">
                <template #default="{ row }">
                  <span>{{ row.belong_user_name }}</span>
                </template>
              </el-table-column>
              <!-- 状态列 -->
              <el-table-column label="状态" min-width="150">
                <template #default="{ row }">
                <span class="status-text" @click="row.status === supplierStatus.SUPPLIER_STATUS_ASSIGNED && openAssignmentDetails(row)">
                  {{ row.status === supplierStatus.SUPPLIER_STATUS_ASSIGNED ? '已分配' : '未分配' }}
                </span>
                  <el-button
                    size="small"
                    type="primary"
                    @click="openReassignDialog(row)"
                  >
                    {{ row.status === supplierStatus.SUPPLIER_STATUS_ASSIGNED ? '重新分配' : '去分配' }}
                  </el-button>
                </template>
              </el-table-column>
              <!-- 联系人列 -->
              <el-table-column label="联系人" align="left" min-width="100">
                <template #default="{ row }">
                  <span>{{ row.contact_person }}</span>
                </template>
              </el-table-column>
              <!-- 联系方式列 -->
              <el-table-column label="联系方式" align="left" min-width="200">
                <template #default="{ row }">
                  <span>{{ row.contact_way }}</span>
                </template>
              </el-table-column>
              <!-- 商品列 -->
              <el-table-column label="商品列表" min-width="200">
                <template #default="{ row }">
                  <span>共 {{ row.commodity_name.length }} 个商品</span>
                  <el-button
                    size="mini"
                    type="text"
                    @click="checkCommodityList(row, 'commodity_name')">
                    查看
                  </el-button>
                </template>
              </el-table-column>
              <!-- 邮箱列 -->
              <el-table-column label="邮箱列表" min-width="200">
                <template #default="{ row }">
                  <span>共 {{ row.emails.length }} 个邮箱</span>
                  <el-button
                    size="mini"
                    type="text"
                    @click="checkEmailList(row, 'emails')">
                    查看
                  </el-button>
                </template>
              </el-table-column>
              <!-- 供应商等级列 -->
              <el-table-column label="供应商等级" align="left" min-width="100">
                <template #default="{ row }">
                  <span>{{ row.supplier_level === 1 ? '初级' : row.supplier_level === 2 ? '中级' : '高级' }}</span>
                </template>
              </el-table-column>
              <!-- 国家列 -->
              <el-table-column label="国家" align="left" min-width="100">
                <template #default="{ row }">
                  <span>{{ row.supplier_country_name }}</span>
                </template>
              </el-table-column>
              <!-- 贸易类型列 -->
              <el-table-column label="贸易类型" align="left" min-width="100">
                <template #default="{ row }">
                  <span>{{ row.trade_type === 1 ? '工厂' : '贸易商' }}</span>
                </template>
              </el-table-column>
              <!-- 接受邮件类型列 -->
              <el-table-column label="接受邮件类型列表" min-width="200">
                <template #default="{ row }">
                  <span>共 {{ row.accept_email_type_name.length }} 个邮箱类型</span>
                  <el-button
                    size="mini"
                    type="text"
                    @click="checkEmailTypeList(row, 'accept_email_type_name')">
                    查看
                  </el-button>
                </template>
              </el-table-column>
              <!-- 性别列 -->
              <el-table-column label="性别" align="left" min-width="100">
                <template #default="{ row }">
                  <span>{{ row.sex === '男' ? '男' : '女' }}</span>
                </template>
              </el-table-column>
              <!-- 出生日期列 -->
              <el-table-column show-overflow-tooltip label="出生日期" align="left" min-width="200">
                <template #default="{ row }">
                  <span>{{ row.birth }}</span>
                </template>
              </el-table-column>
              <!-- 操作列 -->
              <el-table-column label="操作" align="center" min-width="200">
                <template #default="{ row }">
                  <el-button type="warning" size="small" @click="openUpdateSupplierDialog(row)">修改</el-button>
                  <el-button type="danger" size="small" @click="deleteSupplier(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <!-- 分页 -->
        <div>
            <SmartPagination
            v-model:current-page="supplierPagination.currentPage"
            :server-page-size="supplierPagination.serverPageSize"
            :display-page-size="supplierPagination.displayPageSize"
            :total="supplierPagination.totalItems"
            @load-data="handleSupplierLoadData" />
        </div>
      </el-tab-pane>
    </el-tabs>


    <!-- 创建供应商对话框 -->
    <el-dialog title="创建供应商" v-model="createSupplierDialog" width="40%" :close-on-click-modal="false" @close="closeCreateSupplierDialog">
      <el-form
        label-width="120px"
        :model="createSupplierForm"
        :rules="createSupplierRules"
        ref="createSupplierFormRef"
      >
        <!-- 供应商名称输入框 -->
        <el-form-item label="供应商名称" prop="supplierName">
          <el-input v-model="createSupplierForm.supplierName" placeholder="请输入供应商名称" clearable/>
        </el-form-item>

        <!-- 联系人输入框 -->
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="createSupplierForm.contactPerson" placeholder="请输入联系人" clearable/>
        </el-form-item>

        <!-- 联系方式输入框 -->
        <el-form-item label="联系方式" prop="contactWay">
          <el-input v-model="createSupplierForm.contactWay" placeholder="请输入联系方式" clearable/>
        </el-form-item>

        <el-form-item label="供应商等级" prop="supplierLevel">
          <el-select v-model="createSupplierForm.supplierLevel" placeholder="请选择等级" clearable>
            <el-option label="初级" :value="1"/>
            <el-option label="中级" :value="2"/>
            <el-option label="高级" :value="3"/>
          </el-select>
        </el-form-item>

        <el-form-item label="国家名称" prop="supplierCountryId">
            <el-select
              v-model="createSupplierForm.supplierCountryId"
              placeholder="请搜索国家名称"
              filterable
              remote
              :remote-method="debouncedCreateSearchCountry"
              clearable>

              <el-option
              v-for="country in createSupplierForm.countryOptions"
              :key="country.country_id"
              :label="country.country_name"
              :value="country.country_id" />
            </el-select>
        </el-form-item>

        <el-form-item label="贸易类型" prop="tradeType">
          <el-select v-model="createSupplierForm.tradeType" placeholder="请选择贸易类型" clearable>
            <el-option label="工厂" :value="1"/>
            <el-option label="贸易商" :value="2"/>
          </el-select>
        </el-form-item>

        <!-- 商品选择 -->
        <el-form-item label="经营范围" prop="commodityId">
          <template #default="{ }">
            <span>共 {{ createSupplierForm.commodityId.length }} 个商品</span>
            <el-button
              size="mini"
              type="text"
              @click="createCheckCommodityDialog">
              查看
            </el-button>
            <el-button type="primary" @click="chooseCommodity">添加</el-button>
          </template>
        </el-form-item>


        <!-- 性别 -->
        <el-form-item label="性别" prop="sex">
          <el-select v-model="createSupplierForm.sex" placeholder="请选择性别" clearable>
            <el-option label="男" value="男"/>
            <el-option label="女" value="女"/>
          </el-select>
        </el-form-item>

        <!-- 出生日期 -->
        <el-form-item label="出生日期" prop="birth">
          <el-date-picker
            v-model="createSupplierForm.birth"
            placeholder="请选择出生日期"
            type="date"
           clearable/>
        </el-form-item>

        <!-- 添加邮箱 -->
        <el-form-item
          v-for="(email, index) in createSupplierForm.emails"
          :key="index"
          :label="index === 0 ? '添加邮箱' : ''"
          :prop="'emails.' + index"
          :rules="emailRules"
        >
          <el-input v-model="createSupplierForm.emails[index]" placeholder="请输入邮箱" clearable/>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" plain @click="addEmailInput">
            <el-icon><Plus /></el-icon>
          </el-button>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="closeCreateSupplierDialog">取消</el-button>
        <el-button type="primary" @click="createSupplier">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看列表信息对话框 -->
    <ListDialog :title="详情" v-model="listDialog" :list="listDetails" />

    <!-- 已分配供应商详情弹窗 -->
    <AssignReceiverDetailsDialog
      v-model="assignSupplierDetailsDialog"
      :user_id="selectedUserId"
      :active_name="activeTabName"
    />

    <!-- 去分配/重新分配弹窗 -->
    <AssignReceiverDialog
      v-model="assignSupplierDialogVisible"
      :user_id="selectedUserId"
      :active_tab="activeTabName"
    />

    <!-- 选择经营范围信息框 -->
    <ChooseCommodityDialog
      v-model="chooseCommodityDialog"
      @confirm="handleCommodityConfirm"
    />

    <!-- 修改供应商对话框 -->
    <el-dialog title="修改供应商" v-model="updateSupplierDialog" width="40%" :close-on-click-modal="false" @close="closeUpdateSupplierDialog">
      <el-form
        label-width="120px"
        :model="updateSupplierForm"
      >
        <!-- 供应商名称输入框 -->
        <el-form-item label="供应商名称" prop="supplierName">
          <el-input v-model="updateSupplierForm.supplierName" placeholder="请输入供应商名称" clearable/>
        </el-form-item>

        <!-- 联系人输入框 -->
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="updateSupplierForm.contactPerson" placeholder="请输入联系人" clearable/>
        </el-form-item>

        <!-- 联系方式输入框 -->
        <el-form-item label="联系方式" prop="contactWay">
          <el-input v-model="updateSupplierForm.contactWay" placeholder="请输入联系方式" clearable/>
        </el-form-item>

        <el-form-item label="供应商等级" prop="supplierLevel">
          <el-select v-model="updateSupplierForm.supplierLevel" placeholder="请选择等级" clearable>
            <el-option label="初级" :value="1"/>
            <el-option label="中级" :value="2"/>
            <el-option label="高级" :value="3"/>
          </el-select>
        </el-form-item>

        <el-form-item label="国家名称" prop="supplierCountryId">
            <el-select
              v-model="updateSupplierForm.supplierCountryId"
              placeholder="请搜索国家名称"
              filterable
              remote
              :remote-method="debouncedCreateSearchCountry"
              clearable>

              <el-option
              v-for="country in updateSupplierForm.countryOptions"
              :key="country.country_id"
              :label="country.country_name"
              :value="country.country_id" />
            </el-select>
        </el-form-item>

        <el-form-item label="贸易类型" prop="tradeType">
          <el-select v-model="updateSupplierForm.tradeType" placeholder="请选择贸易类型" clearable>
            <el-option label="工厂" :value="1"/>
            <el-option label="贸易商" :value="2"/>
          </el-select>
        </el-form-item>

        <!-- 商品选择 -->
        <el-form-item label="经营范围" prop="commodityId">
          <template #default="{ }">
            <span>共 {{ updateSupplierForm.commodityId.length }} 个商品</span>
            <el-button
              size="mini"
              type="text"
              @click="createCheckCommodityDialog">
              查看
            </el-button>
            <el-button type="primary" @click="chooseCommodity">添加</el-button>
          </template>
        </el-form-item>


        <!-- 性别 -->
        <el-form-item label="性别" prop="sex">
          <el-select v-model="updateSupplierForm.sex" placeholder="请选择性别" clearable>
            <el-option label="男" value="男"/>
            <el-option label="女" value="女"/>
          </el-select>
        </el-form-item>

        <!-- 出生日期 -->
        <el-form-item label="出生日期" prop="birth">
          <el-date-picker
            v-model="updateSupplierForm.birth"
            placeholder="请选择出生日期"
            type="date"
           clearable/>
        </el-form-item>

        <!-- 添加邮箱 -->
        <el-form-item
          v-for="(email, index) in updateSupplierForm.emails"
          :key="index"
          :label="index === 0 ? '修改邮箱' : ''"
          :prop="'emails.' + index"
          :rules="updateEmailRules"
        >
          <el-input v-model="updateSupplierForm.emails[index]" placeholder="请输入邮箱" clearable/>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" plain @click="addUpdateEmailInput">
            <el-icon><Plus /></el-icon>
          </el-button>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="closeUpdateSupplierDialog">取消</el-button>
        <el-button type="primary" @click="updateSupplier">确定</el-button>
      </template>
    </el-dialog>

    <!-- 批量分配供应商 -->
    <AllAssignReceiverDialog
      v-model="allAssignSupplierDialog"
      :selectedRows="selectedRows"
      :active_tab="activeTabName"
      @clearSelection="clearSelectedRows"
    />

    <!-- 改变所属用户 -->
    <ChangeBelongUserDialog
      v-model="changeBelongUserDialog"
      :active_tab="activeTabName"
    />
  </div>
</template>

<script setup>
import { ref ,computed} from "vue";
import {Plus} from "@element-plus/icons-vue";
import { debounce } from 'lodash';
import {countryApi} from "@/api/dictionary/country.js";
import {errorHandler} from "@/utils/errorHandler.js";
import {supplierApi} from "@/api/receiver/supplier.js";
import ChooseCommodityDialog from "@/components/ChooseCommodityDialog.vue";
import ListDialog from "@/components/ListDialog.vue";
import { ElMessage, ElMessageBox } from 'element-plus';
import {emailTypeApi} from "@/api/dictionary/emailType.js";
import statusData from '@/constants/StatusConstantData.js';
import AssignReceiverDetailsDialog from "@/components/receiver/AssignReceiverDetailsDialog.vue";
import AssignReceiverDialog from "@/components/receiver/AssignReceiverDialog.vue";
import SmartPagination from "@/components/SmartPagination.vue";
import ChangeBelongUserDialog from "@/components/receiver/ChangeBelongUserDialog.vue";
import AllAssignReceiverDialog from "@/components/receiver/AllAssignReceiverDialog.vue";
// ========================= 数据 =========================
const selectedUserId = ref('');
//=============== 创建供应商 ================
// 创建供应商表单数据
const createSupplierForm = ref({
  supplierName: '',
  contactPerson: '',
  contactWay: '',
  supplierLevel: '',
  supplierCountryId: '',
  countryOptions: [],
  tradeType: '',
  commodity: [],
  commodityId: [],
  sex: '',
  birth: '',
  emails: ['']
})
// 创建供应商表单引用
const createSupplierFormRef = ref(null)
// 创建供应商表单规则
const createSupplierRules = {
  supplierName: [
    { required: true, message: '请输入供应商名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  contactPerson: [
    { required: true, message: '请输入联系人', trigger: 'blur' }
  ],
  contactWay: [
    { required: true, message: '请输入联系方式', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  supplierLevel: [
    { required: true, message: '请选择供应商等级', trigger: 'change' }
  ],
  supplierCountryId: [
    { required: true, message: '请选择国家', trigger: 'change' }
  ],
  tradeType: [
    { required: true, message: '请选择贸易类型', trigger: 'change' }
  ],
  commodityId: [
    { required: true, message: '请选择经营范围', trigger: 'change' },
    { type: 'array', min: 1, message: '请至少选择一个经营范围', trigger: 'change' }
  ],
  sex: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  birth: [
    { required: true, message: '请选择出生日期', trigger: 'change' }
  ]
}
// 邮箱验证规则
const emailRules = [
  { required: true, message: '请输入邮箱地址', trigger: 'blur' },
  { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
]

// ============== 搜索供应商 ================
const searchSupplierForm = ref({
  supplierName: '',
  contactPerson: '',
  contactWay: '',
  supplierLevel: null,
  supplierCountryId: '',
  countryOptions: [],
  tradeType: null,
  commodityName: '',
  sex: '',
  birth: '',
  email: '',
  acceptEmailTypeId: [],
  emailTypeOptions: [],
  belongUserName: '',
  creatorName: '',
  status: null,
});
//=============== 修改供应商 ================
const updateSupplierForm = ref({
  supplierName: '',
  contactPerson: '',
  contactWay: '',
  supplierLevel: '',
  supplierCountryId: '',
  countryOptions: [],
  tradeType: '',
  commodity: [],
  commodityId: [],
  sex: '',
  birth: '',
  emails: ['']
})
// 邮箱验证规则
const updateEmailRules = [
  { message: '请输入邮箱地址', trigger: 'blur' },
  { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
]
//=============== 分配用户 ================
// 状态常量
const supplierStatus = statusData;
const activeTabName = "supplier";
// 选中行数据
const selectedRows = ref([]);
const supplierTableRef = ref(null)

// ========================= 分页 =========================
const supplierPagination = ref({
  currentPage: 1,
  serverPage: 1,
  displayPageSize: 5,
  serverPageSize: 10,
  totalItems: 0,
  cachedData: new Map()
});
const supplierCurrentPageData = computed(() => {
  const displayPageSize = supplierPagination.value.displayPageSize  // 10
  const serverPageSize = supplierPagination.value.serverPageSize  // 20
  const pagesPerServerPage = serverPageSize / displayPageSize  // 2

  // 计算当前服务器页码
  const serverPage = Math.floor((supplierPagination.value.currentPage - 1) / pagesPerServerPage) + 1
  // 获取当前服务器页的数据
  const currentServerData = supplierPagination.value.cachedData.get(serverPage) || []
  // 计算在当前服务器页内的偏移量
  const offset = ((supplierPagination.value.currentPage - 1) % pagesPerServerPage) * displayPageSize
  return currentServerData.slice(offset, offset + displayPageSize)
});
const handleSupplierLoadData = async (serverPage) => {
  console.log("商品分页组件计算出的页码：",serverPage);
  if(supplierPagination.value.cachedData.has(serverPage)){
    console.log("使用缓存数据，页码：", serverPage);
    return
  }
  supplierPagination.value.serverPage = serverPage
  await searchSupplier()

}
const clearSupplierCache = () => {
  supplierPagination.value.currentPage = 1;
  supplierPagination.value.serverPage = 1;
  supplierPagination.value.cachedData.clear();
  supplierPagination.value.totalItems = 0;
}
// =================================== 功能 ===================================
// 导入供应商
const importSupplier = async (file) => {
  try {
    console.log("导入供应商", file.raw);
    const res = await supplierApi.importSupplier(file.raw)
    if (res.code === 200) {
      ElMessageBox.alert(
        `导入供应商成功:
        成功${res.data}条。
        \n如果有数据导入失败，原因可能为：格式不准确`,
        '导入结果',
        {
          type: 'success',
          confirmButtonText: '确定'
        }
      )
      console.log("导入供应商成功", res);
    } else {
      errorHandler.showError("导入供应商失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("导入供应商失败,请重试", error);
  }
}
// 创建供应商
const createSupplier = async () => {
  try {
    if (!createSupplierFormRef.value) return
    await createSupplierFormRef.value.validate(async (valid) => {
      if (valid) {
        // 提交逻辑
        const requestData = {
          supplierName: createSupplierForm.value.supplierName,
          contactPerson: createSupplierForm.value.contactPerson,
          contactWay: createSupplierForm.value.contactWay,
          supplierLevel: Number(createSupplierForm.value.supplierLevel),
          supplierCountryId: createSupplierForm.value.supplierCountryId,
          tradeType: Number(createSupplierForm.value.tradeType),
          commodityId: createSupplierForm.value.commodityId,
          sex: createSupplierForm.value.sex,
          birth: createSupplierForm.value.birth ? formatDate(createSupplierForm.value.birth) : '',
          emails: createSupplierForm.value.emails,
        }
        console.log("创建供应商请求数据", requestData);
        const res = await supplierApi.createSupplier(requestData)
        if (res.code === 200) {
          ElMessage.success("创建供应商成功");
          console.log("创建供应商成功", res);
          closeCreateSupplierDialog()
        } else {
          errorHandler.showError("创建供应商失败,请重试", res);
        }
      }
    })
  } catch (error) {
    errorHandler.showError("创建供应商失败,请重试", error);
  }
}
// 搜索供应商点击事件
const searchSupplierClick = () => {
  clearSupplierCache()
  searchSupplier()
}
// 搜索供应商重置
const resetSearchSupplier = () => {
  searchSupplierForm.value = {
    supplierName: '',
    contactPerson: '',
    contactWay: '',
    supplierLevel: null,
    supplierCountryId: '',
    tradeType: null,
    commodityName: '',
    sex: '',
    birth: '',
    email: '',
    acceptEmailTypeId: [],
    belongUserName: '',
    creatorName: '',
    status: null,
  }
  clearSupplierCache()
  clearSelectedRows()
}
// 搜索供应商
const searchSupplier = async () => {
  try {
    const requestData = {
      supplierName: searchSupplierForm.value.supplierName,
      contactPerson: searchSupplierForm.value.contactPerson,
      contactWay: searchSupplierForm.value.contactWay,
      supplierLevel: Number(searchSupplierForm.value.supplierLevel),
      supplierCountryId: searchSupplierForm.value.supplierCountryId,
      tradeType: Number(searchSupplierForm.value.tradeType),
      commodityName: searchSupplierForm.value.commodityName,
      sex: searchSupplierForm.value.sex,
      birth: searchSupplierForm.value.birth ? formatDate(searchSupplierForm.value.birth) : '',
      email: searchSupplierForm.value.email,
      acceptEmailTypeId: searchSupplierForm.value.acceptEmailTypeId,
      belongUserName: searchSupplierForm.value.belongUserName,
      creatorName: searchSupplierForm.value.creatorName,
      status: Number(searchSupplierForm.value.status),
      pageNum: supplierPagination.value.serverPage,
      pageSize: supplierPagination.value.serverPageSize,
    }
    console.log("搜索供应商请求数据", requestData);
    const res = await supplierApi.filterSupplier(requestData)
    if (res.code === 200) {
      console.log("搜索供应商成功", res);
      supplierPagination.value.totalItems = res.data.total_items
      supplierPagination.value.cachedData.set(supplierPagination.value.serverPage, res.data.data)
    } else {
      errorHandler.showError("搜索供应商失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索供应商失败,请重试", error);
  }
}

// 更新供应商
const updateSupplier = async () => {
  try {
    const requestData = {
      supplierId: selectedUserId.value,
      supplierName: updateSupplierForm.value.supplierName,
      contactPerson: updateSupplierForm.value.contactPerson,
      contactWay: updateSupplierForm.value.contactWay,
      supplierLevel: Number(updateSupplierForm.value.supplierLevel),
      supplierCountryId: updateSupplierForm.value.supplierCountryId,
      tradeType: Number(updateSupplierForm.value.tradeType),
      commodityId: updateSupplierForm.value.commodityId,
      sex: updateSupplierForm.value.sex,
      birth: updateSupplierForm.value.birth ? formatDate(updateSupplierForm.value.birth) : '',
      emails: updateSupplierForm.value.emails[0] === '' ? updateSupplierForm.value.emails : updateSupplierForm.value.emails,
    }
    console.log("更新供应商请求数据", requestData);
    const res = await supplierApi.updateSupplier(requestData)
    if (res.code === 200) {
      ElMessage.success("更新供应商成功");
      console.log("更新供应商响应数据", res);
      closeUpdateSupplierDialog()
      updateSupplierDialog.value = false;
    } else {
      errorHandler.showError("更新供应商失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("更新供应商失败,请重试", error);
  }
}

// 删除供应商
const deleteSupplier = async (row) => {
  try {
    const requestData = {
      supplierId: row.supplier_id,
    }
    console.log("删除供应商请求数据", requestData);
    const res = await supplierApi.deleteSupplier(requestData)
    if (res.code === 200) {
      ElMessage.success("删除供应商成功");
      console.log("删除供应商响应数据", res);
      // 将供应商数据从缓存中删除
      const currentData = supplierPagination.value.cachedData.get(supplierPagination.value.serverPage)
      supplierPagination.value.cachedData.set(
        supplierPagination.value.serverPage,
        currentData.filter(item => item.supplier_id !== row.supplier_id)
      )
      supplierPagination.value.totalItems = supplierPagination.value.totalItems - 1
      console.log("供应商数据缓存", supplierPagination.value.cachedData.get(supplierPagination.value.serverPage));
    } else {
      errorHandler.showError("删除供应商失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("删除供应商失败,请重试", error);
  }
}
// ========================= 对话框控制 =========================
const createSupplierDialog = ref(false);
const updateSupplierDialog = ref(false);
const chooseCommodityDialog = ref(false);
const listDialog = ref(false);
const listDetails = ref([]);
const assignSupplierDetailsDialog = ref(false);
const assignSupplierDialogVisible = ref(false);
const allAssignSupplierDialog = ref(false);
const changeBelongUserDialog = ref(false);

// ========================= 对话框操作 =========================
//===============打开对话框===============
// 创建供应商对话框
const openCreateSupplierDialog = () => {
  createSupplierDialog.value = true;
};
// 更新供应商对话框
const openUpdateSupplierDialog = (row) => {
  selectedUserId.value = row.supplier_id
  updateSupplierDialog.value = true;
};
// 创建供应商查看经营范围
const createCheckCommodityDialog = () => {
  listDialog.value = true;
  listDetails.value = createSupplierForm.value.commodity.map(item => item.commodity_name);
}
// 查看供应商商品列表
const checkCommodityList = (row,column) => {
  listDialog.value = true;
  listDetails.value = row[column];
}
// 查看供应商邮箱列表
const checkEmailList = (row,column) => {
  listDialog.value = true;
  listDetails.value = row[column];
}
// 查看供应商邮箱类型列表
const checkEmailTypeList = (row,column) => {
  listDialog.value = true;
  listDetails.value = row[column];
}
// 分配对话框
const openReassignDialog = (row) => {
  selectedUserId.value = row.supplier_id
  assignSupplierDialogVisible.value = true;
};
// 分配详情对话框
const openAssignmentDetails = (row) => {
  selectedUserId.value = row.supplier_id;
  assignSupplierDetailsDialog.value = true;
};
// 批量分配供应商
const openAllAssignSupplierDialog = () => {
  allAssignSupplierDialog.value = true;
  console.log("批量分配供应商选中供应商id", selectedRows.value);
}
// 改变所属用户
const changeBelongUser = () => {
  changeBelongUserDialog.value = true;
}


//===============关闭对话框===============
// 创建供应商对话框
const closeCreateSupplierDialog = () => {
  createSupplierFormRef.value.resetFields();
  createSupplierForm.value = {
    supplierName: '',
    contactPerson: '',
    contactWay: '',
    supplierLevel: '',
    supplierCountryId: '',
    tradeType: '',
    commodity: [],
    commodityId: [],
    sex: '',
    birth: '',
    emails: ['']
  };
  createSupplierDialog.value = false;
};
// 更新供应商对话框
const closeUpdateSupplierDialog = () => {
  updateSupplierForm.value = {
    supplierName: '',
    contactPerson: '',
    contactWay: '',
    supplierLevel: '',
    supplierCountryId: '',
    tradeType: '',
    commodity: [],
    commodityId: [],
    sex: '',
    birth: '',
    emails: ['']
  };
  updateSupplierDialog.value = false;
}
// ========================= 其它功能 =========================
// 格式化日期
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
// 添加邮箱输入框
const addEmailInput = () => {
  createSupplierForm.value.emails.push('')
}
const addUpdateEmailInput = () => {
  updateSupplierForm.value.emails.push('')
}
// 选择商品
const chooseCommodity = () => {
  chooseCommodityDialog.value = true;
};
//子组件搜索商品回调函数
const handleCommodityConfirm = async (selectedCommodities, selectedIds) => {
  createSupplierForm.value.commodity = selectedCommodities;
  createSupplierForm.value.commodityId = selectedIds;
  console.log("创建供应商选择商品", createSupplierForm.value.commodity, createSupplierForm.value.commodityId);
}
// 处理表格选中变化
const handleSelectionChange = (rows) => {
  selectedRows.value = rows.map(row => row.supplier_id)
}
const clearSelectedRows = () => {
  supplierTableRef.value.clearSelection()
  selectedRows.value = []
}

//======================输入框搜索事件======================
// 创建供应商选择国家
const chooseCreateCountry = async (query) => {
  try {
    const requestData = {
      country_name: query,
      country_code: '',
      page_num: 1,
      page_size: 5
    }
    console.log("搜索国家请求数据", requestData);
    const res = await countryApi.filterCountry(requestData)
    if (res.code === 200) {
      // 将国家数据缓存
      createSupplierForm.value.countryOptions = res.data.country
      console.log("创建供应商选择国家响应数据", res);
      console.log("创建供应商选择国家缓存数据", createSupplierForm.value.countryOptions);
    } else {
      errorHandler.showError("搜索国家失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索国家失败,请重试", error);
  }
}
const debouncedCreateSearchCountry = debounce(chooseCreateCountry, 500)

// 搜索供应商选择国家
const chooseSearchCountry = async (query) => {
  try {
    const requestData = {
      country_name: query,
      country_code: '',
      page_num: 1,
      page_size: 10
    }
    console.log("搜索国家请求数据", requestData);
    const res = await countryApi.filterCountry(requestData)
    if (res.code === 200) {
      // 将国家数据缓存
      searchSupplierForm.value.countryOptions = res.data.country
      console.log("搜索供应商选择国家响应数据", res);
      console.log("搜索供应商选择国家缓存数据", searchSupplierForm.value.countryOptions);
    } else {
      errorHandler.showError("搜索国家失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索国家失败,请重试", error);
  }
}
const debouncedSearchCountry = debounce(chooseSearchCountry, 500)

// 搜索供应商选择可接受邮件类型
const chooseSearchEmailType = async (query) => {
  try {
    const requestData = {
      email_type_name: query,
      page_num: 1,
      page_size: 30
    }
    console.log("搜索可接受邮件类型请求数据", requestData);
    const res = await emailTypeApi.filterEmailType(requestData)
    if (res.code === 200) {
      searchSupplierForm.value.emailTypeOptions = res.data.email_type
      console.log("搜索供应商选择可接受邮件类型响应数据", res);
      console.log("搜索供应商选择可接受邮件类型缓存数据", searchSupplierForm.value.emailTypeOptions);
    } else {
      errorHandler.showError("搜索可接受邮件类型失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索可接受邮件类型失败,请重试", error);
  }
}
const debouncedSearchEmailType = debounce(chooseSearchEmailType, 500)



</script>

<style scoped>
.company-container {
  padding: 20px;
}

.button-group{
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  margin-top: 30px;
  margin-bottom: 30px;
  gap: 20px;
}

.upload-center :deep(.el-upload) {
  /* 让 el-upload 的内部容器占满宽度 */
  display: block;
  width: 100%;
}

.upload-button {
  /* 让按钮容器居中 */
  display: flex;
  justify-content: center;
}

.status-text {
  color: blue;
  cursor: pointer;
  margin-right: 5px;
}

.user-assign-section {
  margin-top: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.menu-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.menu-item {
  flex: 1;
  margin: 0 10px;
}

.department-pagination {
  margin-top: 10px;
  text-align: right;
}
</style>
