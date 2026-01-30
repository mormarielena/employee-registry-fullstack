<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useEmployeesStore } from "@/stores/employeesStore";
import { useAuthStore } from "@/stores/useAuthStore"; 
import EmployeeForm from "@/views/EmployeeForm.vue"; 

const store = useEmployeesStore();
const authStore = useAuthStore();

const isEditing = ref(false);
const selectedEmployee = ref(null);

//filtrare 
const searchQuery = ref("");
const sortBy = ref("name");
const sortOrder = ref("asc");

const setSort = (criterion) => {
  if (sortBy.value === criterion) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = criterion;
    sortOrder.value = "asc";
  }
};

const showToast = ref(false);
const toastMessage = ref("");
const toastType = ref("success"); 

const triggerToast = (message, type = "success") => {
  toastMessage.value = message;
  toastType.value = type;
  showToast.value = true;
  setTimeout(() => { showToast.value = false; }, 3000);
};

const stats = computed(() => {
  const list = store.employees || [];
  const total = list.length;
  const budget = list.reduce((sum, e) => sum + (Number(e.employmentDetails?.salary) || 0), 0);
  let newest = "N/A";

  if (total > 0) {
    const sortedByDate = [...list].sort((a, b) => {
      return new Date(b.employmentDetails?.startDate) - new Date(a.employmentDetails?.startDate);
    });
    const lastHire = sortedByDate[0].personalInfo;
    newest = lastHire ? `${lastHire.firstName} ${lastHire.lastName}` : "N/A";
  }
  
  return { total, budget, newest };
});

const filteredEmployees = computed(() => {
  let list = [...(store.employees || [])];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    list = list.filter(e => 
      e.personalInfo?.firstName.toLowerCase().includes(query) || 
      e.personalInfo?.lastName.toLowerCase().includes(query) ||
      e.employmentDetails?.position.toLowerCase().includes(query)
    );
  }

  list.sort((a, b) => {
    let modifier = sortOrder.value === "asc" ? 1 : -1;
    
    if (sortBy.value === "salary") {
      const salA = Number(a.employmentDetails?.salary || 0);
      const salB = Number(b.employmentDetails?.salary || 0);
      return (salA - salB) * modifier;
    }
    
    if (sortBy.value === "date") {
      const dateA = new Date(a.employmentDetails?.startDate || 0);
      const dateB = new Date(b.employmentDetails?.startDate || 0);
      return (dateA - dateB) * modifier;
    }
    
    const nameA = `${a.personalInfo?.firstName} ${a.personalInfo?.lastName}`.toLowerCase();
    const nameB = `${b.personalInfo?.firstName} ${b.personalInfo?.lastName}`.toLowerCase();
    return nameA.localeCompare(nameB) * modifier;
  });

  return list;
});

const startEdit = (employee) => {
  selectedEmployee.value = employee;
  isEditing.value = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelEdit = () => {
  isEditing.value = false;
  selectedEmployee.value = null;
};

const handleSaved = (msg) => {
  triggerToast(msg, "success");
};

const confirmDelete = async (id) => {
  if (confirm("Are you sure you want to remove this employee?")) {
    try {
      await store.deleteEmployee(id);
      triggerToast("Employee removed successfully", "success");
    } catch {
      triggerToast("Failed to delete employee", "error");
    }
  }
};

onMounted(() => {
  if (authStore.userProfile?.companyId) store.fetchEmployees();
});

watch(() => authStore.userProfile?.companyId, (id) => {
  if (id) store.fetchEmployees();
});
</script>

<template>
  <div class="view-container">
    <Transition name="toast">
      <div v-if="showToast" class="toast-notification" :class="toastType">
        {{ toastMessage }}
      </div>
    </Transition>

    <div class="view-card">
      <header class="view-header">
        <h2>Director Dashboard</h2>
        <p>Manage your company's human resources efficiently.</p>
      </header>

      <section class="stats-grid">
        <div class="stat-card">
          <span class="stat-label">Total Employees</span>
          <span class="stat-value">{{ stats.total }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Monthly Budget</span>
          <span class="stat-value">{{ stats.budget.toLocaleString() }} RON</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Newest Hire</span>
          <span class="stat-value truncate">{{ stats.newest }}</span>
        </div>
      </section>

      <EmployeeForm 
        :editMode="isEditing" 
        :employeeToEdit="selectedEmployee" 
        @cancelEdit="cancelEdit"
        @saved="handleSaved"
      />

      <hr class="divider" />

      <div class="controls-container">
        <div class="search-wrapper">
          <svg viewBox="0 0 24 24" width="20" height="20" class="search-icon">
            <path fill="currentColor" d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
          </svg>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search name or position..." 
            class="search-input"
          />
        </div>

        <div class="sort-controls">
          <span class="sort-label">Sort by:</span>
          <div class="sort-buttons">
            <button @click="setSort('name')" :class="{ active: sortBy === 'name' }">
              Name {{ sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
            </button>
            <button @click="setSort('salary')" :class="{ active: sortBy === 'salary' }">
              Salary {{ sortBy === 'salary' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
            </button>
            <button @click="setSort('date')" :class="{ active: sortBy === 'date' }">
              Date {{ sortBy === 'date' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
            </button>
          </div>
        </div>
      </div>

      <div class="employee-list">
        <div v-if="!authStore.userProfile" class="loading-state">
          <div class="spinner"></div>
          <p>Loading company profile...</p>
        </div>

        <template v-else>
          <div v-for="e in filteredEmployees" :key="e.id" class="employee-item">
            <div class="employee-info">
              <h3>{{ e.personalInfo?.firstName }} {{ e.personalInfo?.lastName }}</h3>
              <div class="employee-details">
                <span>{{ e.employmentDetails?.position }}</span>
              </div>
            </div>
            
            <div class="actions">
              <button @click="startEdit(e)" class="edit-btn" title="Edit">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6.02 20.71,5.63L18.37,3.29C17.98,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                </svg>
              </button>
              <button @click="confirmDelete(e.id)" class="delete-btn" title="Remove">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19V4M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div v-if="filteredEmployees.length === 0" class="empty-state">
            <p v-if="searchQuery">No results for "{{ searchQuery }}".</p>
            <p v-else>Your team is empty. Start by adding members above.</p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "../assets/EmployeeView.css";
</style>