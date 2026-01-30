import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { auth } from '@/config/firebase'; 
import { onAuthStateChanged } from 'firebase/auth';

import HomeView from '../views/HomeView.vue';
import HubView from '../views/HubView.vue';
import LoginView from '../views/LoginView.vue';
import EmployeesView from '../views/EmployeesView.vue';
import EmployerDashboard from '../views/EmployerDashboard.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/portal',
    name: 'Hub',
    component: HubView,
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: EmployerDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/employees',
    name: 'Employees',
    component: EmployeesView,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const removeListener = onAuthStateChanged(
      auth,
      (user) => {
        removeListener();
        resolve(user);
      },
      reject
    );
  });
};

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  const firebaseUser = await getCurrentUser();
  
  if (firebaseUser) authStore.user = firebaseUser;

  if (to.meta.requiresAuth && !firebaseUser) {
    next('/'); 
  } else {
    next();
  }
});

export default router;