<template>
  <div class="login-wrapper">
    <div class="view-card login-card">
      
      <header class="view-header">
        <h2 v-if="viewMode === 'login'">Login</h2>
        <h2 v-else-if="viewMode === 'choice'">Select Account Type</h2>
        <h2 v-else-if="viewMode === 'register-company'">Company Register</h2>
        <h2 v-else-if="viewMode === 'register-individual'">Staff Register</h2>
        
        <p v-if="viewMode === 'login'">Input the login details</p>
        <p v-else-if="viewMode === 'choice'">How do you want to use RegistryApp?</p>
        <p v-else-if="viewMode === 'register-company'">Create your employer account</p>
        <p v-else-if="viewMode === 'register-individual'">Join your company team</p>
      </header>

      <form v-if="viewMode === 'login'" @submit.prevent="login" class="login-form">
        <div class="form-group">
          <label>Email</label>
          <input v-model="email" type="email" placeholder="name@company.com" required />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input v-model="password" type="password" placeholder="••••••••" required />
        </div>
        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? 'Loading...' : 'Login' }}
        </button>
        <p class="switch-text">
          New here? <span @click="viewMode = 'choice'">Create an account</span>
        </p>
      </form>

      <div v-else-if="viewMode === 'choice'" class="selection-grid">
        <button class="choice-btn" @click="viewMode = 'register-company'">
          <strong>Company / Employer</strong>
          <span>Register your business</span>
        </button>
        <button class="choice-btn" @click="viewMode = 'register-individual'">
          <strong>Individual / Staff</strong>
          <span>Join as HR or Accountant</span>
        </button>
        <p class="switch-text">
          Already have an account? <span @click="viewMode = 'login'">Login</span>
        </p>
      </div>

      <form v-else-if="viewMode === 'register-company'" @submit.prevent="registerCompany" class="login-form">
        <div class="form-group">
          <label>Admin Name</label>
          <input v-model="adminName" required />
        </div>
        <div class="form-group">
          <label>Company Name</label>
          <input v-model="companyName" required />
        </div>
        <div class="form-group">
          <label>Company Email</label>
          <input v-model="companyEmail" type="email" required />
        </div>
        <div class="form-group">
          <label>CIF</label>
          <input 
            v-model="cif" 
            :class="{ 'input-error': cif && !isCIFValid }"
            placeholder="Ex: RO12345678" 
            required 
          />
          <span v-if="cif && !isCIFValid" class="error-hint">Invalid CIF format. Use numbers (2-10 digits), optional 'RO' prefix.</span>
        </div>
        <div class="form-group">
          <label>Password</label>
          <input 
            v-model="password" 
            type="password" 
            :class="{ 'input-error': password && !isPasswordValid }"
            required 
          />
          <span v-if="password && !isPasswordValid" class="error-hint">Min. 8 characters, one digit, one uppercase, and one special symbol.</span>
        </div>
        <div class="form-group">
          <label>Confirm Password</label>
          <input 
            v-model="confirmPassword" 
            type="password" 
            :class="{ 'input-error': confirmPassword && !doPasswordsMatch }"
            required 
          />
          <span v-if="confirmPassword && !doPasswordsMatch" class="error-hint">Passwords do not match!</span>
        </div>
        <button type="submit" class="submit-btn" :disabled="loading || !isPasswordValid || !doPasswordsMatch || !isCIFValid">
          {{ loading ? 'Loading...' : 'Register Company' }}
        </button>
        <p class="switch-text">
          <span @click="viewMode = 'choice'">Go back</span>
        </p>
      </form>

      <form v-else-if="viewMode === 'register-individual'" @submit.prevent="registerIndividual" class="login-form">
        <div class="info-box">
          Note: You must be previously authorized by your employer to register here.
        </div>
        <div class="form-group">
          <label>Authorized Email</label>
          <input v-model="email" type="email" placeholder="your-work-email@company.com" required />
        </div>
        <div class="form-group">
          <label>Set Password</label>
          <input 
            v-model="password" 
            type="password" 
            :class="{ 'input-error': password && !isPasswordValid }"
            placeholder="••••••••" 
            required 
          />
          <span v-if="password && !isPasswordValid" class="error-hint">Min. 8 characters, one digit, one uppercase, and one special symbol.</span>
        </div>
        <div class="form-group">
          <label>Confirm Password</label>
          <input 
            v-model="confirmPassword" 
            type="password" 
            :class="{ 'input-error': confirmPassword && !doPasswordsMatch }"
            placeholder="••••••••" 
            required 
          />
          <span v-if="confirmPassword && !doPasswordsMatch" class="error-hint">Passwords do not match!</span>
        </div>
        <button type="submit" class="submit-btn" :disabled="loading || !isPasswordValid || !doPasswordsMatch">
          {{ loading ? 'Verify & Join' : 'Join Team' }}
        </button>
        <p class="switch-text">
          <span @click="viewMode = 'choice'">Go back</span>
        </p>
      </form>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/useAuthStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const loading = ref(false)
const viewMode = ref('login')

const email = ref('')
const password = ref('')
const confirmPassword = ref('') // Camp nou
const adminName = ref('')
const companyName = ref('')
const companyEmail = ref('')
const cif = ref('')

const isPasswordValid = computed(() => {
  if (!password.value) return true
  return authStore.validatePassword(password.value)
})

const doPasswordsMatch = computed(() => {
  if (!confirmPassword.value) return true
  return password.value === confirmPassword.value
})

const isCIFValid = computed(() => {
  if (!cif.value) return true
  return authStore.validateCIF(cif.value)
})

const login = async () => {
  loading.value = true
  try {
    await authStore.loginUser(email.value, password.value)
    router.push('/')
  } catch {
    alert('Error: Incorrect login details!')
  } finally {
    loading.value = false
  }
}

const registerCompany = async () => {
  if (!isPasswordValid.value || !doPasswordsMatch.value || !isCIFValid.value) return
  
  loading.value = true
  try {
    await authStore.registerCompany({
      adminName: adminName.value,
      companyName: companyName.value,
      companyEmail: companyEmail.value,
      cif: cif.value,
      password: password.value
    })
    alert('Company account created!')
    router.push('/')
  } catch {
    alert('Register error!')
  } finally {
    loading.value = false
  }
}

const registerIndividual = async () => {
  if (!isPasswordValid.value || !doPasswordsMatch.value) return

  loading.value = true
  try {
    const delegation = await authStore.checkDelegation(email.value)
    
    if (!delegation) {
      alert('Access denied: This email is not authorized by any company.')
      return
    }

    await authStore.registerIndividual(email.value, password.value, delegation)
    alert('Welcome to the team! Account activated.')
    router.push('/')
  } catch (error) {
    console.error(error)
    alert('Registration failed. Please check your connection.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import '@/assets/LoginView.css';
</style>