<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';

const router = useRouter();
const authStore = useAuthStore();

const navigateTo = (path) => {
  router.push(path);
};
</script>

<template>
  <div class="hub-container">
    <header class="hub-header">
      <h1>{{ authStore.userProfile?.companyName || 'Management System' }}</h1>
      <p>Logged in as: <strong>{{ authStore.userProfile?.email }}</strong></p>
      <div class="header-line"></div>
      <p class="instruction">Choose the registry you want to access today.</p>
    </header>

    <div class="hub-grid">
      <div class="hub-card employer-card" @click="navigateTo('/dashboard')">
        <div class="card-icon">
          <svg viewBox="0 0 24 24" width="48" height="48">
            <path fill="currentColor" d="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6,8.44 6,9V15H7V22H5V15H4V9C4,8.44 4.44,8 5,8M20,8C20.56,8 21,8.44 21,9V15H22V22H20V15H19V9C19,8.44 19.44,8 20,8M15,14V22H13V18H11V22H9V14C9,12.89 9.89,12 11,12H13C14.11,12 15,12.89 15,14Z" />
          </svg>
        </div>
        <div class="card-content">
          <h2>Employer Registry</h2>
          <ul>
            <li>View statistics and budgets</li>
            <li>Delegate roles (HR, Accountant)</li>
            <li>Manage company activity</li>
          </ul>
        </div>
        <button class="hub-btn">Access Console</button>
      </div>

      <div class="hub-card employees-card" @click="navigateTo('/employees')">
        <div class="card-icon">
          <svg viewBox="0 0 24 24" width="48" height="48">
            <path fill="currentColor" d="M16,13C15.71,13 15.38,13 15.03,13.05C16.19,13.89 17,15 17,16.5V19H23V16.5C23,14.17 18.33,13 16,13M8,13C5.67,13 1,14.17 1,16.5V19H15V16.5C15,14.17 10.33,13 8,13M8,11A3,3 0 0,0 11,8A3,3 0 0,0 8,5A3,3 0 0,0 5,8A3,3 0 0,0 8,11M16,11A3,3 0 0,0 19,8A3,3 0 0,0 16,5A3,3 0 0,0 13,8A3,3 0 0,0 16,11Z" />
          </svg>
        </div>
        <div class="card-content">
          <h2>Employee Registry</h2>
          <ul>
            <li>Add and modify contracts</li>
            <li>Update employee details</li>
            <li>Manage employee list</li>
          </ul>
        </div>
        <button class="hub-btn">Access Registry</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "../assets/HubView.css";
</style>