<template>
  <section class="ds-container">
    <div class="card-ui">
      <h1>Commandes</h1>

      <div class="mt-2 grid grid-md-2 grid-lg-4">
        <div>
          <label class="form-label">Recherche</label>
          <input
            id="ordersSearch"
            class="form-control"
            v-model="q"
            placeholder="ID, email..."
            @keyup.enter="applyFilters"
          />
        </div>
        <div>
          <label class="form-label mr-space-2">Status</label>
          <select
            id="ordersStatusFilter"
            class="form-control"
            v-model="statusFilter"
            @change="applyFilters"
          >
            <option value="">Tous</option>
            <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div>
          <label class="form-label mr-space-2">Date from</label>
          <input
            id="ordersDateFrom"
            class="form-control"
            type="date"
            v-model="dateFrom"
            @change="applyFilters"
          />
        </div>
        <div>
          <label class="form-label mr-space-2">Date to</label>
          <input
            id="ordersDateTo"
            class="form-control"
            type="date"
            v-model="dateTo"
            @change="applyFilters"
          />
        </div>
      </div>

      <div class="mt-2 grid grid-md-2">
        <div>
          <label class="form-label mr-space-2">UserId</label>
          <input
            id="ordersUserId"
            class="form-control"
            type="number"
            v-model.number="userIdFilter"
            @keyup.enter="applyFilters"
          />
        </div>
        <div class="text-right">
          <button class="btn-ui" @click="exportCsv">Export CSV</button>
          <select class="form-control inline-select" v-model="batchStatus">
            <option value="">Status batch...</option>
            <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
          </select>
          <button
            class="btn-ui"
            :disabled="selectedIds.length === 0 || !batchStatus"
            @click="batchUpdateStatus"
          >
            Appliquer
          </button>
          <button
            class="btn-ui"
            :disabled="selectedIds.length === 0"
            @click="batchDelete"
          >
            Supprimer selection
          </button>
        </div>
      </div>

      <div class="mt-3">
        <table class="table-ui">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  :checked="allSelected"
                  @change="toggleAll"
                />
              </th>
              <th>ID</th>
              <th>User</th>
              <th>Status</th>
              <th>Total</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in orders" :key="o.id">
              <td>
                <input type="checkbox" v-model="selectedIds" :value="o.id" />
              </td>
              <td>{{ o.id }}</td>
              <td>{{ o.user?.email || o.userId }}</td>
              <td>{{ o.status }}</td>
              <td>{{ formatPrice(o.totalAmount ?? getTotal(o)) }} EUR</td>
              <td>{{ formatDate(o.orderDate) }}</td>
              <td>
                <button class="btn-ui" @click="selectOrder(o)">Details</button>
                <button class="btn-ui" @click="deleteOrder(o)">
                  Supprimer
                </button>
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

      <div v-if="selected" id="order-details" class="mt-3 card-ui bkg-gray-100">
        <h2>Commande #{{ selected.id }}</h2>

        <div class="mt-2">
          <label class="form-label mr-space-2">Status</label>
          <select class="form-control" v-model="selected.status">
            <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>

        <div class="mt-2">
          <button class="btn-ui btn-primary" @click="updateStatus">
            Update status
          </button>
        </div>

        <div class="mt-3">
          <h3>Items</h3>
          <table class="table-ui">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in selected.items" :key="i.productId">
                <td>{{ i.product?.name }}</td>
                <td>{{ i.quantity }}</td>
                <td>{{ i.price }} EUR</td>
                <td>{{ formatPrice(i.quantity * i.price) }} EUR</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-3" v-if="selected.statusHistory?.length">
          <h3>Status history</h3>
          <table class="table-ui">
            <thead>
              <tr>
                <th>Status</th>
                <th>Date</th>
                <th>UserId</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="h in selected.statusHistory" :key="h.id">
                <td>{{ h.status }}</td>
                <td>{{ formatDate(h.changedAt) }}</td>
                <td>{{ h.changedByUserId ?? "-" }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p v-if="error" class="mt-2 text-danger">{{ error }}</p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../api/axios";
import { uiMessages } from "../messages/uiMessages";
import { toast } from "../services/toast";

const statuses = ["PENDING", "PAID", "CANCELLED"];

const orders = ref([]);
const total = ref(0);
const page = ref(1);
const limit = ref(10);
const q = ref("");
const statusFilter = ref("");
const dateFrom = ref("");
const dateTo = ref("");
const userIdFilter = ref(null);
const error = ref("");

const selected = ref(null);

const selectedIds = ref([]);
const batchStatus = ref("");

const totalPages = computed(() =>
  Math.max(1, Math.ceil(total.value / limit.value)),
);
const allSelected = computed(
  () =>
    orders.value.length > 0 && selectedIds.value.length === orders.value.length,
);

const formatPrice = (value) =>
  (Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100).toFixed(2);

const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString();
};

const getTotal = (order) => {
  return (order.items || []).reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );
};

const buildFilters = () => {
  const filters = {};
  if (statusFilter.value) filters.status = statusFilter.value;
  if (userIdFilter.value) filters.userId = userIdFilter.value;
  if (dateFrom.value || dateTo.value) {
    filters.dateFrom = dateFrom.value || undefined;
    filters.dateTo = dateTo.value || undefined;
  }
  return Object.keys(filters).length ? JSON.stringify(filters) : undefined;
};

const loadOrders = async () => {
  try {
    const res = await api.get("/orders");
    const all = res.data || [];

    let filtered = all;
    if (q.value) {
      const qv = q.value.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          String(o.id).includes(qv) ||
          String(o.user?.email || o.userId || "").toLowerCase().includes(qv),
      );
    }
    if (statusFilter.value) {
      filtered = filtered.filter((o) => o.status === statusFilter.value);
    }
    if (userIdFilter.value) {
      filtered = filtered.filter((o) => o.userId === userIdFilter.value);
    }
    if (dateFrom.value) {
      const from = new Date(dateFrom.value);
      filtered = filtered.filter((o) => new Date(o.orderDate) >= from);
    }
    if (dateTo.value) {
      const to = new Date(dateTo.value);
      filtered = filtered.filter((o) => new Date(o.orderDate) <= to);
    }

    total.value = filtered.length;
    const start = (page.value - 1) * limit.value;
    orders.value = filtered.slice(start, start + limit.value);
    selectedIds.value = [];
  } catch {
    error.value = "Erreur lors du chargement des commandes.";
  }
};

const applyFilters = () => {
  page.value = 1;
  loadOrders();
};

const selectOrder = async (order) => {
  const res = await api.get(`/orders/${order.id}`);
  selected.value = res.data || order;
  setTimeout(() => {
    const el = document.getElementById("order-details");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 0);
};

const updateStatus = async () => {
  if (!selected.value) return;
  await api.patch(`/orders/${selected.value.id}/status`, {
    status: selected.value.status,
  });
  toast.success(uiMessages.orders.statusUpdated);
  await loadOrders();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const deleteOrder = async (order) => {
  if (!confirm(uiMessages.orders.deleteConfirm)) return;
  await api.delete(`/orders/${order.id}`);
  if (selected.value?.id === order.id) selected.value = null;
  await loadOrders();
};

const exportCsv = async () => {
  const res = await api.get("/admin/orders/export", { responseType: "blob" });
  const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "orders.csv";
  link.click();
  URL.revokeObjectURL(link.href);
};

const batchUpdateStatus = async () => {
  if (!batchStatus.value || selectedIds.value.length === 0) return;
  await api.post("/admin/orders/batch-status", {
    ids: selectedIds.value,
    status: batchStatus.value,
  });
  batchStatus.value = "";
  await loadOrders();
};

const batchDelete = async () => {
  if (selectedIds.value.length === 0) return;
  if (!confirm(uiMessages.orders.deleteConfirm)) return;
  await api.post("/admin/orders/batch-delete", { ids: selectedIds.value });
  await loadOrders();
};

const toggleAll = () => {
  if (allSelected.value) {
    selectedIds.value = [];
  } else {
    selectedIds.value = orders.value.map((o) => o.id);
  }
};

const prevPage = () => {
  if (page.value > 1) {
    page.value -= 1;
    loadOrders();
  }
};

const nextPage = () => {
  if (page.value < totalPages.value) {
    page.value += 1;
    loadOrders();
  }
};

onMounted(loadOrders);
</script>

<style scoped>
.inline-select {
  width: auto;
  display: inline-block;
  margin-left: 8px;
}
</style>
