<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter, useRoute } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute(); 

const navbarTitle = computed(() => {
  if (route.name === 'Hub') return 'Hub View';
  if (route.name === 'Dashboard') return 'Admin Console';
  return 'RegistryApp';
});

const handleLogout = async () => {
  try {
    await authStore.logoutUser();
    router.push('/login'); 
  } catch (error) {
    console.error("Error logging out:", error);
  }
};
</script>

<template>
  <div id="app-layout">
    <header class="navbar">
      <div class="nav-content container">
        <h1 class="logo">{{ navbarTitle }}</h1>
        
        <nav>
          <router-link to="/">Home</router-link>
          
          <template v-if="authStore.user">
            <router-link to="/portal">Portal</router-link>
            <router-link to="/employees">Staff</router-link>
            
            <div class="user-menu">
              <span class="user-email">{{ authStore.user?.email }}</span>
              <button @click="handleLogout" class="logout-btn">Logout</button>
            </div>
          </template>

          <router-link v-else to="/login" class="login-btn">
            Login
          </router-link>
        </nav>
      </div>
    </header>

    <main class="container">
      <router-view></router-view>
    </main>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

:root {
  --font-family: 'Inter', system-ui, -apple-system, sans-serif;
  --primary-color: #10b981; 
  --primary-dark: #059669;
  --dark-navy: #1e293b;    
  --danger-color: #ef4444; 
  --text-main: #1e293b; 
  --text-muted: #64748b; 
  --bg-body: #f8fafc; 
  --bg-white: #ffffff;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --border-radius: 12px;
}

body {
  font-family: var(--font-family);
  background-color: var(--bg-body);
  color: var(--text-main);
  margin: 0;
  -webkit-font-smoothing: antialiased;
}
</style>

<style scoped>
.navbar {
  background: var(--bg-white);
  box-shadow: var(--shadow-sm);
  padding: 1.25rem 0;
  margin-bottom: 2rem;
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--dark-navy);
  letter-spacing: -0.03em;
}

.logo span {
  color: var(--primary-color);
}

nav {
  display: flex;
  gap: 2rem;
  align-items: center;
}

nav a {
  text-decoration: none;
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

nav a:hover,
nav a.router-link-active:not(.login-btn) {
  color: var(--primary-color); 
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-left: 1.5rem;
  border-left: 2px solid #e2e8f0;
}

.user-email {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 500;
}

.login-btn {
  background-color: var(--primary-color); 
  color: white !important;
  padding: 0.7rem 1.4rem;
  border-radius: 8px;
  font-weight: 700;
  transition: all 0.2s ease;
}

.login-btn:hover {
  background-color: var(--primary-dark);
  transform: translateY(-1px);
}

.logout-btn {
  background: transparent;
  color: var(--danger-color);
  border: 1px solid var(--danger-color);
  padding: 0.5rem 1.1rem;
  border-radius: 7px;
  cursor: pointer;
  font-weight: 600;
}

.logout-btn:hover {
  background: var(--danger-color);
  color: white;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1rem;
}
</style>