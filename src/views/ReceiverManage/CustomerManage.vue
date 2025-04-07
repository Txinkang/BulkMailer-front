<template>
  <div class="company-container">
    <el-tabs>
      <el-tab-pane label="客户管理">
        <!-- 顶部按钮 -->
        <div class="button-group">
          <el-button type="primary" @click="openCreateCustomerDialog">创建客户</el-button>
          <el-upload
              action="#"
              :auto-upload="false"
              @change="importCustomer"
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
              <el-input v-model="searchCustomerForm.customerName" placeholder="请搜索客户名称" clearable style="width:200px;margin-right: 10px">
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-input v-model="searchCustomerForm.contactPerson" placeholder="请搜索联系人" clearable style="width:200px;margin-right: 10px">
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-input v-model="searchCustomerForm.contactWay" placeholder="请搜索联系方式" clearable style="width:200px;margin-right: 10px">
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-input v-model="searchCustomerForm.commodityName" placeholder="请搜索商品名称" clearable style="width:200px;margin-right: 10px">
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-input v-model="searchCustomerForm.email" placeholder="请搜索邮箱" clearable style="width:200px;margin-right: 10px">
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-input v-model="searchCustomerForm.belongUserName" placeholder="请搜索所属用户名称" clearable style="width:200px;margin-right: 10px">
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-input v-model="searchCustomerForm.creatorName" placeholder="请搜索创建人名称" clearable style="width:200px;margin-right: 10px">
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-select
                v-model="searchCustomerForm.customerCountryId"
                placeholder="请搜索国家名称"
                filterable
                remote
                :remote-method="debouncedSearchCountry"
                clearable
                style="width:200px;margin-right: 10px"
                >
                <el-option
                v-for="country in searchCustomerForm.countryOptions"
                :key="country.country_id"
                :label="country.country_name"
                :value="country.country_id" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select
                v-model="searchCustomerForm.noAcceptEmailTypeId"
                placeholder="不可接受邮件类型(可多选)"
                filterable
                remote
                multiple
                :remote-method="debouncedSearchEmailType"
                clearable
                style="width:200px;margin-right: 10px"
                >
                <el-option
                v-for="emailType in searchCustomerForm.emailTypeOptions"
                :key="emailType.email_type_id"
                :label="emailType.email_type_name"
                :value="emailType.email_type_id" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select v-model="searchCustomerForm.customerLevel" style="width:200px;margin-right: 10px" clearable placeholder="客户等级">
                <el-option label="初级" value="1"></el-option>
                <el-option label="中级" value="2"></el-option>
                <el-option label="高级" value="3"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select v-model="searchCustomerForm.tradeType" style="width:200px;margin-right: 10px" clearable placeholder="贸易类型">
                <el-option label="工厂" value="1"></el-option>
                <el-option label="贸易商" value="2"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select v-model="searchCustomerForm.status" style="width:200px;margin-right: 10px" clearable placeholder="分配状态">
                <el-option label="未分配" value="1"></el-option>
                <el-option label="已分配" value="2"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select v-model="searchCustomerForm.sex" style="width:200px;margin-right: 10px" clearable placeholder="性别" >
                <el-option label="男" value="男"></el-option>
                <el-option label="女" value="女"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-date-picker v-model="searchCustomerForm.birth" style="width:200px;margin-right: 10px" type="date" clearable placeholder="请选择出生日期"  />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="searchCustomerClick">搜索</el-button>
              <el-button type="primary" @click="resetSearchCustomer"><el-icon><Refresh /></el-icon></el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 批量分配按钮、表格 -->
        <div style="display: flex;flex-direction: column">
          <!-- 批量分配按钮 -->
          <div style="display: flex;flex-flow: row wrap;gap: 10px;margin: 0 0 20px 0">
            <el-button type="primary" :disabled="selectedRows.length === 0" @click="openAllAssignCustomerDialog">
              批量分配
            </el-button>
            <el-button type="primary" @click="changeBelongUser">
              所属用户变更
            </el-button>
          </div>

          <!-- 表格 -->
          <div>
            <el-table ref="customerTableRef" :data="customerCurrentPageData" border @selection-change="handleSelectionChange" :row-key="row => row.customer_id" style="width: 1200px">
              <!-- 多选框列 -->
              <el-table-column type="selection" width="55" :reserve-selection="true"></el-table-column>
              <!-- 客户名称列 -->
              <el-table-column show-overflow-tooltip label="客户名称" align="left" min-width="200">
                <template #default="{ row }">
                  <span>{{ row.customer_name }}</span>
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
                <span class="status-text" @click="row.status === customerStatus.CUSTOMER_STATUS_ASSIGNED && openAssignmentDetails(row)">
                  {{ row.status === customerStatus.CUSTOMER_STATUS_ASSIGNED ? '已分配' : '未分配' }}
                </span>
                  <el-button
                    size="small"
                    type="primary"
                    @click="openReassignDialog(row)"
                  >
                    {{ row.status === customerStatus.CUSTOMER_STATUS_ASSIGNED ? '重新分配' : '去分配' }}
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
              <!-- 客户等级列 -->
              <el-table-column label="客户等级" align="left" min-width="100">
                <template #default="{ row }">
                  <span>{{ row.customer_level === 1 ? '初级' : row.customer_level === 2 ? '中级' : '高级' }}</span>
                </template>
              </el-table-column>
              <!-- 国家列 -->
              <el-table-column label="国家" align="left" min-width="100">
                <template #default="{ row }">
                  <span>{{ row.customer_country_name }}</span>
                </template>
              </el-table-column>
              <!-- 贸易类型列 -->
              <el-table-column label="贸易类型" align="left" min-width="100">
                <template #default="{ row }">
                  <span>{{ row.trade_type === 1 ? '工厂' : '贸易商' }}</span>
                </template>
              </el-table-column>
              <!-- 接受邮件类型列 -->
              <el-table-column label="不可接受邮件类型列表" min-width="200">
                <template #default="{ row }">
                  <span>共 {{ row.no_accept_email_type_name.length }} 个邮件类型</span>
                  <el-button
                    size="mini"
                    type="text"
                    @click="checkEmailTypeList(row, 'no_accept_email_type_name')">
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
                  <el-button type="warning" size="small" @click="openUpdateCustomerDialog(row)">修改</el-button>
                  <el-button type="danger" size="small" @click="deleteCustomer(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <!-- 分页 -->
        <div>
            <SmartPagination
            v-model:current-page="customerPagination.currentPage"
            :server-page-size="customerPagination.serverPageSize"
            :display-page-size="customerPagination.displayPageSize"
            :total="customerPagination.totalItems"
            @load-data="handleCustomerLoadData" />
        </div>
      </el-tab-pane>
    </el-tabs>


    <!-- 创建客户对话框 -->
    <el-dialog title="创建客户" v-model="createCustomerDialog" width="40%" :close-on-click-modal="false" @close="closeCreateCustomerDialog">
      <el-form
        label-width="120px"
        :model="createCustomerForm"
        :rules="createCustomerRules"
        ref="createCustomerFormRef"
      >
        <!-- 客户名称输入框 -->
        <el-form-item label="客户名称" prop="customerName">
          <el-input v-model="createCustomerForm.customerName" placeholder="请输入客户名称" clearable/>
        </el-form-item>

        <!-- 联系人输入框 -->
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="createCustomerForm.contactPerson" placeholder="请输入联系人" clearable/>
        </el-form-item>

        <!-- 联系方式输入框 -->
        <el-form-item label="联系方式" prop="contactWay">
          <el-input v-model="createCustomerForm.contactWay" placeholder="请输入联系方式" clearable/>
        </el-form-item>

        <el-form-item label="客户等级" prop="customerLevel">
          <el-select v-model="createCustomerForm.customerLevel" placeholder="请选择等级" clearable>
            <el-option label="初级" :value="1"/>
            <el-option label="中级" :value="2"/>
            <el-option label="高级" :value="3"/>
          </el-select>
        </el-form-item>

        <el-form-item label="国家名称" prop="customerCountryId">
            <el-select
              v-model="createCustomerForm.customerCountryId"
              placeholder="请搜索国家名称"
              filterable
              remote
              :remote-method="debouncedCreateSearchCountry"
              clearable>

              <el-option
              v-for="country in createCustomerForm.countryOptions"
              :key="country.country_id"
              :label="country.country_name"
              :value="country.country_id" />
            </el-select>
        </el-form-item>

        <el-form-item label="贸易类型" prop="tradeType">
          <el-select v-model="createCustomerForm.tradeType" placeholder="请选择贸易类型" clearable>
            <el-option label="工厂" :value="1"/>
            <el-option label="贸易商" :value="2"/>
          </el-select>
        </el-form-item>

        <!-- 商品选择 -->
        <el-form-item label="原料产品" prop="commodityId">
          <template #default="{ }">
            <span>共 {{ createCustomerForm.commodityId.length }} 个商品</span>
            <el-button
              size="mini"
              type="text"
              @click="createCheckCommodityDialog">
              查看
            </el-button>
            <el-button type="primary" @click="chooseCommodity(true)">添加</el-button>
          </template>
        </el-form-item>

        <!-- 性别 -->
        <el-form-item label="性别" prop="sex">
          <el-select v-model="createCustomerForm.sex" placeholder="请选择性别" clearable>
            <el-option label="男" value="男"/>
            <el-option label="女" value="女"/>
          </el-select>
        </el-form-item>

        <!-- 出生日期 -->
        <el-form-item label="出生日期" prop="birth">
          <el-date-picker
            v-model="createCustomerForm.birth"
            placeholder="请选择出生日期"
            type="date"
           clearable/>
        </el-form-item>

        <!-- 添加邮箱 -->
        <el-form-item
          v-for="(email, index) in createCustomerForm.emails"
          :key="index"
          :label="index === 0 ? '添加邮箱' : ''"
          :prop="'emails.' + index"
          :rules="emailRules"
        >
          <el-input v-model="createCustomerForm.emails[index]" placeholder="请输入邮箱" clearable/>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" plain @click="addEmailInput">
            <el-icon><Plus /></el-icon>
          </el-button>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="closeCreateCustomerDialog">取消</el-button>
        <el-button type="primary" @click="createCustomer">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看列表信息对话框 -->
    <ListDialog :title="详情" v-model="listDialog" :list="listDetails" />

    <!-- 已分配客户详情弹窗 -->
    <AssignReceiverDetailsDialog
      v-model="assignCustomerDetailsDialog"
      :user_id="selectedUserId"
      :active_name="activeTabName"
    />

    <!-- 去分配/重新分配弹窗 -->
    <AssignReceiverDialog
      v-model="assignCustomerDialogVisible"
      :user_id="selectedUserId"
      :active_tab="activeTabName"
    />

    <!-- 选择原料产品信息框 -->
    <ChooseCommodityDialog
      v-model="chooseCommodityDialog"
      @confirm="handleCommodityConfirm"
    />

    <!-- 修改客户对话框 -->
    <el-dialog title="修改客户" v-model="updateCustomerDialog" width="40%" :close-on-click-modal="false" @close="closeUpdateCustomerDialog">
      <el-form
        label-width="120px"
        :model="updateCustomerForm"
      >
        <!-- 客户名称输入框 -->
        <el-form-item label="客户名称" prop="customerName">
          <el-input v-model="updateCustomerForm.customer_name" placeholder="请输入客户名称" clearable/>
        </el-form-item>

        <!-- 联系人输入框 -->
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="updateCustomerForm.contact_person" placeholder="请输入联系人" clearable/>
        </el-form-item>

        <!-- 联系方式输入框 -->
        <el-form-item label="联系方式" prop="contactWay">
          <el-input v-model="updateCustomerForm.contact_way" placeholder="请输入联系方式" clearable/>
        </el-form-item>

        <el-form-item label="客户等级" prop="customerLevel">
          <el-select v-model="updateCustomerForm.customer_level" placeholder="请选择等级" clearable>
            <el-option label="初级" :value="1"/>
            <el-option label="中级" :value="2"/>
            <el-option label="高级" :value="3"/>
          </el-select>
        </el-form-item>

        <el-form-item label="国家名称" prop="customerCountryId">
          <el-select
            v-model="updateCustomerForm.customer_country_id"
            :placeholder="updateCustomerForm.customer_country_name || '请选择国家'"
            filterable
            remote
            :remote-method="debouncedUpdateSearchCountry"
            clearable>

            <el-option
              v-for="country in updateCustomerForm.countryOptions"
              :key="country.country_id"
              :label="country.country_name"
              :value="country.country_id" />
          </el-select>
        </el-form-item>

        <el-form-item label="贸易类型" prop="tradeType">
          <el-select v-model="updateCustomerForm.trade_type" placeholder="请选择贸易类型" clearable>
            <el-option label="工厂" :value="1"/>
            <el-option label="贸易商" :value="2"/>
          </el-select>
        </el-form-item>

        <!-- 商品选择 -->
        <el-form-item label="原料产品" prop="commodityId">
          <template #default="{ }">
            <span>共 {{ updateCustomerForm.commodity.length }} 个商品</span>
            <el-button
              size="mini"
              type="text"
              @click="updateCheckCommodityDialog">
              查看
            </el-button>
            <el-button type="primary" @click="chooseCommodity(false)">添加</el-button>
          </template>
        </el-form-item>


        <!-- 性别 -->
        <el-form-item label="性别" prop="sex">
          <el-select v-model="updateCustomerForm.sex" placeholder="请选择性别" clearable>
            <el-option label="男" value="男"/>
            <el-option label="女" value="女"/>
          </el-select>
        </el-form-item>

        <!-- 出生日期 -->
        <el-form-item label="出生日期" prop="birth">
          <el-date-picker
            v-model="updateCustomerForm.birth"
            placeholder="请选择出生日期"
            type="date"
           clearable/>
        </el-form-item>

        <!-- 添加邮箱 -->
        <el-form-item
          v-for="(email, index) in updateCustomerForm.emails"
          :key="index"
          :label="index === 0 ? '修改邮箱' : ''"
          :prop="'emails.' + index"
          :rules="updateEmailRules"
        >
          <el-input v-model="updateCustomerForm.emails[index]" placeholder="请输入邮箱" clearable/>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" plain @click="addUpdateEmailInput">
            <el-icon><Plus /></el-icon>
          </el-button>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="closeUpdateCustomerDialog">取消</el-button>
        <el-button type="primary" @click="updateCustomer">确定</el-button>
      </template>
    </el-dialog>

    <!-- 批量分配客户 -->
    <AllAssignReceiverDialog
      v-model="allAssignCustomerDialog"
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
import { ref ,computed, onMounted} from "vue";
import {Plus} from "@element-plus/icons-vue";
import { debounce } from 'lodash';
import {countryApi} from "@/api/dictionary/country.js";
import {errorHandler} from "@/utils/errorHandler.js";
import {customerApi} from "@/api/receiver/customer.js";
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
const isCreate = ref(true);
//=============== 创建客户 ================
// 创建客户表单数据
const createCustomerForm = ref({
  customerName: '',
  contactPerson: '',
  contactWay: '',
  customerLevel: '',
  customerCountryId: '',
  countryOptions: [],
  tradeType: '',
  commodity: [],
  commodityId: [],
  sex: '',
  birth: '',
  emails: ['']
})
// 创建客户表单引用
const createCustomerFormRef = ref(null)
// 创建客户表单规则
const createCustomerRules = {
  customerName: [
    { required: true, message: '请输入客户名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  contactPerson: [
    { required: true, message: '请输入联系人', trigger: 'blur' }
  ],
  contactWay: [
    { required: true, message: '请输入联系方式', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  customerLevel: [
    { required: true, message: '请选择客户等级', trigger: 'change' }
  ],
  customerCountryId: [
    { required: true, message: '请选择国家', trigger: 'change' }
  ],
  tradeType: [
    { required: true, message: '请选择贸易类型', trigger: 'change' }
  ],
  commodityId: [
    { required: true, message: '请选择原料产品', trigger: 'change' },
    { type: 'array', min: 1, message: '请至少选择一个原料产品', trigger: 'change' }
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

// ============== 搜索客户 ================
const searchCustomerForm = ref({
  customerName: '',
  contactPerson: '',
  contactWay: '',
  customerLevel: null,
  customerCountryId: '',
  countryOptions: [],
  tradeType: null,
  commodityName: '',
  sex: '',
  birth: '',
  email: '',
  noAcceptEmailTypeId: [],
  emailTypeOptions: [],
  belongUserName: '',
  creatorName: '',
  status: null,
});
//=============== 修改客户 ================
const updateCustomerForm = ref({
  customer_name: '',
  contact_person: '',
  contact_way: '',
  customer_level: '',
  customer_country_id: '',
  countryOptions: [],
  customer_country_name: '',
  trade_type: '',
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
const customerStatus = statusData;
const activeTabName = "customer";
// 选中行数据
const selectedRows = ref([]);
const customerTableRef = ref(null)

// ========================= 分页 =========================
const customerPagination = ref({
  currentPage: 1,
  serverPage: 1,
  displayPageSize: 5,
  serverPageSize: 10,
  totalItems: 0,
  cachedData: new Map()
});
const customerCurrentPageData = computed(() => {
  const displayPageSize = customerPagination.value.displayPageSize  // 10
  const serverPageSize = customerPagination.value.serverPageSize  // 20
  const pagesPerServerPage = serverPageSize / displayPageSize  // 2

  // 计算当前服务器页码
  const serverPage = Math.floor((customerPagination.value.currentPage - 1) / pagesPerServerPage) + 1
  // 获取当前服务器页的数据
  const currentServerData = customerPagination.value.cachedData.get(serverPage) || []
  // 计算在当前服务器页内的偏移量
  const offset = ((customerPagination.value.currentPage - 1) % pagesPerServerPage) * displayPageSize
  return currentServerData.slice(offset, offset + displayPageSize)
});
const handleCustomerLoadData = async (serverPage) => {
  console.log("商品分页组件计算出的页码：",serverPage);
  if(customerPagination.value.cachedData.has(serverPage)){
    console.log("使用缓存数据，页码：", serverPage);
    return
  }
  customerPagination.value.serverPage = serverPage
  await searchCustomer()

}
const clearCustomerCache = () => {
  customerPagination.value.currentPage = 1;
  customerPagination.value.serverPage = 1;
  customerPagination.value.cachedData.clear();
  customerPagination.value.totalItems = 0;
}
// =================================== 功能 ===================================
// 导入客户
const importCustomer = async (file) => {
  try {
    console.log("导入客户", file.raw);
    const res = await customerApi.importCustomer(file.raw)
    if (res.code === 200) {
      // 处理错误信息，每条错误信息换行显示
      let errorMsgContent = '';
      if (res.data.errorMsg && Array.isArray(res.data.errorMsg)) {
        errorMsgContent = `<br>&nbsp;&nbsp;&nbsp;&nbsp;失败原因:<br>${res.data.errorMsg.map(msg => `&nbsp;&nbsp;&nbsp;&nbsp;${msg}`).join('<br>')}`;
      } else if (res.data.errorMsg) {
        errorMsgContent = `<br>&nbsp;&nbsp;&nbsp;&nbsp;失败原因: ${res.data.errorMsg}`;
      } else {
        errorMsgContent = '<br>&nbsp;&nbsp;&nbsp;&nbsp;如果有数据导入失败，原因可能为：国家、商品、邮箱错误';
      }
      ElMessageBox.alert(
        `导入客户成功:<br>
        &nbsp;&nbsp;&nbsp;&nbsp;成功${res.data.success_count}条<br>
        &nbsp;&nbsp;&nbsp;&nbsp;失败${res.data.fail_count}条${errorMsgContent}`,
        '导入结果',
        {
          type: 'success',
          confirmButtonText: '确定',
          dangerouslyUseHTMLString: true // 允许使用HTML
        }
      )
      console.log("导入客户成功", res);
    } else {
      errorHandler.showError("导入客户失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("导入客户失败,请重试", error);
  }
}

// 创建客户
const createCustomer = async () => {
  try {
    if (!createCustomerFormRef.value) return
    await createCustomerFormRef.value.validate(async (valid) => {
      if (valid) {
        // 提交逻辑
        const requestData = {
          customerName: createCustomerForm.value.customerName,
          contactPerson: createCustomerForm.value.contactPerson,
          contactWay: createCustomerForm.value.contactWay,
          customerLevel: Number(createCustomerForm.value.customerLevel),
          customerCountryId: createCustomerForm.value.customerCountryId,
          tradeType: Number(createCustomerForm.value.tradeType),
          commodityId: createCustomerForm.value.commodityId,
          sex: createCustomerForm.value.sex,
          birth: createCustomerForm.value.birth ? formatDate(createCustomerForm.value.birth) : '',
          emails: createCustomerForm.value.emails,
        }
        console.log("创建客户请求数据", requestData);
        const res = await customerApi.createCustomer(requestData)
        if (res.code === 200) {
          ElMessage.success("创建客户成功");
          console.log("创建客户成功", res);
          closeCreateCustomerDialog()
        } else {
          errorHandler.showError("创建客户失败,请重试。可能是邮箱已被注册，或其他参数不正确。", res);
        }
      }
    })
  } catch (error) {
    errorHandler.showError("创建客户失败,请重试。可能是邮箱已被注册，或其他参数不正确。", error);
  }
}

// 搜索客户点击事件
const searchCustomerClick = () => {
  clearCustomerCache()
  searchCustomer()
}

// 搜索客户重置
const resetSearchCustomer = () => {
  searchCustomerForm.value = {
    customerName: '',
    contactPerson: '',
    contactWay: '',
    customerLevel: null,
    customerCountryId: '',
    tradeType: null,
    commodityName: '',
    sex: '',
    birth: '',
    email: '',
    noAcceptEmailTypeId: [],
    belongUserName: '',
    creatorName: '',
    status: null,
  }
  // clearCustomerCache()
  // clearSelectedRows()
}

// 搜索客户
const searchCustomer = async () => {
  try {
    const requestData = {
      customerName: searchCustomerForm.value.customerName === '' ? null : searchCustomerForm.value.customerName,
      contactPerson: searchCustomerForm.value.contactPerson === '' ? null : searchCustomerForm.value.contactPerson,
      contactWay: searchCustomerForm.value.contactWay === '' ? null : searchCustomerForm.value.contactWay,
      customerLevel: searchCustomerForm.value.customerLevel ? Number(searchCustomerForm.value.customerLevel) : null,
      customerCountryId: searchCustomerForm.value.customerCountryId === '' ? null : searchCustomerForm.value.customerCountryId,
      tradeType: searchCustomerForm.value.tradeType ? Number(searchCustomerForm.value.tradeType) : null,
      commodityName: searchCustomerForm.value.commodityName === '' ? null : searchCustomerForm.value.commodityName,
      sex: searchCustomerForm.value.sex === '' ? null : searchCustomerForm.value.sex,
      birth: searchCustomerForm.value.birth ? formatDate(searchCustomerForm.value.birth) : null,
      email: searchCustomerForm.value.email === '' ? null : searchCustomerForm.value.email,
      noAcceptEmailTypeId: searchCustomerForm.value.noAcceptEmailTypeId[0] === '' ? null : searchCustomerForm.value.noAcceptEmailTypeId,
      belongUserName: searchCustomerForm.value.belongUserName === '' ? null : searchCustomerForm.value.belongUserName,
      creatorName: searchCustomerForm.value.creatorName === '' ? null : searchCustomerForm.value.creatorName,
      status: searchCustomerForm.value.status ? Number(searchCustomerForm.value.status) : null,
      pageNum: customerPagination.value.serverPage,
      pageSize: customerPagination.value.serverPageSize,
    }
    console.log("搜索客户请求数据", requestData);
    const res = await customerApi.filterCustomer(requestData)
    if (res.code === 200) {
      console.log("搜索客户成功", res);
      customerPagination.value.totalItems = res.data.total_items
      customerPagination.value.cachedData.set(customerPagination.value.serverPage, res.data.data)
    } else {
      errorHandler.showError("搜索客户失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索客户失败,请重试", error);
  }
}

// 更新客户
const updateCustomer = async () => {
  try {
    const requestData = {
      customerId: selectedUserId.value,
      customerName: updateCustomerForm.value.customer_name === '' ? null : updateCustomerForm.value.customer_name,
      contactPerson: updateCustomerForm.value.contact_person === '' ? null : updateCustomerForm.value.contact_person,
      contactWay: updateCustomerForm.value.contact_way === '' ? null : updateCustomerForm.value.contact_way,
      customerLevel: updateCustomerForm.value.customer_level ? Number(updateCustomerForm.value.customer_level) : null,
      customerCountryId: updateCustomerForm.value.customer_country_id === '' ? null : updateCustomerForm.value.customer_country_id,
      tradeType: updateCustomerForm.value.trade_type ? Number(updateCustomerForm.value.trade_type) : null,
      commodityId: updateCustomerForm.value.commodityId === '' ? null : updateCustomerForm.value.commodityId,
      sex: updateCustomerForm.value.sex === '' ? null : updateCustomerForm.value.sex,
      birth: updateCustomerForm.value.birth ? formatDate(updateCustomerForm.value.birth) : null,
      emails: updateCustomerForm.value.emails[0] === '' ? null : updateCustomerForm.value.emails,
    }
    console.log("更新客户请求数据", requestData);
    const res = await customerApi.updateCustomer(requestData)
    if (res.code === 200) {
      ElMessage.success("更新客户成功");
      console.log("更新客户响应数据", res);
      closeUpdateCustomerDialog()
      updateCustomerDialog.value = false;
      // 更新成功后重新搜索
      resetSearchCustomer();
      await searchCustomer();
    } else {
      errorHandler.showError("更新客户失败,请重试。可能是邮箱已被注册，或其他参数不正确。", res);
    }
  } catch (error) {
    errorHandler.showError("更新客户失败,请重试。可能是邮箱已被注册，或其他参数不正确。", error);
  }
}

// 删除客户
const deleteCustomer = async (row) => {
  try {
    // 先弹窗确认是否删除
    await ElMessageBox.confirm(
        '是否确认删除？',
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          closeOnClickModal: false,
        }
    )
    const requestData = {
      customerId: row.customer_id,
    }
    console.log("删除客户请求数据", requestData);
    const res = await customerApi.deleteCustomer(requestData)
    if (res.code === 200) {
      ElMessage.success("删除客户成功");
      console.log("删除客户响应数据", res);
      // 将客户数据从缓存中删除
      const currentData = customerPagination.value.cachedData.get(customerPagination.value.serverPage)
      customerPagination.value.cachedData.set(
        customerPagination.value.serverPage,
        currentData.filter(item => item.customer_id !== row.customer_id)
      )
      customerPagination.value.totalItems = customerPagination.value.totalItems - 1
      console.log("客户数据缓存", customerPagination.value.cachedData.get(customerPagination.value.serverPage));
    } else {
      errorHandler.showError("删除客户失败,请重试", res);
      // 删除失败后重新搜索
      resetSearchCustomer();
      await searchCustomer();
    }
  } catch (error) {
    if (error === 'cancel') {
      console.log('用户取消了删除操作')
    } else {
      errorHandler.showError("删除客户失败,请重试", error);
    }
  }
}
// ========================= 对话框控制 =========================
const createCustomerDialog = ref(false);
const updateCustomerDialog = ref(false);
const chooseCommodityDialog = ref(false);
const listDialog = ref(false);
const listDetails = ref([]);
const assignCustomerDetailsDialog = ref(false);
const assignCustomerDialogVisible = ref(false);
const allAssignCustomerDialog = ref(false);
const changeBelongUserDialog = ref(false);

// ========================= 对话框操作 =========================
//===============打开对话框===============
// 创建客户对话框
const openCreateCustomerDialog = () => {
  createCustomerDialog.value = true;
};
// 更新客户对话框
const openUpdateCustomerDialog = (row) => {
  console.log("更新客户选中行数据", row);

  // 赋值给更新表单
  updateCustomerForm.value = { ...row };
  selectedUserId.value = row.customer_id;

  // 显示商品数据
  updateCustomerForm.value.commodityId = row.commodity.map(item => item.commodityId);
  updateCustomerForm.value.commodity = row.commodity.map(item => ({
    commodity_id: item.commodityId,
    commodity_name: item.commodityName
  }));

  // 显示国家数据
  if (row.customer_country_id && row.customer_country_name) {
    updateCustomerForm.value.customer_country_id = row.customer_country_id;
    updateCustomerForm.value.countryOptions = [{
      country_id: row.customer_country_id,
      country_name: row.customer_country_name
    }];
  } else {
    updateCustomerForm.value.customer_country_id = '';
    updateCustomerForm.value.countryOptions = [];
  }

  console.log("更新客户选中行传输数据", updateCustomerForm.value);
  updateCustomerDialog.value = true;
};
// 创建客户查看商品
const createCheckCommodityDialog = () => {
  listDialog.value = true;
  listDetails.value = createCustomerForm.value.commodity.map(item => item.commodity_name);
}
// 修改客户查看商品
const updateCheckCommodityDialog = () => {
  listDialog.value = true;
  listDetails.value = updateCustomerForm.value.commodity.map(item => item.commodity_name);
}
// 查看客户商品列表
const checkCommodityList = (row,column) => {
  listDialog.value = true;
  listDetails.value = row[column];
}
// 查看客户邮箱列表
const checkEmailList = (row,column) => {
  listDialog.value = true;
  listDetails.value = row[column];
}
// 查看客户邮箱类型列表
const checkEmailTypeList = (row,column) => {
  listDialog.value = true;
  listDetails.value = row[column];
}
// 分配对话框
const openReassignDialog = (row) => {
  selectedUserId.value = row.customer_id
  assignCustomerDialogVisible.value = true;
};
// 分配详情对话框
const openAssignmentDetails = (row) => {
  selectedUserId.value = row.customer_id;
  assignCustomerDetailsDialog.value = true;
};
// 批量分配客户
const openAllAssignCustomerDialog = () => {
  allAssignCustomerDialog.value = true;
  console.log("批量分配客户选中客户id", selectedRows.value);
}
// 改变所属用户
const changeBelongUser = () => {
  changeBelongUserDialog.value = true;
}


//===============关闭对话框===============
// 创建客户对话框
const closeCreateCustomerDialog = () => {
  createCustomerFormRef.value.resetFields();
  createCustomerForm.value = {
    customerName: '',
    contactPerson: '',
    contactWay: '',
    customerLevel: '',
    customerCountryId: '',
    tradeType: '',
    commodity: [],
    commodityId: [],
    sex: '',
    birth: '',
    emails: ['']
  };
  createCustomerDialog.value = false;
};
// 更新客户对话框
const closeUpdateCustomerDialog = () => {
  updateCustomerForm.value = {
    customer_name: '',
    contact_person: '',
    contact_way: '',
    customer_level: '',
    customer_country_id: '',
    countryOptions: [],
    customer_country_name: '',
    trade_type: '',
    commodity: [],
    commodityId: [],
    sex: '',
    birth: '',
    emails: ['']
  };
  updateCustomerDialog.value = false;
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
  createCustomerForm.value.emails.push('')
}
const addUpdateEmailInput = () => {
  updateCustomerForm.value.emails.push('')
}
// 选择商品
const chooseCommodity = (create) => {
  chooseCommodityDialog.value = true;
  console.log("选择商品", create);
  if(create){
    isCreate.value = true;
  }else{
    isCreate.value = false;
  }
};
//子组件搜索商品回调函数
const handleCommodityConfirm = async (selectedCommodities, selectedIds) => {
  if(isCreate.value){
    createCustomerForm.value.commodity = selectedCommodities;
    createCustomerForm.value.commodityId = selectedIds;
    console.log("创建客户选择商品", createCustomerForm.value.commodity, createCustomerForm.value.commodityId);
  }else{
    updateCustomerForm.value.commodity = selectedCommodities;
    updateCustomerForm.value.commodityId = selectedIds;
    console.log("修改客户选择商品", updateCustomerForm.value.commodity, updateCustomerForm.value.commodityId);
  }
}
// 处理表格选中变化
const handleSelectionChange = (rows) => {
  selectedRows.value = rows.map(row => row.customer_id)
}
const clearSelectedRows = () => {
  customerTableRef.value.clearSelection()
  selectedRows.value = []
}

//======================输入框搜索事件======================
// 创建客户选择国家
const chooseCreateCountry = async (query) => {
  try {
    const requestData = {
      country_name: query,
      country_code: '',
      page_num: 1,
      page_size: 100
    }
    console.log("搜索国家请求数据", requestData);
    const res = await countryApi.filterCountry(requestData)
    if (res.code === 200) {
      // 将国家数据缓存
      createCustomerForm.value.countryOptions = res.data.country
      console.log("创建客户选择国家响应数据", res);
      console.log("创建客户选择国家缓存数据", createCustomerForm.value.countryOptions);
    } else {
      errorHandler.showError("搜索国家失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索国家失败,请重试", error);
  }
}
const debouncedCreateSearchCountry = debounce(chooseCreateCountry, 500)

// 修改客户选择国家
const chooseUpdateCountry = async (query) => {
  try {
    const requestData = {
      country_name: query,
      country_code: '',
      page_num: 1,
      page_size: 100
    }
    console.log("搜索国家请求数据", requestData);
    const res = await countryApi.filterCountry(requestData)
    if (res.code === 200) {
      // 将国家数据缓存
      updateCustomerForm.value.countryOptions = res.data.country
      console.log("修改客户选择国家响应数据", res);
      console.log("修改客户选择国家缓存数据", updateCustomerForm.value.countryOptions);
    } else {
      errorHandler.showError("搜索国家失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索国家失败,请重试", error);
  }
}
const debouncedUpdateSearchCountry = debounce(chooseUpdateCountry, 500)

// 搜索客户选择国家
const chooseSearchCountry = async (query) => {
  try {
    const requestData = {
      country_name: query,
      country_code: '',
      page_num: 1,
      page_size: 100
    }
    console.log("搜索国家请求数据", requestData);
    const res = await countryApi.filterCountry(requestData)
    if (res.code === 200) {
      // 将国家数据缓存
      searchCustomerForm.value.countryOptions = res.data.country
      console.log("搜索客户选择国家响应数据", res);
      console.log("搜索客户选择国家缓存数据", searchCustomerForm.value.countryOptions);
    } else {
      errorHandler.showError("搜索国家失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索国家失败,请重试", error);
  }
}
const debouncedSearchCountry = debounce(chooseSearchCountry, 500)

// 搜索客户选择可接受邮件类型
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
      searchCustomerForm.value.emailTypeOptions = res.data.email_type
      console.log("搜索客户选择可接受邮件类型响应数据", res);
      console.log("搜索客户选择可接受邮件类型缓存数据", searchCustomerForm.value.emailTypeOptions);
    } else {
      errorHandler.showError("搜索可接受邮件类型失败,请重试", res);
    }
  } catch (error) {
    errorHandler.showError("搜索可接受邮件类型失败,请重试", error);
  }
}
const debouncedSearchEmailType = debounce(chooseSearchEmailType, 500)


//================================页面初始操作================================
onMounted(() => {
  if(customerCurrentPageData.value.length === 0){
    searchCustomerClick()
  }
})
</script>

<style scoped>
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
