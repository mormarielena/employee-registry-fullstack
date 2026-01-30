<script setup>
import { computed, onMounted } from "vue";
import { useEmployeesStore } from "@/stores/employeesStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { Pie, Line } from "vue-chartjs";
import {
  Chart as ChartJS, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Filler
} from "chart.js";

ChartJS.register(
  Title, 
  Tooltip, 
  Legend, 
  ArcElement, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Filler
);

const store = useEmployeesStore();
const authStore = useAuthStore();

onMounted(async () => {
  if (authStore.userProfile?.companyId) {
    await Promise.all([
      store.fetchEmployees(),
      store.fetchActivities()
    ]);
  }
});

const formatTime = (timestamp) => {
  if (!timestamp) return "just now";
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  
  if (isNaN(date.getTime())) return "just now"; 

  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return date.toLocaleDateString();
};

const salaryChartData = computed(() => {
  const distribution = {};
  store.employees.forEach(e => {
    const pos = e.employmentDetails?.position || "Unknown";
    const sal = Number(e.employmentDetails?.salary) || 0;
    
    distribution[pos] = (distribution[pos] || 0) + sal;
  });
  return {
    labels: Object.keys(distribution),
    datasets: [{
      backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#6366f1", "#ec4899"],
      data: Object.values(distribution)
    }]
  };
});

const hiringChartData = computed(() => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const last6Months = [];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    last6Months.push({ 
      name: months[d.getMonth()], 
      count: 0, 
      monthIdx: d.getMonth(), 
      year: d.getFullYear() 
    });
  }

  store.employees.forEach(e => {
    const hireDate = new Date(e.employmentDetails?.startDate);
    
    last6Months.forEach(m => {
      if (hireDate.getMonth() === m.monthIdx && hireDate.getFullYear() === m.year) {
        m.count++;
      }
    });
  });

  return {
    labels: last6Months.map(m => m.name),
    datasets: [{
      label: "New Hires",
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      borderColor: "#10b981",
      data: last6Months.map(m => m.count),
      fill: true,
      tension: 0.4
    }]
  };
});

const chartOptions = { responsive: true, maintainAspectRatio: false };
</script>

<template>
  <div class="home-wrapper">
    <section v-if="!authStore.user" class="landing-section">
      <div class="hero-card">
        <h1>Welcome to RegistryApp</h1>
        <p>The modern way to manage your company's human resources and staff records.</p>
        <div class="hero-actions">
          <router-link to="/login" class="btn-main">Get Started</router-link>
        </div>
      </div>
      <div class="features">
        <div class="f-card">
          <h3>Real-time Tracking</h3>
          <p>Monitor all staff changes and activities as they happen.</p>
        </div>
        <div class="f-card">
          <h3>Secure Delegation</h3>
          <p>Safely delegate HR and Accounting tasks to your team.</p>
        </div>
      </div>
    </section>

    <section v-else class="dashboard-section">
      <header class="dashboard-header">
        <h1>Welcome back, {{ authStore.userProfile?.companyName || 'Director' }}</h1>
        <p>Here is your company's real-time overview.</p>
      </header>

      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-value">{{ store.employees.length }}</span>
          <span class="stat-label">Registered Employees</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">Active</span>
          <span class="stat-label">System Status</span>
        </div>
      </div>

      <div class="charts-grid">
        <div class="chart-container">
          <h3>Salary Distribution (RON)</h3>
          <div class="canvas-wrapper">
            <Pie :data="salaryChartData" :options="chartOptions" />
          </div>
        </div>
        <div class="chart-container">
          <h3>Hiring Trends (Last 6 Months)</h3>
          <div class="canvas-wrapper">
            <Line :data="hiringChartData" :options="chartOptions" />
          </div>
        </div>
      </div>

      <section class="activity-card">
        <div class="card-header">
          <h3>Recent Activity</h3>
          <span class="live-indicator">Live Updates</span>
        </div>

        <div class="activity-list">
          <div v-for="act in store.activities" :key="act.id" class="activity-item" :class="act.type">
            <div class="status-dot"></div>
            
            <div class="activity-body">
              <p class="activity-text">{{ act.text }}</p>
              <span class="activity-time">{{ formatTime(act.timestamp) }}</span>
            </div>
            
            <div class="activity-chevron"></div>
          </div>

          <div v-if="store.activities.length === 0" class="empty-state">
            <p>No recent movements recorded.</p>
          </div>
        </div>

        <div class="card-footer">
          <router-link to="/employees" class="manage-link">Manage Workforce →</router-link>
        </div>
      </section>
    </section>
  </div>
</template>

<style scoped>  
@import '@/assets/HomeView.css';
</style>