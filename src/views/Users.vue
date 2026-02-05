<template>
  <section class="ds-container">
    <div class="card-ui">
      <h1>Utilisateurs</h1>

      <div class="mt-2 grid grid-md-2">
        <div>
          <label class="form-label mr-space-2">Recherche</label>
          <input
            id="usersSearch"
            class="form-control"
            v-model="q"
            placeholder="Email, id..."
            @keyup.enter="applyFilters"
          />
        </div>
        <div>
          <label class="form-label mr-space-2">Role</label>
          <select
            id="usersRoleFilter"
            class="form-control"
            v-model="roleFilter"
            @change="applyFilters"
          >
            <option value="">Tous</option>
            <option v-for="r in roles" :key="r" :value="r" :disabled="r !== 'USER'">{{ r }}</option>
          </select>
        </div>
      </div>

      <div class="mt-3 grid grid-md-2">
        <div>
          <label class="form-label">Creer un utilisateur</label>
          <form class="form-ui" @submit.prevent="createUser" autocomplete="off">
            <div class="form-row">
              <label class="form-label" for="userFirstName">Prenom</label>
              <input
                id="userFirstName" autocomplete="off"
                class="form-control"
                v-model="form.firstName"
                required
              />
            </div>
            <div class="form-row">
              <label class="form-label" for="userLastName">Nom</label>
              <input
                id="userLastName" autocomplete="off"
                class="form-control"
                v-model="form.lastName"
                required
              />
            </div>
            <div class="form-row">
              <label class="form-label" for="userEmail">Email</label>
              <input
                id="userEmail" autocomplete="off"
                class="form-control"
                type="email"
                v-model="form.email"
                required
              />
            </div>
            <div class="form-row">
              <label class="form-label" for="userPassword">Mot de passe</label>
              <input
                id="userPassword" autocomplete="new-password"
                class="form-control"
                type="password"
                v-model="form.password"
                required
              />
            </div>
            <div class="form-row">
              <label class="form-label" for="userRole">Role</label>
              <select id="userRole" class="form-control" v-model="form.role">
                <option v-for="r in roles" :key="r" :value="r" :disabled="r !== 'USER'">{{ r }}</option>
              </select>
            </div>
            <div class="actions">
              <button class="btn-ui btn-primary" type="submit">Creer</button>
            </div>
          </form>
        </div>

        <div v-if="editing" class="card-ui bkg-gray-100">
          <label class="form-label">Editer</label>
          <form class="form-ui" @submit.prevent="updateUser">
            <div class="form-row">
              <label class="form-label" for="editFirstName">Prenom</label>
              <input
                id="editUserFirstName"
                class="form-control"
                v-model="edit.firstName"
              />
            </div>
            <div class="form-row">
              <label class="form-label" for="editLastName">Nom</label>
              <input
                id="editUserLastName"
                class="form-control"
                v-model="edit.lastName"
              />
            </div>
            <div class="form-row">
              <label class="form-label" for="editEmail">Email</label>
              <input
                id="editUserEmail"
                class="form-control"
                type="email"
                v-model="edit.email"
              />
            </div>
            <div class="form-row">
              <label class="form-label" for="editRole">Role</label>
              <select
                id="editUserRole"
                class="form-control"
                v-model="edit.role"
              >
                <option v-for="r in roles" :key="r" :value="r" :disabled="r !== 'USER'">{{ r }}</option>
              </select>
            </div>
            <div class="actions">
              <button class="btn-ui btn-primary" type="submit">
                Enregistrer
              </button>
              <button class="btn-ui" type="button" @click="cancelEdit">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="mt-3 card-ui">
        <div class="grid grid-md-2">
          <div>
            <button class="btn-ui" @click="exportCsv">Export CSV</button>
          </div>
          <div class="text-right">
            <select class="form-control inline-select" v-model="batchRole">
              <option value="">Role batch...</option>
              <option v-for="r in roles" :key="r" :value="r" :disabled="r !== 'USER'">{{ r }}</option>
            </select>
            <button
              class="btn-ui"
              :disabled="selectedIds.length === 0 || !batchRole"
              @click="batchUpdateRole"
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
              <th>Email</th>
              <th>Nom</th>
              <th>Role</th>
              <th>Verified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td>
                <input type="checkbox" v-model="selectedIds" :value="u.id" />
              </td>
              <td>{{ u.email }}</td>
              <td>{{ u.firstName }} {{ u.lastName }}</td>
              <td>{{ u.role }}</td>
              <td>{{ u.emailVerified ? "Yes" : "No" }}</td>
              <td>
                <button class="btn-ui" @click="editUser(u)">Editer</button>
                <button class="btn-ui" @click="deleteUser(u)">Supprimer</button>
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

      <p v-if="error" class="mt-2 text-danger">{{ error }}</p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../api/axios";
import { uiMessages } from "../messages/uiMessages";
import { toast } from "../services/toast";

const roles = ["ADMIN", "MANAGER", "SUPPORT", "READONLY", "USER"];

const users = ref([]);
const total = ref(0);
const page = ref(1);
const limit = ref(10);
const q = ref("");
const roleFilter = ref("");
const error = ref("");
const loading = ref(false);

const selectedIds = ref([]);
const batchRole = ref("");

const form = ref({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "USER",
});

const editing = ref(false);
const edit = ref({
  id: null,
  firstName: "",
  lastName: "",
  email: "",
  role: "USER",
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(total.value / limit.value)),
);

const allSelected = computed(
  () =>
    users.value.length > 0 && selectedIds.value.length === users.value.length,
);

const loadUsers = async () => {
  loading.value = true;
  error.value = "";
  try {
    const res = await api.get("/users");
    const all = res.data?.users || res.data || [];

    let filtered = all.filter((u) => u.role !== "ADMIN");
    if (q.value) {
      const qv = q.value.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          String(u.id).includes(qv) ||
          String(u.email || "")
            .toLowerCase()
            .includes(qv),
      );
    }
    if (roleFilter.value) {
      filtered = filtered.filter((u) => u.role === roleFilter.value);
    }

    filtered = filtered.sort((a, b) => b.id - a.id);

    total.value = filtered.length;
    const start = (page.value - 1) * limit.value;
    users.value = filtered.slice(start, start + limit.value);
    selectedIds.value = [];
  } catch {
    error.value = "Erreur lors du chargement des utilisateurs.";
  } finally {
    loading.value = false;
  }
};

const applyFilters = () => {
  page.value = 1;
  loadUsers();
};

const createUser = async () => {
  try {
    await api.post("/users/register", { ...form.value, role: "USER" });
    form.value = {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "USER",
    };
    page.value = 1;
    toast.success(uiMessages.users.created);
    await loadUsers();
  } catch {
    toast.error(uiMessages.users.createError);
  }
};

const editUser = (u) => {
  editing.value = true;
  edit.value = {
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    role: u.role || "USER",
  };
};

const cancelEdit = () => {
  editing.value = false;
  edit.value = {
    id: null,
    firstName: "",
    lastName: "",
    email: "",
    role: "USER",
  };
};

const updateUser = async () => {
  try {
    await api.patch(`/users/${edit.value.id}`, {
      firstName: edit.value.firstName,
      lastName: edit.value.lastName,
      email: edit.value.email,
      role: edit.value.role,
    });
    cancelEdit();
    toast.success(uiMessages.users.updated);
    await loadUsers();
  } catch {
    toast.error(uiMessages.users.updateError);
  }
};

const deleteUser = async (u) => {
  if (!confirm(uiMessages.users.deleteConfirm(u.email))) return;
  await api.delete(`/users/${u.id}`);
  await loadUsers();
};

const exportCsv = async () => {
  const res = await api.get("/admin/users/export", { responseType: "blob" });
  const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "users.csv";
  link.click();
  URL.revokeObjectURL(link.href);
};

const batchUpdateRole = async () => {
  if (!batchRole.value || selectedIds.value.length === 0) return;
  await api.post("/admin/users/batch-update", {
    ids: selectedIds.value,
    data: { role: batchRole.value },
  });
  batchRole.value = "";
  await loadUsers();
};

const batchDelete = async () => {
  if (selectedIds.value.length === 0) return;
  if (!confirm(uiMessages.users.deleteConfirm(selectedIds.value.length)))
    return;
  await api.post("/admin/users/batch-delete", { ids: selectedIds.value });
  await loadUsers();
};

const toggleAll = () => {
  if (allSelected.value) {
    selectedIds.value = [];
  } else {
    selectedIds.value = users.value.map((u) => u.id);
  }
};

const prevPage = () => {
  if (page.value > 1) {
    page.value -= 1;
    loadUsers();
  }
};

const nextPage = () => {
  if (page.value < totalPages.value) {
    page.value += 1;
    loadUsers();
  }
};

onMounted(loadUsers);
</script>

<style scoped>
.form-ui {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.form-row {
  width: 100%;
  display: grid;
  grid-template-columns: 140px 1fr;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
}
.actions {
  margin-top: 16px;
  text-align: center;
}
.inline-select {
  width: auto;
  display: inline-block;
  margin-right: 8px;
}
</style>
