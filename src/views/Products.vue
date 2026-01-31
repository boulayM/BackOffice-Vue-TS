<template>
  <section class="ds-container">
    <div class="card-ui">
      <h1>Produits</h1>

      <div class="mt-2 grid grid-md-2">
        <div>
          <label class="form-label mr-space-2">Recherche</label>
          <input
            id="productsSearch"
            class="form-control"
            v-model="q"
            placeholder="Nom, description..."
            @keyup.enter="applyFilters"
          />
        </div>
        <div>
          <label class="form-label mr-space-2">Actif</label>
          <select
            id="productsActiveFilter"
            class="form-control"
            v-model="activeFilter"
            @change="applyFilters"
          >
            <option value="">Tous</option>
            <option value="true">Actifs</option>
            <option value="false">Inactifs</option>
          </select>
        </div>
      </div>

      <div class="mt-3 grid grid-md-2">
        <div>
          <label class="form-label">Creer un produit</label>
          <form class="form-ui" @submit.prevent="createProduct">
            <div class="form-row">
              <label class="form-label" for="productName">Nom</label>
              <input
                id="productName"
                class="form-control"
                v-model="form.name"
                required
              />
            </div>
            <div class="form-row">
              <label class="form-label" for="productDescription"
                >Description</label
              >
              <input
                id="productDescription"
                class="form-control"
                v-model="form.description"
                required
              />
            </div>
            <div class="form-row">
              <label class="form-label" for="productPrice">Prix</label>
              <input
                id="productPrice"
                class="form-control"
                type="number"
                step="0.01"
                v-model.number="form.price"
                required
              />
            </div>
            <div class="form-row">
              <label class="form-label" for="productIsActive">Actif</label>
              <input
                id="productIsActive"
                type="checkbox"
                v-model="form.isActive"
              />
            </div>
            <div class="actions">
              <button class="btn-ui btn-primary" type="submit">Creer</button>
            </div>
          </form>
        </div>

        <div v-if="editing" class="card-ui bkg-gray-100">
          <label class="form-label">Editer</label>
          <form class="form-ui" @submit.prevent="updateProduct">
            <div class="form-row">
              <label class="form-label" for="editName">Nom</label>
              <input
                id="editProductName"
                class="form-control"
                v-model="edit.name"
              />
            </div>
            <div class="form-row">
              <label class="form-label" for="editDescription"
                >Description</label
              >
              <input
                id="editProductDescription"
                class="form-control"
                v-model="edit.description"
              />
            </div>
            <div class="form-row">
              <label class="form-label" for="editPrice">Prix</label>
              <input
                id="editProductPrice"
                class="form-control"
                type="number"
                step="0.01"
                v-model.number="edit.price"
              />
            </div>
            <div class="form-row">
              <label class="form-label" for="editIsActive">Actif</label>
              <input
                id="editProductIsActive"
                type="checkbox"
                v-model="edit.isActive"
              />
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
            <button
              class="btn-ui"
              :disabled="selectedIds.length === 0"
              @click="batchDeactivate"
            >
              Desactiver
            </button>
            <button
              class="btn-ui"
              :disabled="selectedIds.length === 0"
              @click="batchActivate"
            >
              Activer
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
              <th>Nom</th>
              <th>Prix</th>
              <th>Actif</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in products" :key="p.id">
              <td>
                <input type="checkbox" v-model="selectedIds" :value="p.id" />
              </td>
              <td>{{ p.name }}</td>
              <td>{{ p.price }} EUR</td>
              <td>{{ p.isActive ? "Oui" : "Non" }}</td>
              <td>
                <button class="btn-ui" @click="editProduct(p)">Editer</button>
                <button class="btn-ui" @click="deleteProduct(p)">
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

      <p v-if="error" class="mt-2 text-danger">{{ error }}</p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../api/axios";
import { uiMessages } from "../messages/uiMessages";

const products = ref([]);
const total = ref(0);
const page = ref(1);
const limit = ref(10);
const q = ref("");
const activeFilter = ref("");
const error = ref("");
const loading = ref(false);

const selectedIds = ref([]);

const form = ref({
  name: "",
  description: "",
  price: 0,
  isActive: true,
});

const editing = ref(false);
const edit = ref({
  id: null,
  name: "",
  description: "",
  price: 0,
  isActive: true,
});
const original = ref(null);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(total.value / limit.value)),
);
const allSelected = computed(
  () =>
    products.value.length > 0 &&
    selectedIds.value.length === products.value.length,
);

const buildFilters = () => {
  const filters = {};
  if (activeFilter.value === "true") filters.isActive = true;
  if (activeFilter.value === "false") filters.isActive = false;
  return Object.keys(filters).length ? JSON.stringify(filters) : undefined;
};

const loadProducts = async () => {
  loading.value = true;
  error.value = "";
  try {
    const res = await api.get("/admin/products", {
      params: {
        page: page.value,
        limit: limit.value,
        sort: "id",
        order: "desc",
        q: q.value || undefined,
        filters: buildFilters(),
      },
    });
    products.value = res.data?.data || res.data?.products || res.data || [];
    total.value = res.data?.total ?? products.value.length;
    selectedIds.value = [];
  } catch {
    error.value = "Erreur lors du chargement des produits.";
  } finally {
    loading.value = false;
  }
};

const applyFilters = () => {
  page.value = 1;
  loadProducts();
};

const createProduct = async () => {
  await api.post("/products", form.value);
  form.value = { name: "", description: "", price: 0, isActive: true };
  await loadProducts();
};

const editProduct = (p) => {
  editing.value = true;
  edit.value = {
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    isActive: p.isActive,
  };
  original.value = {
    name: p.name,
    description: p.description,
    price: p.price,
    isActive: p.isActive,
  };
};

const cancelEdit = () => {
  editing.value = false;
  edit.value = {
    id: null,
    name: "",
    description: "",
    price: 0,
    isActive: true,
  };
  original.value = null;
};

const updateProduct = async () => {
  const payload = {};
  const base = original.value || {};
  const name = edit.value.name;
  if (name != null && name !== "" && name !== base.name) payload.name = name;

  const description = edit.value.description;
  if (
    description != null &&
    description !== "" &&
    description !== base.description
  ) {
    payload.description = description;
  }

  const price =
    typeof edit.value.price === "number"
      ? edit.value.price
      : Number(edit.value.price);
  if (Number.isFinite(price) && price !== base.price) payload.price = price;

  if (
    typeof edit.value.isActive === "boolean" &&
    edit.value.isActive !== base.isActive
  ) {
    payload.isActive = edit.value.isActive;
  }

  if (Object.keys(payload).length === 0) {
    cancelEdit();
    return;
  }

  await api.patch(`/products/${edit.value.id}`, payload);
  cancelEdit();
  await loadProducts();
};

const deleteProduct = async (p) => {
  if (!confirm(uiMessages.products.deleteConfirm(p.name))) return;
  await api.delete(`/products/${p.id}`);
  await loadProducts();
};

const exportCsv = async () => {
  const res = await api.get("/admin/products/export", { responseType: "blob" });
  const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "products.csv";
  link.click();
  URL.revokeObjectURL(link.href);
};

const batchDeactivate = async () => {
  if (selectedIds.value.length === 0) return;
  await api.post("/admin/products/batch-update", {
    ids: selectedIds.value,
    data: { isActive: false },
  });
  await loadProducts();
};

const batchActivate = async () => {
  if (selectedIds.value.length === 0) return;
  await api.post("/admin/products/batch-update", {
    ids: selectedIds.value,
    data: { isActive: true },
  });
  await loadProducts();
};

const batchDelete = async () => {
  if (selectedIds.value.length === 0) return;
  if (!confirm(uiMessages.products.deleteConfirm(selectedIds.value.length)))
    return;
  await api.post("/admin/products/batch-delete", { ids: selectedIds.value });
  await loadProducts();
};

const toggleAll = () => {
  if (allSelected.value) {
    selectedIds.value = [];
  } else {
    selectedIds.value = products.value.map((p) => p.id);
  }
};

const prevPage = () => {
  if (page.value > 1) {
    page.value -= 1;
    loadProducts();
  }
};

const nextPage = () => {
  if (page.value < totalPages.value) {
    page.value += 1;
    loadProducts();
  }
};

onMounted(loadProducts);
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
</style>
