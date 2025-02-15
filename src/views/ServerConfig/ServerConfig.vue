<template>
  <div class="server-container">
    <el-tabs v-model="activeTab">
      <!-- 发件方邮件服务器设置 -->
      <el-tab-pane label="发件方邮件服务器设置" name="outgoing">
        <div class="button-group">
          <el-button type="primary" @click="openDialog('outgoing')">添加服务器</el-button>
        </div>
        <div class="card-container">
          <el-card
            v-for="(server, index) in paginatedOutgoingServers"
            :key="server.id"
            class="server-card"
          >
            <div class="server-info">
              <p style="white-space: nowrap;"><strong>服务器名称：</strong>{{ server.name }}</p>
              <p><strong>每日限额：</strong>{{ server.dailyLimit }}</p>
              <p><strong>邮件间隔：</strong>{{ server.interval }} 秒</p>
              <p><strong>批量发送：</strong>{{ server.batchSize }} 封</p>
              <p><strong>批次间隔：</strong>{{ server.batchInterval }} 分钟</p>
            </div>
            <div class="actions">
              <el-button type="primary" size="small" @click="editServer('outgoing', server)">修改</el-button>
              <el-button type="danger" size="small" @click="deleteServer('outgoing', server.id)">删除</el-button>
            </div>
          </el-card>
        </div>
        <el-pagination
          v-model:current-page="outgoingPage"
          :page-size="4"
          :total="outgoingServers.length"
          layout="prev, pager, next"
          class="pagination"
        />
      </el-tab-pane>

      <!-- 收件方邮件服务器设置 -->
      <el-tab-pane label="收件方邮件服务器设置" name="incoming">
        <div class="button-group">
          <el-button type="primary" @click="openDialog('incoming')">添加服务器</el-button>
        </div>
        <div class="card-container">
          <el-card
            v-for="(server, index) in paginatedIncomingServers"
            :key="server.id"
            class="server-card"
          >
            <div class="server-info">
              <p><strong>服务器名称：</strong>{{ server.name }}</p>
              <p><strong>接收频率：</strong>{{ server.frequency }} 次/天</p>
            </div>
            <div class="actions">
              <el-button type="primary" size="small" @click="editServer('incoming', server)">修改</el-button>
              <el-button type="danger" size="small" @click="deleteServer('incoming', server.id)">删除</el-button>
            </div>
          </el-card>
        </div>
        <el-pagination
          v-model:current-page="incomingPage"
          :page-size="4"
          :total="incomingServers.length"
          layout="prev, pager, next"
          class="pagination"
        />
      </el-tab-pane>
    </el-tabs>

    <!-- 对话框 -->
    <el-dialog title="添加/修改服务器" v-model="dialogVisible" width="50%">
      <el-form :model="currentServer" label-width="200px">
        <el-form-item label="服务器名称">
          <el-input style="width: 250px" v-model="currentServer.name" placeholder="请输入服务器名称" />
        </el-form-item>
        <template v-if="activeTab === 'outgoing'">
          <el-form-item label="每日发送限额">
            <el-input-number v-model="currentServer.dailyLimit" :min="0" />
          </el-form-item>
          <el-form-item label="每封邮件发送间隔（秒）" >
            <el-input-number v-model="currentServer.interval" :min="0" />
          </el-form-item>
          <el-form-item label="每次发送批量">
            <el-input-number v-model="currentServer.batchSize" :min="0" />
          </el-form-item>
          <el-form-item label="每批次发送间隔（分钟）">
            <el-input-number v-model="currentServer.batchInterval" :min="0" />
          </el-form-item>
        </template>
        <template v-if="activeTab === 'incoming'">
          <el-form-item label="接收频率（次/天）">
            <el-input-number v-model="currentServer.frequency" :min="0" />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveServer">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// 当前选中标签
const activeTab = ref("outgoing");

// 对话框控制
const dialogVisible = ref(false);
const currentServer = ref({});

// 发件方服务器数据
const outgoingServers = ref([
  { id: 1, name: "@163.com", dailyLimit: 500, interval: 2, batchSize: 50, batchInterval: 10 },
]);

// 收件方服务器数据
const incomingServers = ref([
  { id: 1, name: "@163.com", frequency: 10, storageLimit: 50 },
  { id: 2, name: "@126.com", frequency: 20, storageLimit: 100 },
]);

// 分页
const outgoingPage = ref(1);
const incomingPage = ref(1);

// 当前页数据
const paginatedOutgoingServers = computed(() =>
  outgoingServers.value.slice((outgoingPage.value - 1) * 4, outgoingPage.value * 4)
);
const paginatedIncomingServers = computed(() =>
  incomingServers.value.slice((incomingPage.value - 1) * 4, incomingPage.value * 4)
);

// 打开对话框
const openDialog = (type) => {
  currentServer.value = type === "outgoing"
    ? { name: "", dailyLimit: 0, interval: 0, batchSize: 0, batchInterval: 0 }
    : { name: "", frequency: 0, storageLimit: 0 };
  dialogVisible.value = true;
};

// 保存服务器信息
const saveServer = () => {
  if (activeTab.value === "outgoing") {
    outgoingServers.value.push({ ...currentServer.value, id: Date.now() });
  } else {
    incomingServers.value.push({ ...currentServer.value, id: Date.now() });
  }
  dialogVisible.value = false;
};

// 修改服务器
const editServer = (type, server) => {
  currentServer.value = { ...server };
  dialogVisible.value = true;
};

// 删除服务器
const deleteServer = (type, id) => {
  if (type === "outgoing") {
    outgoingServers.value = outgoingServers.value.filter((server) => server.id !== id);
  } else {
    incomingServers.value = incomingServers.value.filter((server) => server.id !== id);
  }
};
</script>

<style scoped>
.server-container {
  padding: 20px;
}
.button-group {
  margin-bottom: 20px;
}
.card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.server-card {
  font-size: small;
  flex: 0 0 calc(20% - 20px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  border-radius: 8px;
}
.server-info p {
  margin: 5px 0;
}
.actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}
.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
