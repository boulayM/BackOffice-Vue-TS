<template>
  <section class="ds-container">
    <div class="dashboard-card">
      <h1 class="dashboard-title">Dashboard</h1>
      <p class="dashboard-subtitle">Vue d ensemble des donnees BackOffice.</p>

      <div class="mt-3 grid grid-md-2 grid-lg-4">
        <div class="card-ui kpi-card">
          <h2>Users</h2>
          <p class="kpi-value">{{ metrics.users }}</p>
        </div>
        <div class="card-ui kpi-card">
          <h2>Orders</h2>
          <p class="kpi-value">{{ metrics.orders }}</p>
        </div>
        <div class="card-ui kpi-card">
          <h2>Revenue</h2>
          <p class="kpi-value">{{ formatPrice(metrics.revenue) }} EUR</p>
        </div>
        <div class="card-ui kpi-card">
          <h2>Products</h2>
          <p class="kpi-value">{{ metrics.products }}</p>
        </div>
      </div>

      <div class="mt-3 grid grid-md-2">
        <div class="card-ui">
          <h2>Users (statuts)</h2>
          <div class="metric-line">
            Verifies: <strong>{{ usersMetrics.verified }}</strong>
          </div>
          <div class="metric-line">
            Non verifies: <strong>{{ usersMetrics.unverified }}</strong>
          </div>
        </div>
        <div class="card-ui">
          <h2>Products (statuts)</h2>
          <div class="metric-line">
            Actifs: <strong>{{ productsMetrics.active }}</strong>
          </div>
          <div class="metric-line">
            Inactifs: <strong>{{ productsMetrics.inactive }}</strong>
          </div>
        </div>
      </div>

      <div class="mt-3 grid grid-md-2">
        <div class="card-ui">
          <h2>Orders by status</h2>
          <table class="table-ui">
            <thead>
              <tr>
                <th>Status</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in statusList" :key="s.status">
                <td>{{ s.status }}</td>
                <td>{{ s.count }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="card-ui">
          <h2>Audit logs</h2>
          <div class="metric-line">
            Total: <strong>{{ auditMetrics.total }}</strong>
          </div>
        </div>
      </div>

      <div class="mt-3 card-ui">
        <h2>Alerts / anomalies</h2>
        <ul class="alerts" v-if="alerts.length">
          <li v-for="a in alerts" :key="a">{{ a }}</li>
        </ul>
        <p v-else class="muted">Aucune alerte.</p>
      </div>

      <div class="mt-3 card-ui">
        <h2>Actions rapides</h2>
        <div class="mt-2 grid grid-md-2 grid-lg-4">
          <RouterLink class="btn-ui" to="/users">Gerer utilisateurs</RouterLink>
          <RouterLink class="btn-ui" to="/products">Gerer produits</RouterLink>
          <RouterLink class="btn-ui" to="/orders">Gerer commandes</RouterLink>
          <RouterLink class="btn-ui" to="/audit-logs"
            >Voir audit logs</RouterLink
          >
        </div>
      </div>

      <div class="mt-3 grid grid-md-2">
        <div class="card-ui">
          <h2>Dernieres commandes</h2>
          <table class="table-ui">
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in recentOrders" :key="o.id">
                <td>{{ o.id }}</td>
                <td>{{ o.status }}</td>
                <td>{{ formatPrice(o.totalAmount ?? getTotal(o)) }} EUR</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card-ui">
          <h2>Derniers users</h2>
          <table class="table-ui">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in recentUsers" :key="u.id">
                <td>{{ u.email }}</td>
                <td>{{ u.role }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="mt-3 card-ui">
        <h2>Audit logs recents</h2>
        <template v-if="enableAuditLogs">
          <table class="table-ui">
            <thead>
              <tr>
                <th>Action</th>
                <th>User</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="l in recentLogs" :key="l.id">
                <td>{{ l.action }}</td>
                <td>{{ l.userEmail || l.userId }}</td>
                <td>{{ formatDate(l.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </template>
        <p v-else class="muted">Audit-logs indisponible en prod</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { RouterLink } from "vue-router";
import api from "../api/axios";

const enableAuditLogs = import.meta.env.VITE_ENABLE_AUDIT_LOGS === "true";

const metrics = ref({
  orders: 0,
  revenue: 0,
  users: 0,
  products: 0,
  ordersByStatus: {},
});

const usersMetrics = ref({ total: 0, verified: 0, unverified: 0 });
const productsMetrics = ref({ total: 0, active: 0, inactive: 0 });
const ordersMetrics = ref({ total: 0, byStatus: {} });
const auditMetrics = ref({ total: 0 });

const recentOrders = ref([]);
const recentUsers = ref([]);
const recentLogs = ref([]);

const getTotal = (order) =>
  (order.items || []).reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );

const formatPrice = (value) =>
  (Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100).toFixed(2);

const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString();
};

const statusList = computed(() => {
  const map =
    metrics.value.ordersByStatus || ordersMetrics.value.byStatus || {};
  return Object.keys(map).map((status) => ({ status, count: map[status] }));
});

const alerts = computed(() => {
  const list = [];
  const pending =
    metrics.value.ordersByStatus?.PENDING ??
    ordersMetrics.value.byStatus?.PENDING ??
    0;
  const inactive = productsMetrics.value.inactive ?? 0;
  const unverified = usersMetrics.value.unverified ?? 0;

  if (pending > 0) list.push(`${pending} commandes en attente`);
  if (inactive > 0) list.push(`${inactive} produits inactifs`);
  if (unverified > 0) list.push(`${unverified} comptes non verifies`);

  return list;
});

const loadMetrics = async () => {
  const requests = [
    api.get("/users"),
    api.get("/products"),
    api.get("/orders"),
  ];

  let auditRes = null;
  if (enableAuditLogs) {
    requests.push(api.get("/audit-logs", { params: { page: 1, limit: 1 } }));
  }

  const [usersRes, productsRes, ordersRes, auditMaybe] =
    await Promise.all(requests);

  if (enableAuditLogs) auditRes = auditMaybe;

  const usersAll = usersRes.data?.users || usersRes.data || [];
  const users = usersAll.filter((u) => u.role !== "ADMIN");
  const products = productsRes.data || [];
  const orders = ordersRes.data || [];
  const auditTotal = enableAuditLogs
    ? (auditRes?.data?.total ?? auditRes?.data?.data?.length ?? 0)
    : 0;

  metrics.value.users = users.length;
  metrics.value.products = products.length;
  metrics.value.orders = orders.length;
  metrics.value.revenue = orders.reduce((sum, o) => sum + getTotal(o), 0);

  const byStatus = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  metrics.value.ordersByStatus = byStatus;
  usersMetrics.value = {
    total: users.length,
    verified: users.filter((u) => u.emailVerified).length,
    unverified: users.filter((u) => !u.emailVerified).length,
  };
  productsMetrics.value = {
    total: products.length,
    active: products.filter((p) => p.isActive).length,
    inactive: products.filter((p) => !p.isActive).length,
  };
  ordersMetrics.value = { total: orders.length, byStatus };
  auditMetrics.value = { total: auditTotal };
};

const loadRecent = async () => {
  const [ordersRes, usersRes] = await Promise.all([
    api.get("/orders", {
      params: { page: 1, limit: 5, sort: "orderDate", order: "desc" },
    }),
    api.get("/users", {
      params: { page: 1, limit: 5, sort: "id", order: "desc" },
    }),
  ]);

  const orders =
    ordersRes.data?.data || ordersRes.data?.orders || ordersRes.data || [];
  const usersRaw =
    usersRes.data?.data || usersRes.data?.users || usersRes.data || [];
  const users = usersRaw
    .filter((u) => u.role !== "ADMIN")
    .sort((a, b) => b.id - a.id);

  recentOrders.value = orders;
  recentUsers.value = users.slice(0, 5);
};

const loadLogs = async () => {
  if (!enableAuditLogs) {
    recentLogs.value = [];
    return;
  }
  const res = await api.get("/audit-logs", {
    params: { page: 1, limit: 5, sort: "createdAt", order: "desc" },
  });
  const logs = res.data?.data || res.data || [];
  recentLogs.value = logs;
};

onMounted(async () => {
  await loadMetrics();
  await loadRecent();
  if (enableAuditLogs) {
    await loadLogs();
  }
});
</script>

<style scoped>
.dashboard-card {
  width: 100%;
  background: #fff;
  border: 1px solid #000;
  padding: 24px;
}
.dashboard-title {
  text-align: center;
}
.dashboard-subtitle {
  text-align: center;
  margin-bottom: 12px;
}
.kpi-card {
  text-align: center;
}
.kpi-value {
  font-size: 20px;
  font-weight: 700;
}
.metric-line {
  margin-top: 6px;
}
.alerts {
  margin: 0;
  padding-left: 16px;
}
.muted {
  color: #555;
}
</style>
