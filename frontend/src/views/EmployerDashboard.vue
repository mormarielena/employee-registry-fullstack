<script setup>
import { ref, onMounted, computed } from 'vue';
import { useEmployeesStore } from '@/stores/employeesStore';
import { useAuthStore } from '@/stores/useAuthStore';

const store = useEmployeesStore();
const authStore = useAuthStore();

const newDelegate = ref({
  firstName: '',
  lastName: '',
  position: '',
  cnp: '',
  email: '',
  role: 'hr'
});

const isFirstNameValid = computed(() => 
  !newDelegate.value.firstName || /^[a-zA-ZăâîșțĂÂÎȘȚ\- ]{2,}$/.test(newDelegate.value.firstName)
);

const isLastNameValid = computed(() => 
  !newDelegate.value.lastName || /^[a-zA-ZăâîșțĂÂÎȘȚ\- ]{2,}$/.test(newDelegate.value.lastName)
);

const isEmailValid = computed(() => 
  !newDelegate.value.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newDelegate.value.email)
);

const isCNPValid = computed(() => 
  !newDelegate.value.cnp || /^[0-9]{13}$/.test(newDelegate.value.cnp)
);

const isFormValid = computed(() => {
  return (
    newDelegate.value.firstName && isFirstNameValid.value &&
    newDelegate.value.lastName && isLastNameValid.value &&
    newDelegate.value.email && isEmailValid.value &&
    newDelegate.value.cnp && isCNPValid.value &&
    newDelegate.value.position
  );
});

const handleAddDelegate = async () => {
  if (!isFormValid.value) return;
  
  try {
    await store.addDelegatedMember({ ...newDelegate.value });
    newDelegate.value = { firstName: '', lastName: '', position: '', cnp: '', email: '', role: 'hr' };
    alert("Person delegated successfully!");
  } catch (error) {
    console.error("Delegation failed:", error);
  }
};

onMounted(() => {
  if (authStore.userProfile?.companyId) {
    store.fetchDelegatedMembers();
  }
}); 
</script>

<template>
  <div class="admin-container">
    <header class="admin-header">
      <h1>Employer Registry</h1>
      <p>Management and Administrative Delegation</p>
    </header>

    <div class="admin-grid">
      <section class="admin-card">
        <div class="card-header">
          <h3>Delegate New Person</h3>
          <p>Only people added here can access your company records.</p>
        </div>

        <form @submit.prevent="handleAddDelegate" class="delegate-form">
          <div class="input-group">
            <div class="form-group">
              <input v-model="newDelegate.firstName" type="text" placeholder="First Name" :class="{ 'input-error': !isFirstNameValid }" required />
              <span v-if="!isFirstNameValid" class="error-hint">Min. 2 letters.</span>
            </div>
            <div class="form-group">
              <input v-model="newDelegate.lastName" type="text" placeholder="Last Name" :class="{ 'input-error': !isLastNameValid }" required />
              <span v-if="!isLastNameValid" class="error-hint">Min. 2 letters.</span>
            </div>
          </div>

          <div class="form-group">
            <input v-model="newDelegate.email" type="email" placeholder="Email Address (Login Email)" :class="{ 'input-error': !isEmailValid }" required />
            <span v-if="!isEmailValid" class="error-hint">Invalid email format.</span>
          </div>

          <div class="form-group">
            <input v-model="newDelegate.cnp" type="text" placeholder="CNP (13 digits)" maxlength="13" :class="{ 'input-error': !isCNPValid }" required />
            <span v-if="!isCNPValid" class="error-hint">Must be 13 digits.</span>
          </div>
          
          <div class="input-group">
            <div class="form-group">
              <input v-model="newDelegate.position" type="text" placeholder="Position" required />
            </div>
            <div class="form-group">
              <select v-model="newDelegate.role">
                <option value="hr">HR Specialist</option>
                <option value="accountant">Accountant</option>
              </select>
            </div>
          </div>

          <button type="submit" class="submit-btn" :disabled="!isFormValid">
            Authorize & Delegate
          </button>
        </form>
      </section>

      <section class="admin-card">
        <div class="card-header">
          <h3>Authorized Personnel</h3>
        </div>
        
        <div class="delegate-list">
          <div v-for="member in store.delegatedMembers" :key="member.id" class="delegate-item">
            <div class="member-info">
              <strong>{{ member.firstName }} {{ member.lastName }}</strong>
              <span>{{ member.email }}</span>
              <small>{{ member.position }} • {{ member.role.toUpperCase() }}</small>
            </div>
            <button @click="store.removeDelegatedMember(member.id)" class="remove-btn">Revoke</button>
          </div>
          
          <p v-if="store.delegatedMembers.length === 0" class="empty-text">
            No delegates authorized yet.
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/EmployerDashboard.css';
</style>