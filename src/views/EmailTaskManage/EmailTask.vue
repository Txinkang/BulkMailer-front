<template>
  <div class="EmailTask">
    <div class="EmailTaskContainer">
      <el-tabs>
        <el-tab-pane label="手动发送">
          <el-tabs type="border-card">
            <el-tab-pane label="管理手动发送任务">
              <!-- 搜索框 -->
              <div style="display: flex;flex-flow:row wrap;gap: 10px;margin: 10px 0 20px 0">
                <el-input style="width: 200px;margin-bottom: 20px" placeholder="请搜索主题名称" clearable></el-input>
                <el-input style="width: 200px;margin-bottom: 20px" placeholder="请搜索发件人" clearable></el-input>
                <el-input style="width: 200px;margin-bottom: 20px" placeholder="请搜索发件人邮箱" clearable></el-input>
                <el-select style="width: 200px" placeholder="选择邮件类型">
                  <el-option label="商品促销"></el-option>
                  <el-option label="生日"></el-option>
                  <el-option label="节日"></el-option>
                </el-select>
                <el-date-picker
                  style="width: 200px"
                  v-model="selectedMonth"
                  type="month"
                  placeholder="选择发送时间"
                  :format="monthFormat"
                  @change="handleMonthChange"
                />
                <el-select style="width: 200px" placeholder="选择操作状态">
                  <el-option label="开始" :value="1"></el-option>
                  <el-option label="暂停" :value="2"></el-option>
                  <el-option label="终止" :value="3"></el-option>
                </el-select>

                <el-select style="width: 200px" placeholder="选择任务状态">
                  <el-option label="发送中" :value="1"></el-option>
                  <el-option label="发送暂停" :value="2"></el-option>
                  <el-option label="发送终止" :value="3"></el-option>
                  <el-option label="发送成功" :value="5"></el-option>
                  <el-option label="发送失败" :value="6"></el-option>
                </el-select>

                <el-button type="primary">搜索</el-button>
                <el-button type="primary">
                  <el-icon>
                    <Refresh/>
                  </el-icon>
                </el-button>
              </div>

              <!-- 数据 -->
              <div style="width:100%;overflow-x: auto;">
                <el-table :data="tableData" border style="width: 1000px;margin-bottom: 20px">
                  <!-- 主题列 -->
                  <el-table-column label="主题" align="left" min-width="200">
                    <template #default="{ row }">
                      <span>{{ row.subject }}</span>
                    </template>
                  </el-table-column>

                  <!-- 发件人列 -->
                  <el-table-column label="发件人" align="left" min-width="200">
                    <template #default="{ row }">
                      <span>{{ row.sender }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="发件人邮箱" align="left" min-width="200">
                    <template #default="{ row }">
                      <span>{{ row.senderEmail }}</span>
                    </template>
                  </el-table-column>

                  <!-- 邮件类型列 -->
                  <el-table-column label="邮件类型" align="left" min-width="200">
                    <template #default="{ row }">
                      <span>{{ row.type }}</span>
                    </template>
                  </el-table-column>

                  <!-- 发送时间列 -->
                  <el-table-column label="发送时间" align="left" min-width="200">
                    <template #default="{ row }">
                      <span>{{ row.sendTime }}</span>
                    </template>
                  </el-table-column>

                  <!-- 状态列 -->
                  <el-table-column label="操作状态" align="center" min-width="200">
                    <template #default="{ row }">
                      <el-button
                        :type="row.paused ? 'success' : 'warning'"
                        size="small"
                        @click="confirmToggleState(row)"
                      >
                        {{ row.paused ? "开始" : "暂停" }}
                      </el-button>
                      <el-button
                        type="danger"
                        size="small"
                        @click="confirmDelete(row)"
                      >
                        终止
                      </el-button>
                    </template>
                  </el-table-column>

                  <el-table-column label="任务状态" align="center" min-width="200">
                    <template #default="{ row }">
                      <span>{{ row.taskStatus }}</span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <!-- 查看收件人弹窗 -->
              <el-dialog v-model="recipientDetailsDialog">
                <el-form>
                  <el-form-item label="搜索收件人：">
                    <el-input  placeholder="请输入收件人姓名"></el-input>
                  </el-form-item>

                  <el-form-item>
                    <el-input type="textarea" placeholder="张三、李四、王五" disabled></el-input>
                  </el-form-item>
                </el-form>
              </el-dialog>

              <!-- 添加收件人对话框 -->
              <el-dialog
                title="筛选收件人"
                v-model="recipientFilterDialog"
                width="50%"
                @close="filterResetDialog"
              >
                <!-- 筛选条件 -->
                <div class="filter-section">

                  <el-input  placeholder="请输入收件人姓名"></el-input>

                  <el-cascader
                    v-model="selectedProduct"
                    :options="productOptions"
                    placeholder="选择商品品类"
                    @change="filterRecipients"
                  />
                  <el-select v-model="selectedRegion" placeholder="选择区域" @change="filterRecipients" multiple collapse-tags
                             collapse-tags-tooltip>
                    <el-option v-for="region in regions" :key="region" :label="region" :value="region" />
                  </el-select>
                  <el-select v-model="selectedCountry" placeholder="选择国家" @change="filterRecipients" multiple collapse-tags
                             collapse-tags-tooltip>
                    <el-option v-for="country in countries" :key="country" :label="country" :value="country" />
                  </el-select>
                  <el-select placeholder="选择贸易类型">
                    <el-option value="工厂"/>
                    <el-option value="贸易商"/>
                  </el-select>

                  <div style="display: flex;flex-direction: row">
                    <el-button type="primary">搜索</el-button>
                    <el-button type="primary">
                      <el-icon>
                        <Refresh/>
                      </el-icon>
                    </el-button>
                  </div>
                </div>

                <!-- 筛选结果 -->
                <div class="result-section">
                  <p>筛选结果：</p>
                  <el-checkbox-group>
                    <el-checkbox><span>收件人xxx</span></el-checkbox>
                    <el-checkbox><span>收件人xxx</span></el-checkbox>
                    <el-checkbox><span>收件人xxx</span></el-checkbox>
                    <el-checkbox><span>收件人xxx</span></el-checkbox>
                    <el-checkbox><span>收件人xxx</span></el-checkbox>
                  </el-checkbox-group>
                  <el-pagination
                    v-model:current-page="currentPage"
                    :page-size="pageSize"
                    :total="totalData"
                    layout="prev, pager, next"
                    background
                  />
                </div>

                <!-- 底部按钮 -->
                <template #footer>
                  <el-button @click="selectAllRecipients">全选</el-button>
                  <el-button @click="clearSelection">取消</el-button>
                  <el-button type="primary" @click="confirmSelection">确定</el-button>
                </template>
              </el-dialog>

              <!-- 删除收件人弹窗 -->
              <el-dialog v-model="recipientDeleteDialog">
                <el-form>
                  <el-form-item label="搜索收件人：">
                    <el-input  placeholder="请输入收件人姓名"></el-input>
                  </el-form-item>

                  <el-form-item>
                    <el-checkbox>张三</el-checkbox>
                  </el-form-item>

                  <el-form-item>
                    <el-button-group>
                      <el-button type="danger">确认删除</el-button>
                    </el-button-group>
                  </el-form-item>
                </el-form>
              </el-dialog>

              <!-- 分页 -->
              <el-pagination
                v-model:current-page="currentPage"
                :page-size="pageSize"
                :total="totalData"
                layout="prev, pager, next"
                background
              />
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>
        <el-tab-pane label="循环发送">
          <el-tabs type="border-card">
            <el-tab-pane label="管理循环发送任务">
              <!-- 搜索框 -->
              <div style="display: flex;flex-flow:row wrap;gap: 10px;margin: 10px 0 20px 0">
                <el-input style="width: 200px;margin-bottom: 20px" placeholder="请搜索主题名称" clearable></el-input>
                <el-input style="width: 200px;margin-bottom: 20px" placeholder="请搜索发件人" clearable></el-input>
                <el-input style="width: 200px;margin-bottom: 20px" placeholder="请搜索发件人邮箱" clearable></el-input>
                <el-select style="width: 200px" placeholder="选择邮件类型">
                  <el-option label="商品促销"></el-option>
                  <el-option label="生日"></el-option>
                  <el-option label="节日"></el-option>
                </el-select>
                <el-date-picker
                  style="width: 200px"
                  v-model="selectedMonth"
                  type="month"
                  placeholder="开始时间"
                  :format="monthFormat"
                  @change="handleMonthChange"
                />
                <el-date-picker
                  style="width: 200px"
                  v-model="selectedMonth"
                  type="month"
                  placeholder="结束时间"
                  :format="monthFormat"
                  @change="handleMonthChange"
                />
                <el-select style="width: 200px" placeholder="选择操作状态">
                  <el-option label="开始" :value="1"></el-option>
                  <el-option label="暂停" :value="2"></el-option>
                  <el-option label="终止" :value="3"></el-option>
                  <el-option label="重置" :value="4"></el-option>
                </el-select>

                <el-select style="width: 200px" placeholder="选择任务状态">
                  <el-option label="发送中" :value="1"></el-option>
                  <el-option label="发送暂停" :value="2"></el-option>
                  <el-option label="发送终止" :value="3"></el-option>
                  <el-option label="发送重置" :value="4"></el-option>
                  <el-option label="发送成功" :value="5"></el-option>
                  <el-option label="发送失败" :value="6"></el-option>
                </el-select>

                <el-button type="primary">搜索</el-button>
                <el-button type="primary">
                  <el-icon>
                    <Refresh/>
                  </el-icon>
                </el-button>
              </div>

              <!-- 数据 -->
              <div style="width:100%;overflow-x: auto;">
                <el-table :data="tableData" border style="width: 1000px;margin-bottom: 20px">
                  <!-- 主题列 -->
                  <el-table-column label="主题" align="left" min-width="200">
                    <template #default="{ row }">
                      <span>{{ row.subject }}</span>
                    </template>
                  </el-table-column>

                  <!-- 发件人列 -->
                  <el-table-column label="发件人" align="left" min-width="200">
                    <template #default="{ row }">
                      <span>{{ row.sender }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="发件人邮箱" align="left" min-width="200">
                    <template #default="{ row }">
                      <span>{{ row.senderEmail }}</span>
                    </template>
                  </el-table-column>

                  <!-- 邮件类型列 -->
                  <el-table-column label="邮件类型" align="left" min-width="200">
                    <template #default="{ row }">
                      <span>{{ row.type }}</span>
                    </template>
                  </el-table-column>

                  <!-- 发送时间列 -->
                  <el-table-column label="开始时间" align="left" min-width="200">
                    <template #default="{ row }">
                      <span>{{ row.sendTime }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="结束时间" align="left" min-width="200">
                    <template #default="{ row }">
                      <span>{{ row.endTime }}</span>
                    </template>
                  </el-table-column>

                  <!-- 状态列 -->
                  <el-table-column label="操作状态" align="center" min-width="200">
                    <template #default="{ row }">
                      <el-button
                        :type="row.paused ? 'success' : 'warning'"
                        size="small"
                        @click="confirmToggleState(row)"
                      >
                        {{ row.paused ? "开始" : "暂停" }}
                      </el-button>
                      <el-button
                        type="danger"
                        size="small"
                        @click="confirmDelete(row)"
                      >
                        终止
                      </el-button>
                      <el-button
                        type="primary"
                        size="small"
                      >
                        重置
                      </el-button>
                    </template>
                  </el-table-column>
                  <el-table-column label="任务状态" align="center" min-width="200">
                    <template #default="{ row }">
                      <span>{{ row.taskStatus }}</span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <!-- 查看收件人弹窗 -->
              <el-dialog v-model="recipientDetailsDialog">
                <el-form>
                  <el-form-item label="搜索收件人：">
                    <el-input  placeholder="请输入收件人姓名"></el-input>
                  </el-form-item>

                  <el-form-item>
                    <el-input type="textarea" placeholder="张三、李四、王五" disabled></el-input>
                  </el-form-item>
                </el-form>
              </el-dialog>

              <!-- 添加收件人对话框 -->
              <el-dialog
                title="筛选收件人"
                v-model="recipientFilterDialog"
                width="50%"
                @close="filterResetDialog"
              >
                <!-- 筛选条件 -->
                <div class="filter-section">

                  <el-input  placeholder="请输入收件人姓名"></el-input>

                  <el-cascader
                    v-model="selectedProduct"
                    :options="productOptions"
                    placeholder="选择商品品类"
                    @change="filterRecipients"
                  />
                  <el-select v-model="selectedRegion" placeholder="选择区域" @change="filterRecipients" multiple collapse-tags
                             collapse-tags-tooltip>
                    <el-option v-for="region in regions" :key="region" :label="region" :value="region" />
                  </el-select>
                  <el-select v-model="selectedCountry" placeholder="选择国家" @change="filterRecipients" multiple collapse-tags
                             collapse-tags-tooltip>
                    <el-option v-for="country in countries" :key="country" :label="country" :value="country" />
                  </el-select>
                  <el-select placeholder="选择贸易类型">
                    <el-option value="工厂"/>
                    <el-option value="贸易商"/>
                  </el-select>

                  <div style="display: flex;flex-direction: row">
                    <el-button type="primary">搜索</el-button>
                    <el-button type="primary">
                      <el-icon>
                        <Refresh/>
                      </el-icon>
                    </el-button>
                  </div>
                </div>

                <!-- 筛选结果 -->
                <div class="result-section">
                  <p>筛选结果：</p>
                  <el-checkbox-group>
                    <el-checkbox><span>收件人xxx</span></el-checkbox>
                    <el-checkbox><span>收件人xxx</span></el-checkbox>
                    <el-checkbox><span>收件人xxx</span></el-checkbox>
                    <el-checkbox><span>收件人xxx</span></el-checkbox>
                    <el-checkbox><span>收件人xxx</span></el-checkbox>
                  </el-checkbox-group>
                  <el-pagination
                    v-model:current-page="currentPage"
                    :page-size="pageSize"
                    :total="totalData"
                    layout="prev, pager, next"
                    background
                  />
                </div>

                <!-- 底部按钮 -->
                <template #footer>
                  <el-button @click="selectAllRecipients">全选</el-button>
                  <el-button @click="clearSelection">取消</el-button>
                  <el-button type="primary" @click="confirmSelection">确定</el-button>
                </template>
              </el-dialog>

              <!-- 删除收件人弹窗 -->
              <el-dialog v-model="recipientDeleteDialog">
                <el-form>
                  <el-form-item label="搜索收件人：">
                    <el-input  placeholder="请输入收件人姓名"></el-input>
                  </el-form-item>

                  <el-form-item>
                    <el-checkbox>张三</el-checkbox>
                  </el-form-item>

                  <el-form-item>
                    <el-button-group>
                      <el-button type="danger">确认删除</el-button>
                    </el-button-group>
                  </el-form-item>
                </el-form>
              </el-dialog>

              <!-- 分页 -->
              <el-pagination
                v-model:current-page="currentPage"
                :page-size="pageSize"
                :total="totalData"
                layout="prev, pager, next"
                background
              />
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>
        <el-tab-pane label="节日发送">
          <el-tabs type="border-card">
            <el-tab-pane label="管理节日发送任务">
              <!-- 开启节日发送 -->
              <div class="sendEmailContainer">
                <div class="chooseFestive">
                  <span style="margin-right: 15px">
                  选择日期：
                  </span>
                  <el-date-picker
                    v-model="selectedMonth"
                    type="month"
                    placeholder="发送时间"
                    :format="monthFormat"
                    @change="handleMonthChange"
                  />
                </div>

                <div class="recipient">
                  <span>
                  选择收件人：
                  </span>
                  <el-button type="primary" @click="recipientopenDialog">
                    <el-icon style="vertical-align: middle">
                      <CirclePlus/>
                    </el-icon>
                    <span style="vertical-align: middle"> 添加 </span>
                  </el-button>

                  <!-- 筛选收件人对话框 -->
                  <el-dialog
                    title="筛选收件人"
                    v-model="filterDialogVisible"
                    width="50%"
                    @close="filterResetDialog"
                  >
                    <!-- 筛选条件 -->
                    <div class="filter-section">
                      <el-input  placeholder="请输入商品名称"></el-input>

                      <el-select v-model="selectedRegion" placeholder="选择区域" @change="filterRecipients" multiple collapse-tags
                                 collapse-tags-tooltip>
                        <el-option v-for="region in regions" :key="region" :label="region" :value="region" />
                      </el-select>
                      <el-select v-model="selectedCountry" placeholder="选择国家" @change="filterRecipients" multiple collapse-tags
                                 collapse-tags-tooltip>
                        <el-option v-for="country in countries" :key="country" :label="country" :value="country" />
                      </el-select>
                      <el-select placeholder="选择贸易类型">
                        <el-option value="工厂"/>
                        <el-option value="贸易商"/>
                      </el-select>
                      <el-select placeholder="选择供应商等级">
                        <el-option value="初级"/>
                        <el-option value="中级"/>
                        <el-option value="高级"/>
                      </el-select>

                      <div style="display: flex;flex-direction: row">
                        <el-button type="primary">搜索</el-button>
                        <el-button type="primary">
                          <el-icon>
                            <Refresh/>
                          </el-icon>
                        </el-button>
                      </div>
                    </div>

                    <!-- 筛选结果 -->
                    <div class="result-section">
                      <p>筛选结果：</p>
                      <el-checkbox-group>
                        <el-checkbox><span>收件人xxx</span></el-checkbox>
                        <el-checkbox><span>收件人xxx</span></el-checkbox>
                        <el-checkbox><span>收件人xxx</span></el-checkbox>
                        <el-checkbox><span>收件人xxx</span></el-checkbox>
                        <el-checkbox><span>收件人xxx</span></el-checkbox>
                      </el-checkbox-group>
                      <el-pagination
                        v-model:current-page="currentPage"
                        :page-size="pageSize"
                        :total="totalData"
                        layout="prev, pager, next"
                        background
                      />
                    </div>

                    <!-- 底部按钮 -->
                    <template #footer>
                      <el-button @click="selectAllRecipients">全选</el-button>
                      <el-button @click="clearSelection">取消</el-button>
                      <el-button type="primary" @click="confirmSelection">确定</el-button>
                    </template>
                  </el-dialog>
                </div>

                <div class="appendix">
                  <span style="margin-right: 15px">
                  选择附件：
                  </span>
                  <el-button type="primary" @click="appendixOpenDialog">
                    <el-icon style="vertical-align: middle">
                      <CirclePlus/>
                    </el-icon>
                    <span style="vertical-align: middle"> 添加 </span>
                  </el-button>

                  <!-- 附件选择对话框 -->
                  <el-dialog
                    title="选择附件"
                    v-model="appendixDialogVisible"
                    width="50%"
                    @close="appendixResetDialog"
                  >
                    <el-tabs class="fileListTabs">
                      <el-tab-pane label="附件">

                        <!-- 搜索框 -->
                        <div class="search-container">
                          <el-input placeholder="请搜索附件名称" clearable>
                            <el-icon>
                              <Search/>
                            </el-icon>
                          </el-input>
                        </div>

                        <!-- 筛选结果 -->
                        <div class="result-section">
                          <p>筛选结果：</p>
                          <el-checkbox-group v-model="publicFileGroup" style="margin-bottom: 15px">
                            <el-checkbox v-for="files in publicFileList" :key="files.id" :label="files.name">
                              {{files.name}}
                            </el-checkbox>
                          </el-checkbox-group>
                        </div>

                        <!-- 分页 -->
                        <el-pagination
                          v-model:current-page="currentPage"
                          :page-size="pageSize"
                          :total="totalData"
                          layout="prev, pager, next"
                          background
                        />
                      </el-tab-pane>

                      <!--            <el-tab-pane label="公海附件">
                                    &lt;!&ndash; 搜索框 &ndash;&gt;
                                    <div class="search-container">
                                      <el-input placeholder="请搜索附件名称" clearable>
                                        <el-icon style="vertical-align: middle">
                                          <Search/>
                                        </el-icon>
                                        <span style="vertical-align: middle"> Search </span>
                                      </el-input>

                                    </div>

                                    <el-checkbox-group v-model="publicFileGroup" style="margin-bottom: 15px">
                                      <el-checkbox v-for="files in publicFileList" :key="files.id" :label="files.name">
                                        {{files.name}}
                                      </el-checkbox>
                                    </el-checkbox-group>

                                    &lt;!&ndash; 分页 &ndash;&gt;
                                    <el-pagination
                                      v-model:current-page="currentPage"
                                      :page-size="pageSize"
                                      :total="totalData"
                                      layout="prev, pager, next"
                                      background
                                    />
                                  </el-tab-pane>-->
                    </el-tabs>


                    <!-- 底部按钮 -->
                    <template #footer>
                      <el-button @click="selectAllappendixs">全选</el-button>
                      <el-button @click="clearSelection">取消</el-button>
                      <el-button type="primary" @click="confirmSelection">确定</el-button>
                    </template>
                  </el-dialog>
                </div>

                <div class="template">
                  <span style="margin-right: 16px">
                  选择模版：
                  </span>
                  <el-button type="primary" @click="openChooseTemplateDialog">
                    <el-icon style="vertical-align: middle">
                      <CirclePlus/>
                    </el-icon>
                    <span style="vertical-align: middle"> 选择 </span>
                  </el-button>

                  <el-dialog title="选择模板" v-model="chooseTemplateDialog">
                    <!-- 头部 -->
                    <el-form label-width="120px" inline>
                      <!-- 搜索框 -->
                      <el-form-item>
                        <el-input
                          v-model="searchText"
                          placeholder="请搜索模板名称"
                          clearable
                          class="search-box"
                        >
                          <template #append>
                            <el-button>
                              <el-icon>
                                <Search></Search>
                              </el-icon>
                            </el-button>
                          </template>
                        </el-input>
                      </el-form-item>

                      <!-- 选择范围 -->
                      <el-form-item>
                        <el-select style="width: 200px;margin-right: 20px" placeholder="选择范围">
                          <el-option label=全部></el-option>
                          <el-option label="公司"></el-option>
                          <el-option label="个人"></el-option>
                        </el-select>
                      </el-form-item>

                      <!-- 刷新  -->
                      <el-form-item>
                        <el-button type="primary"><el-icon><Refresh/></el-icon></el-button>
                      </el-form-item>
                    </el-form>

                    <!-- 表格数据 -->
                    <el-table :data="tableData" border style="width: 100%;margin-bottom: 20px">
                      <!-- 模板名称列 -->
                      <el-table-column label="模板名称" align="left" min-width="200">
                        <template #default="{ row }">
                          <span>{{ row.commodity }}</span>
                        </template>
                      </el-table-column>

                      <!-- 操作列 -->
                      <el-table-column label="操作" align="center" min-width="100">
                        <template #default="{ row }">
                          <el-button type="primary" size="small" @click="useTemplate">使用</el-button>
                        </template>
                      </el-table-column>
                    </el-table>

                    <!-- 分页 -->
                    <el-pagination
                      v-model:current-page="currentPage"
                      :page-size="pageSize"
                      :total="totalData"
                      layout="prev, pager, next"
                      background
                    />
                  </el-dialog>
                </div>

                <div class="emailTitle">
                  <span>主题：</span>
                  <el-input
                    style="width: 300px"
                    placeholder="请输入主题"
                    size="large"
                  ></el-input>
                </div>

                <div>
                  <el-button type="primary">创建</el-button>
                </div>
              </div>


              <!-- 分割线 -->
              <hr>

              <!-- 搜索框 -->
              <div style="display: flex;flex-flow: row wrap;gap: 10px;margin: 20px 0 20px 0">
                <el-input style="width: 200px;margin-bottom: 20px;" placeholder="请搜索主题名称" clearable>
                </el-input>
                <el-input style="width: 200px;margin-bottom: 20px;" placeholder="请搜索发件人" clearable>
                </el-input>
                <el-input style="width: 200px;margin-bottom: 20px;" placeholder="请搜索发件人邮箱" clearable>
                </el-input>
                <el-date-picker
                  v-model="selectedMonth"
                  type="month"
                  placeholder="发送时间"
                  :format="monthFormat"
                  @change="handleMonthChange"
                />
                <el-select style="width: 200px" placeholder="选择操作状态">
                  <el-option label="开始" :value="1"></el-option>
                  <el-option label="暂停" :value="2"></el-option>
                  <el-option label="终止" :value="3"></el-option>
                </el-select>

                <el-select style="width: 200px" placeholder="选择任务状态">
                  <el-option label="发送中" :value="1"></el-option>
                  <el-option label="发送暂停" :value="2"></el-option>
                  <el-option label="发送终止" :value="3"></el-option>
                  <el-option label="发送重置" :value="4"></el-option>
                  <el-option label="发送成功" :value="5"></el-option>
                  <el-option label="发送失败" :value="6"></el-option>
                </el-select>

                <el-button type="primary">搜索</el-button>
                <el-button type="primary">
                  <el-icon>
                    <Refresh/>
                  </el-icon>
                </el-button>
              </div>

              <!-- 数据 -->
              <div style="width:100%;overflow-x: auto;">
                <el-table :data="tableData" border style="width: 1000px;margin-bottom: 20px">
                  <!-- 主题列 -->
                  <el-table-column label="主题" align="left" min-width="200">
                    <template #default="{ row }">
                      <span>{{ row.subject }}</span>
                    </template>
                  </el-table-column>

                  <!-- 发件人列 -->
                  <el-table-column label="发件人" align="left" min-width="100">
                    <template #default="{ row }">
                      <span>{{ row.sender }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="发件人邮箱" align="left" min-width="200">
                    <template #default="{ row }">
                      <span>{{ row.senderEmail }}</span>
                    </template>
                  </el-table-column>

                  <!-- 发送时间列 -->
                  <el-table-column label="发送时间" align="left" min-width="150">
                    <template #default="{ row }">
                      <span>{{ row.sendTime }}</span>
                    </template>
                  </el-table-column>

                  <!-- 状态列 -->
                  <el-table-column label="操作状态" align="center" min-width="200">
                    <template #default="{ row }">
                      <el-button
                        :type="row.paused ? 'success' : 'warning'"
                        size="small"
                        @click="confirmToggleState(row)"
                      >
                        {{ row.paused ? "开始" : "暂停" }}
                      </el-button>
                      <el-button
                        type="danger"
                        size="small"
                        @click="confirmDelete(row)"
                      >
                        终止
                      </el-button>
                    </template>
                  </el-table-column>
                  <el-table-column label="任务状态" align="center" min-width="200">
                    <template #default="{ row }">
                      <span>{{ row.taskStatus }}</span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <!-- 分页 -->
              <el-pagination
                v-model:current-page="currentPage"
                :page-size="pageSize"
                :total="totalData"
                layout="prev, pager, next"
                background
              />

              <!-- 查看收件人弹窗 -->
              <el-dialog v-model="recipientDetailsDialog">
                <el-form>
                  <el-form-item label="搜索收件人：">
                    <el-input  placeholder="请输入收件人姓名"></el-input>
                  </el-form-item>

                  <el-form-item>
                    <el-input type="textarea" placeholder="张三、李四、王五" disabled></el-input>
                  </el-form-item>
                </el-form>
              </el-dialog>

              <!-- 添加收件人对话框 -->
              <el-dialog
                title="筛选收件人"
                v-model="recipientFilterDialog"
                width="50%"
                @close="filterResetDialog"
              >
                <!-- 筛选条件 -->
                <div class="filter-section">

                  <el-input  placeholder="请输入收件人姓名"></el-input>

                  <el-cascader
                    v-model="selectedProduct"
                    :options="productOptions"
                    placeholder="选择商品品类"
                    @change="filterRecipients"
                  />
                  <el-select v-model="selectedRegion" placeholder="选择区域" @change="filterRecipients" multiple collapse-tags
                             collapse-tags-tooltip>
                    <el-option v-for="region in regions" :key="region" :label="region" :value="region" />
                  </el-select>
                  <el-select v-model="selectedCountry" placeholder="选择国家" @change="filterRecipients" multiple collapse-tags
                             collapse-tags-tooltip>
                    <el-option v-for="country in countries" :key="country" :label="country" :value="country" />
                  </el-select>
                  <el-select placeholder="选择贸易类型">
                    <el-option value="工厂"/>
                    <el-option value="贸易商"/>
                  </el-select>

                  <div style="display: flex;flex-direction: row">
                    <el-button type="primary">搜索</el-button>
                    <el-button type="primary">
                      <el-icon>
                        <Refresh/>
                      </el-icon>
                    </el-button>
                  </div>
                </div>

                <!-- 筛选结果 -->
                <div class="result-section">
                  <p>筛选结果：</p>
                  <el-checkbox-group>
                    <el-checkbox><span>收件人xxx</span></el-checkbox>
                    <el-checkbox><span>收件人xxx</span></el-checkbox>
                    <el-checkbox><span>收件人xxx</span></el-checkbox>
                    <el-checkbox><span>收件人xxx</span></el-checkbox>
                    <el-checkbox><span>收件人xxx</span></el-checkbox>
                  </el-checkbox-group>
                  <el-pagination
                    v-model:current-page="currentPage"
                    :page-size="pageSize"
                    :total="totalData"
                    layout="prev, pager, next"
                    background
                  />
                </div>

                <!-- 底部按钮 -->
                <template #footer>
                  <el-button @click="selectAllRecipients">全选</el-button>
                  <el-button @click="clearSelection">取消</el-button>
                  <el-button type="primary" @click="confirmSelection">确定</el-button>
                </template>
              </el-dialog>

              <!-- 删除收件人弹窗 -->
              <el-dialog v-model="recipientDeleteDialog">
                <el-form>
                  <el-form-item label="搜索收件人：">
                    <el-input  placeholder="请输入收件人姓名"></el-input>
                  </el-form-item>

                  <el-form-item>
                    <el-checkbox>张三</el-checkbox>
                  </el-form-item>

                  <el-form-item>
                    <el-button-group>
                      <el-button type="danger">确认删除</el-button>
                    </el-button-group>
                  </el-form-item>
                </el-form>
              </el-dialog>
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>
        <el-tab-pane label="生日发送">
          <el-tabs type="border-card">
            <el-tab-pane label="管理生日发送任务">
              <!-- 开启生日发送 -->
              <div class="sendEmailContainer">
                <div>
                  <el-switch
                    v-model="startBirth"
                    size="large"
                    inline-prompt
                    active-text="开启"
                    inactive-text="暂停"
                  />
                </div>

                <div class="appendix">
                  <span style="margin-right: 15px">
                  选择附件：
                  </span>
                  <el-button type="primary" @click="appendixOpenDialog" :disabled="startBirth === true">
                    <el-icon style="vertical-align: middle">
                      <CirclePlus/>
                    </el-icon>
                    <span style="vertical-align: middle"> 添加 </span>
                  </el-button>

                  <!-- 附件选择对话框 -->
                  <el-dialog
                    title="选择附件"
                    v-model="appendixDialogVisible"
                    width="50%"
                    @close="appendixResetDialog"
                  >
                    <el-tabs class="fileListTabs">
                      <el-tab-pane label="附件">

                        <!-- 搜索框 -->
                        <div class="search-container">
                          <el-input placeholder="请搜索附件名称" clearable>
                            <el-icon>
                              <Search/>
                            </el-icon>
                          </el-input>
                        </div>

                        <!-- 筛选结果 -->
                        <div class="result-section">
                          <p>筛选结果：</p>
                          <el-checkbox-group v-model="publicFileGroup" style="margin-bottom: 15px">
                            <el-checkbox v-for="files in publicFileList" :key="files.id" :label="files.name">
                              {{files.name}}
                            </el-checkbox>
                          </el-checkbox-group>
                        </div>

                        <!-- 分页 -->
                        <el-pagination
                          v-model:current-page="currentPage"
                          :page-size="pageSize"
                          :total="totalData"
                          layout="prev, pager, next"
                          background
                        />
                      </el-tab-pane>

                      <!--            <el-tab-pane label="公海附件">
                                    &lt;!&ndash; 搜索框 &ndash;&gt;
                                    <div class="search-container">
                                      <el-input placeholder="请搜索附件名称" clearable>
                                        <el-icon style="vertical-align: middle">
                                          <Search/>
                                        </el-icon>
                                        <span style="vertical-align: middle"> Search </span>
                                      </el-input>

                                    </div>

                                    <el-checkbox-group v-model="publicFileGroup" style="margin-bottom: 15px">
                                      <el-checkbox v-for="files in publicFileList" :key="files.id" :label="files.name">
                                        {{files.name}}
                                      </el-checkbox>
                                    </el-checkbox-group>

                                    &lt;!&ndash; 分页 &ndash;&gt;
                                    <el-pagination
                                      v-model:current-page="currentPage"
                                      :page-size="pageSize"
                                      :total="totalData"
                                      layout="prev, pager, next"
                                      background
                                    />
                                  </el-tab-pane>-->
                    </el-tabs>


                    <!-- 底部按钮 -->
                    <template #footer>
                      <el-button @click="selectAllappendixs">全选</el-button>
                      <el-button @click="clearSelection">取消</el-button>
                      <el-button type="primary" @click="confirmSelection">确定</el-button>
                    </template>
                  </el-dialog>
                </div>

                <div class="template">
                  <span style="margin-right: 16px">
                  选择模版：
                  </span>
                  <el-button type="primary" @click="openChooseTemplateDialog" :disabled="startBirth === true">
                    <el-icon style="vertical-align: middle">
                      <CirclePlus/>
                    </el-icon>
                    <span style="vertical-align: middle"> 选择 </span>
                  </el-button>

                  <el-dialog title="选择模板" v-model="chooseTemplateDialog">
                    <!-- 头部 -->
                    <el-form label-width="120px" inline>
                      <!-- 搜索框 -->
                      <el-form-item>
                        <el-input
                          v-model="searchText"
                          placeholder="请搜索模板名称"
                          clearable
                          class="search-box"
                        >
                          <template #append>
                            <el-button>
                              <el-icon>
                                <Search></Search>
                              </el-icon>
                            </el-button>
                          </template>
                        </el-input>
                      </el-form-item>

                      <!-- 选择范围 -->
                      <el-form-item>
                        <el-select style="width: 200px;margin-right: 20px" placeholder="选择范围">
                          <el-option label=全部></el-option>
                          <el-option label="公司"></el-option>
                          <el-option label="个人"></el-option>
                        </el-select>
                      </el-form-item>

                      <!-- 刷新  -->
                      <el-form-item>
                        <el-button type="primary"><el-icon><Refresh/></el-icon></el-button>
                      </el-form-item>
                    </el-form>

                    <!-- 表格数据 -->
                    <el-table :data="tableData" border style="width: 100%;margin-bottom: 20px">
                      <!-- 模板名称列 -->
                      <el-table-column label="模板名称" align="left" min-width="200">
                        <template #default="{ row }">
                          <span>{{ row.commodity }}</span>
                        </template>
                      </el-table-column>

                      <!-- 操作列 -->
                      <el-table-column label="操作" align="center" min-width="100">
                        <template #default="{ row }">
                          <el-button type="primary" size="small" @click="useTemplate">使用</el-button>
                        </template>
                      </el-table-column>
                    </el-table>

                    <!-- 分页 -->
                    <el-pagination
                      v-model:current-page="currentPage"
                      :page-size="pageSize"
                      :total="totalData"
                      layout="prev, pager, next"
                      background
                    />
                  </el-dialog>
                </div>

                <div class="emailTitle">
                  <span>主题：</span>
                  <el-input
                    style="width: 300px"
                    placeholder="请输入主题"
                    size="large"
                    :disabled="startBirth === true"
                  ></el-input>
                </div>
              </div>

              <!-- 分割线 -->
              <hr>

              <!-- 搜索框 -->
              <div style="display: flex;flex-flow: row wrap;margin:20px 0 20px 0;gap: 10px">
                <el-input style="width: 200px;" placeholder="请搜索主题名称" clearable>
                </el-input>
                <el-input style="width: 200px;" placeholder="请搜索发件人" clearable>
                </el-input>
                <el-input style="width: 200px;" placeholder="请搜索发件人邮箱" clearable>
                </el-input>
                <el-input style="width: 200px;" placeholder="请搜索收件人" clearable>
                </el-input>
                <el-input style="width: 200px;" placeholder="请搜索收件人邮箱" clearable>
                </el-input>
                <el-select style="width: 200px;" placeholder="收件人等级">
                  <el-option label="初级"></el-option>
                  <el-option label="中级"></el-option>
                  <el-option label="高级"></el-option>
                </el-select>
                <el-select style="width: 200px;" placeholder="邮件状态">
                  <el-option label="已送达" :value="1"></el-option>
                  <el-option label="已打开" :value="2"></el-option>
                  <el-option label="未送达" :value="3"></el-option>
                  <el-option label="已退信" :value="4"></el-option>
                  <el-option label="已退订" :value="5"></el-option>
                </el-select>
                <el-date-picker style="width: 200px;" v-model="selectedDate" type="date" placeholder="收件人生日"/>
                <el-date-picker style="width: 200px;" v-model="selectedDate" type="date" placeholder="发送日期"/>
                <el-date-picker style="width: 200px;" v-model="selectedDate" type="date" placeholder="送达日期"/>

                <el-button type="primary">搜索</el-button>
                <el-button type="primary">
                  <el-icon>
                    <Refresh/>
                  </el-icon>
                </el-button>
              </div>

              <!-- 数据 -->
              <div style="width:100%;overflow-x: auto;">
                <el-table :data="tableData" border style="width: 1000px;margin-bottom: 20px">
                  <!-- 主题列 -->
                  <el-table-column label="主题" align="left" min-width="200">
                    <template #default="{ row }">
                      <span>{{ row.subject }}</span>
                    </template>
                  </el-table-column>

                  <!-- 状态列 -->
                  <el-table-column label="状态"  min-width="100px">
                    <template #default="{ row }">
                      <span>{{ row.status }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="未送达详情"  min-width="100px">
                    <template #default="{ row }">
                      <span v-if="row.status === '已送达'">无</span>
                      <span v-if="row.status === '未送达'">{{ row.failedDetail }}</span>
                    </template>
                  </el-table-column>

                  <!-- 发件人列 -->
                  <el-table-column label="发件人" min-width="100px">
                    <template #default="{ row }">
                      <span>{{ row.sender }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="发件人邮箱" min-width="200px">
                    <template #default="{ row }">
                      <span>{{ row.senderEmail }}</span>
                    </template>
                  </el-table-column>

                  <!-- 收件人列 -->
                  <el-table-column label="收件人"  min-width="100px">
                    <template #default="{ row }">
                      <span>{{ row.recipient }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="收件人邮箱"  min-width="200px">
                    <template #default="{ row }">
                      <span>{{ row.recipientEmail }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="收件人等级"  min-width="100px">
                    <template #default="{ row }">
                      <span>{{ row.recipientGrade }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="收件人生日"  min-width="150px">
                    <template #default="{ row }">
                      <span>{{ row.recipientBirth }}</span>
                    </template>
                  </el-table-column>

                  <!-- 时间列 -->
                  <el-table-column label="发送时间" min-width="200px">
                    <template #default="{ row }">
                      {{ row.sendTime }}
                    </template>
                  </el-table-column>
                  <el-table-column label="送达时间" min-width="200px">
                    <template #default="{ row }">
                      {{ row.endTime }}
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <!-- 分页 -->
              <el-pagination
                v-model:current-page="currentPage"
                :page-size="pageSize"
                :total="totalData"
                layout="prev, pager, next"
                background
              />
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>

      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import {ref} from "vue";
import {ElMessageBox, ElMessage} from "element-plus";
import {Search} from "@element-plus/icons-vue";

const recipientDetailsDialog = ref(false);
const recipientDeleteDialog = ref(false);
const recipientFilterDialog = ref(false);
const startBirth = ref(true);
// 分页数据
const totalData = ref(100);
// 当前页
const currentPage = ref(1);
// 每页显示条数
const pageSize = ref(10);
// 表格数据
const tableData = ref([
  {id: 1, type: "商品促销", subject: "邮件群发", status:"已送达", failedDetail:"网络波动", sender: "发件人xxx", senderEmail: "sender@gmail.com", recipient: "收件人xxx", recipientEmail: "receiver@gmail.com", recipientGrade: "高级", recipientBirth:"2002-06-06", sendTime: "2024-11-26", endTime: "2024-11-26", paused: false, taskStatus: "发送中"},
  {id: 1, type: "商品促销", subject: "邮件群发", status:"已送达", failedDetail:"网络波动", sender: "发件人xxx", senderEmail: "sender@gmail.com", recipient: "收件人xxx", recipientEmail: "receiver@gmail.com", recipientGrade: "高级", recipientBirth:"2002-06-06", sendTime: "2024-11-26", endTime: "2024-11-26", paused: false, taskStatus: "发送暂停"},
  {id: 1, type: "商品促销", subject: "邮件群发", status:"未送达", failedDetail:"网络波动", sender: "发件人xxx", senderEmail: "sender@gmail.com", recipient: "收件人xxx", recipientEmail: "receiver@gmail.com", recipientGrade: "高级", recipientBirth:"2002-06-06", sendTime: "2024-11-26", endTime: "2024-11-26", paused: false, taskStatus: "发送终止"},
  {id: 1, type: "商品促销", subject: "邮件群发", status:"已送达", failedDetail:"网络波动", sender: "发件人xxx", senderEmail: "sender@gmail.com", recipient: "收件人xxx", recipientEmail: "receiver@gmail.com", recipientGrade: "高级", recipientBirth:"2002-06-06", sendTime: "2024-11-26", endTime: "2024-11-26", paused: false, taskStatus: "发送重置"},
  {id: 1, type: "商品促销", subject: "邮件群发", status:"未送达", failedDetail:"网络波动", sender: "发件人xxx", senderEmail: "sender@gmail.com", recipient: "收件人xxx", recipientEmail: "receiver@gmail.com", recipientGrade: "高级", recipientBirth:"2002-06-06", sendTime: "2024-11-26", endTime: "2024-11-26", paused: false, taskStatus: "发送成功"},
  {id: 1, type: "商品促销", subject: "邮件群发", status:"已送达", failedDetail:"网络波动", sender: "发件人xxx", senderEmail: "sender@gmail.com", recipient: "收件人xxx", recipientEmail: "receiver@gmail.com", recipientGrade: "高级", recipientBirth:"2002-06-06", sendTime: "2024-11-26", endTime: "2024-11-26", paused: false, taskStatus: "发送失败"},
  {id: 1, type: "商品促销", subject: "邮件群发", status:"未送达", failedDetail:"网络波动", sender: "发件人xxx", senderEmail: "sender@gmail.com", recipient: "收件人xxx", recipientEmail: "receiver@gmail.com", recipientGrade: "高级", recipientBirth:"2002-06-06", sendTime: "2024-11-26", endTime: "2024-11-26", paused: false, taskStatus: "发送中"},
  {id: 1, type: "商品促销", subject: "邮件群发", status:"已送达", failedDetail:"网络波动", sender: "发件人xxx", senderEmail: "sender@gmail.com", recipient: "收件人xxx", recipientEmail: "receiver@gmail.com", recipientGrade: "高级", recipientBirth:"2002-06-06", sendTime: "2024-11-26", endTime: "2024-11-26", paused: false, taskStatus: "发送暂停"},
  {id: 1, type: "商品促销", subject: "邮件群发", status:"未送达", failedDetail:"网络波动", sender: "发件人xxx", senderEmail: "sender@gmail.com", recipient: "收件人xxx", recipientEmail: "receiver@gmail.com", recipientGrade: "高级", recipientBirth:"2002-06-06", sendTime: "2024-11-26", endTime: "2024-11-26", paused: false, taskStatus: "发送中"},
  {id: 1, type: "商品促销", subject: "邮件群发", status:"已送达", failedDetail:"网络波动", sender: "发件人xxx", senderEmail: "sender@gmail.com", recipient: "收件人xxx", recipientEmail: "receiver@gmail.com", recipientGrade: "高级", recipientBirth:"2002-06-06", sendTime: "2024-11-26", endTime: "2024-11-26", paused: false, taskStatus: "发送暂停"},
]);

// 删除操作
const confirmDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除主题为 "${row.subject}" 的数据吗？`,
    "删除确认",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(() => {
      const index = tableData.value.findIndex((item) => item.id === row.id);
      if (index !== -1) {
        tableData.value.splice(index, 1);
        ElMessage.success("删除成功！");
      }
    })
    .catch(() => {
      ElMessage.info("取消删除");
    });
};

// 确认状态切换操作
const confirmToggleState = (row) => {
  const action = row.paused ? "开始" : "暂停";
  ElMessageBox.confirm(
    `确定要${action}该任务 "${row.subject}" 吗？`,
    `${action}确认`,
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: row.paused ? "success" : "warning",
    }
  )
    .then(() => {
      row.paused = !row.paused; // 切换状态
      ElMessage.success(`${action}成功：${row.subject}`);
    })
    .catch(() => {
      ElMessage.info(`取消${action}`);
    });
};
</script>

<style scoped>
.EmailTask {
  height: 100%;
}

.EmailTaskContainer {
  margin-left: 1em;
  font-size: 15px;
}

.sendEmailContainer {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  font-size: 15px;
  margin-bottom: 20px;
}
.recipient, .appendix, .chooseType, .chooseTime, .template, .emailTitle{
  margin-bottom: 1.5em;
  font-size: 1em;
}
.emailTitle,.chooseFestive{
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 20px;
}
.month-time-picker-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
