<template>
  <section class="ds-container">
    <div class="card-ui">
      <h1>Audit Logs</h1>

      <div class="mt-2 grid grid-md-2 grid-lg-4">
        <div>
          <label class="form-label mr-space-2">Recherche</label>
          <input
            id="auditSearch"
            class="form-control"
            v-model="q"
            placeholder="Action, actor email, target..."
            @keyup.enter="applyFilters"
          />
        </div>
        <div>
          <label class="form-label mr-space-2">Action</label>
          <input
            id="auditAction"
            class="form-control"
            v-model="actionFilter"
            @keyup.enter="applyFilters"
            placeholder="USER_CREATE, ORDER_UPDATE..."
          />
        </div>
        <div>
          <label class="form-label mr-space-2">Status</label>
          <input
            id="auditStatus"
            class="form-control"
            v-model="statusFilter"
            @keyup.enter="applyFilters"
            placeholder="SUCCESS/ERROR"
          />
        </div>
        <div>
          <label class="form-label mr-space-2">Target type</label>
          <input
            id="auditTargetType"
            class="form-control"
            v-model="targetType"
            @keyup.enter="applyFilters"
            placeholder="User, Order..."
          />
        </div>
      </div>

      <div class="mt-2 grid grid-md-2">
        <div>
          <label class="form-label mr-space-2">Actor email</label>
          <input
            id="auditActorEmail"
            class="form-control"
            v-model="actorEmail"
            @keyup.enter="applyFilters"
          />
        </div>
        <div class="text-right">
          <button class="btn-ui" @click="exportCsv">Export CSV</button>
        </div>
      </div>

      <div class="mt-3">
        <table class="table-ui">
          <thead>
            <tr>
              <th>ID</th>
              <th>Action</th>
              <th>Actor</th>
              <th>Target</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in logs" :key="l.id">
              <td>{{ l.id }}</td>
              <td>{{ l.action }}</td>
              <td>{{ l.actor?.email || l.userEmail || l.userId || "-" }}</td>
              <td>
                {{ l.target?.type || l.resourceType || "-" }}
                {{ l.target?.id || l.resourceId || "" }}
              </td>
              <td>{{ l.status || "-" }}</td>
              <td>{{ formatDate(l.createdAt) }}</td>
              <td>
                <button class="btn-ui" @click="selectLog(l)">Details</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="mt-2 grid grid-md-2">
          <div>Page {{ page }} / {{ totalPages }}</div>
          <div class="text-right">
            <button class="btn-ui" :disabled="page <= 1" @click="prevPage">
              Prev
            </button>
            <button
              class="btn-ui"
              :disabled="page >= totalPages"
              @click="nextPage"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div v-if="selected" id="audit-details" class="mt-3 card-ui bkg-gray-100">
        <h2>Audit log details</h2>
        <div class="mt-2"><strong>Action:</strong> {{ selected.action }}</div>
        <div class="mt-2">
          <strong>Actor:</strong>
          {{
            selected.actor?.email ||
            selected.userEmail ||
            selected.userId ||
            "-"
          }}
        </div>
        <div class="mt-2">
          <strong>Role:</strong> {{ selected.actor?.role || selected.actorRole || selected.userRole || selected.role || "-" }}
        </div>
        <div class="mt-2">
          <strong>Target:</strong>
          {{ selected.target?.type || selected.resourceType || "-" }}
          {{ selected.target?.id || selected.resourceId || "" }}
        </div>
        <div class="mt-2">
          <strong>Status:</strong> {{ selected.status || selected.outcome || selected.result || "-" }}
        </div>
        <div class="mt-2">
          <strong>RequestId:</strong> {{ selected.requestId || selected.requestID || selected.reqId || selected.request_id || "-" }}
        </div>
        <div class="mt-2">
          <strong>IP:</strong> {{ selected.actor?.ip || selected.ip || "-" }}
        </div>
        <div class="mt-2">
          <strong>UserAgent:</strong>
          {{ selected.actor?.userAgent || selected.userAgent || "-" }}
        </div>
        <div class="mt-2">
          <strong>Date:</strong> {{ formatDate(selected.createdAt) }}
        </div>
        <div class="mt-3" v-if="selected.changes">
          <h3>Changes</h3>
          <pre class="code-block">{{ pretty(selected.changes) }}</pre>
        </div>
        <div class="mt-2" v-if="selected.metadata">
          <h3>Metadata</h3>
          <pre class="code-block">{{ pretty(selected.metadata) }}</pre>
        </div>
      </div>

      <p v-if="error" class="mt-2 text-danger">{{ error }}</p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../api/axios";

const enableAuditLogs = import.meta.env.VITE_ENABLE_AUDIT_LOGS === "true";

const logs = ref([]);
const selected = ref(null);
const total = ref(0);
const page = ref(1);
const limit = ref(10);
const q = ref("");
const actionFilter = ref("");
const statusFilter = ref("");
const targetType = ref("");
const actorEmail = ref("");
const error = ref("");

const totalPages = computed(() =>
  Math.max(1, Math.ceil(total.value / limit.value)),
);

const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleString();
};

const buildFilters = () => {
  const filters = {};
  if (actionFilter.value) filters.action = actionFilter.value;
  if (statusFilter.value) filters.status = statusFilter.value;
  if (targetType.value) filters.targetType = targetType.value;
  if (actorEmail.value) filters.actorEmail = actorEmail.value;
  return Object.keys(filters).length ? JSON.stringify(filters) : undefined;
};

const loadLogs = async () => {
  if (!enableAuditLogs) {
    logs.value = [];
    total.value = 0;
    return;
  }
  try {
    const res = await api.get("/audit-logs", {
      params: {
        page: page.value,
        limit: limit.value,
        sort: "createdAt",
        order: "desc",
        q: q.value || undefined,
        filters: buildFilters(),
      },
    });
    logs.value = res.data?.data || res.data || [];
    total.value = res.data?.total ?? logs.value.length;
  } catch {
    error.value = "Erreur lors du chargement des audit logs.";
  }
};

const applyFilters = () => {
  page.value = 1;
  loadLogs();
};

const exportCsv = async () => {
  const res = await api.get("/admin/audit-logs/export", {
    responseType: "blob",
  });
  const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "audit-logs.csv";
  link.click();
  URL.revokeObjectURL(link.href);
};

const prevPage = () => {
  if (page.value > 1) {
    page.value -= 1;
    loadLogs();
  }
};

const nextPage = () => {
  if (page.value < totalPages.value) {
    page.value += 1;
    loadLogs();
  }
};

const selectLog = (log) => {
  selected.value = log;
  setTimeout(() => {
    const el = document.getElementById("audit-details");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 0);
};

const pretty = (obj) => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
};
onMounted(loadLogs);
</script>
