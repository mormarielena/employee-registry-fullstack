<script setup>
import { ref, watch, computed } from "vue"; 
import { useEmployeesStore } from "@/stores/employeesStore";
import { useAuthStore } from "@/stores/useAuthStore"; 

const props = defineProps(['editMode', 'employeeToEdit']);
const emit = defineEmits(['cancelEdit', 'saved']);
const store = useEmployeesStore();
const authStore = useAuthStore(); 

const initialState = {
  firstName: "",
  lastName: "",
  position: "",
  cnp: "",      
  salary: null,  
  startDate: ""
};

const employee = ref({ ...initialState });

const isFirstNameValid = computed(() => 
  !employee.value.firstName || /^[a-zA-ZăâîșțĂÂÎȘȚ\- ]{2,}$/.test(employee.value.firstName)
);

const isLastNameValid = computed(() => 
  !employee.value.lastName || /^[a-zA-ZăâîșțĂÂÎȘȚ\- ]{2,}$/.test(employee.value.lastName)
);

const isCNPValid = computed(() => 
  !employee.value.cnp || /^[0-9]{13}$/.test(employee.value.cnp)
);

const isSalaryValid = computed(() => 
  employee.value.salary === null || employee.value.salary >= 3700
);

const isFormValid = computed(() => {
  return (
    employee.value.firstName && isFirstNameValid.value &&
    employee.value.lastName && isLastNameValid.value &&
    employee.value.cnp && isCNPValid.value &&
    employee.value.salary && isSalaryValid.value &&
    employee.value.startDate
  );
});

watch(() => props.employeeToEdit, (newVal) => { 
  if (newVal) { 
    employee.value = {
      firstName: newVal.personalInfo?.firstName || "",
      lastName: newVal.personalInfo?.lastName || "",
      cnp: newVal.personalInfo?.cnp || "",
      position: newVal.employmentDetails?.position || "",
      salary: newVal.employmentDetails?.salary || null,
      startDate: newVal.employmentDetails?.startDate || ""
    }; 
  } else { 
    employee.value = { ...initialState }; 
  } 
}, { immediate: true }); 

const handleSubmit = async () => {
  if (!isFormValid.value) return;

  const companyId = authStore.userProfile?.companyId;
  if (!companyId) {
    alert("Company profile not loaded yet.");
    return;
  }

  try {
    const payload = { ...employee.value, companyId };

    if (props.editMode) { 
      await store.updateEmployee(props.employeeToEdit.id, payload); 
      emit('cancelEdit'); 
    } else {
      await store.addEmployee(payload);
    }
    
    employee.value = { ...initialState };
    const msg = props.editMode ? "Employee updated successfully!" : "New employee added!";
    emit('saved', msg);
  } catch (error) {
    console.error("Error at saving:", error);
  }
};
</script>

<template>
  <div class="form-container" :class="{ 'edit-mode-active': editMode }"> 
    <h3>{{ editMode ? 'Update Employee Info' : 'Register New Employee' }}</h3>

    <form @submit.prevent="handleSubmit" class="add-form">
      <div class="form-row">
        <div class="form-group">
          <label>First Name</label>
          <input v-model="employee.firstName" :class="{ 'input-error': !isFirstNameValid }" placeholder="First name" required />
          <span v-if="!isFirstNameValid" class="error-hint">Min. 2 letters required.</span>
        </div>
        <div class="form-group">
          <label>Last Name</label>
          <input v-model="employee.lastName" :class="{ 'input-error': !isLastNameValid }" placeholder="Last name" required />
          <span v-if="!isLastNameValid" class="error-hint">Min. 2 letters required.</span>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Position</label>
          <input v-model="employee.position" placeholder="e.g. Consultant" required />
        </div>
        <div class="form-group">
          <label>CNP</label>
          <input v-model="employee.cnp" :class="{ 'input-error': !isCNPValid }" placeholder="13 digits" required maxlength="13" />
          <span v-if="!isCNPValid" class="error-hint">Must be exactly 13 digits.</span>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Gross Salary (RON)</label>
          <input v-model.number="employee.salary" type="number" :class="{ 'input-error': !isSalaryValid }" placeholder="Min. 3700" required />
          <span v-if="!isSalaryValid" class="error-hint">Min. legal is 3700.</span>
        </div>
        <div class="form-group">
          <label>Hire Date</label>
          <input v-model="employee.startDate" type="date" required />
        </div>
      </div>
      
      <div class="button-group"> 
        <button 
          type="submit" 
          :class="editMode ? 'update-btn' : 'submit-btn'"
          :disabled="!isFormValid || !authStore.userProfile?.companyId"
        >
          {{ editMode ? 'Save Changes' : 'Add Employee' }} 
        </button>
        
        <button v-if="editMode" type="button" @click="emit('cancelEdit')" class="cancel-btn">
          Cancel
        </button> 
      </div>
    </form>
  </div>
</template>

<style scoped>
@import "../assets/EmployeeForm.css";
</style>