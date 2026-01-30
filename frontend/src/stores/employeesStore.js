import { defineStore } from 'pinia';
import { useAuthStore } from './useAuthStore';

const API_URL = 'http://localhost:5000/api'; 

export const useEmployeesStore = defineStore('employees', {
  state: () => ({
    employees: [],
    activities: [],
    delegatedMembers: [],
  }),

  actions: {
    async logActivity(message, type = 'info') {
      const authStore = useAuthStore();
      if (!authStore.token) return; 

      try {
        await fetch(`${API_URL}/activities`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}` 
          },
          body: JSON.stringify({ message, type })
        });
      } catch (error) {
        console.error('Error logging activity:', error);
      }
    },

    async fetchActivities() {
      const authStore = useAuthStore();
      if (!authStore.token) return;

      try {
        const res = await fetch(`${API_URL}/activities`, {
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        });
        if (!res.ok) throw new Error('Unauthorized');
        this.activities = await res.json();
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    },

    async fetchEmployees() {
      const authStore = useAuthStore();
      if (!authStore.token) return;

      try {
        const res = await fetch(`${API_URL}/employees`, {
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        });
        if (!res.ok) throw new Error('Unauthorized');
        this.employees = await res.json(); 
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    },

    async addEmployee(data) {
      const authStore = useAuthStore();
      if (!authStore.token) return;

      const validateCNP = (cnp) => /^[0-9]{13}$/.test(cnp);
      const validateName = (name) => name && name.length >= 2 && /^[a-zA-ZăâîșțĂÂÎȘȚ\- ]+$/.test(name);

      if (!validateName(data.firstName) || !validateName(data.lastName)) {
        alert('Please enter valid names.');
        return;
      }
      if (!validateCNP(data.cnp)) {
        alert('Invalid CNP (must be 13 digits).');
        return;
      }

      try {
        const res = await fetch(`${API_URL}/employees`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`
          },
          body: JSON.stringify(data)
        });

        if (res.ok) {
          await this.logActivity(`Added employee: ${data.firstName} ${data.lastName}`, 'add');
          await this.fetchEmployees(); 
        }
      } catch (error) {
        console.error('Error adding employee:', error);
      }
    },

    async updateEmployee(id, updatedData) {
      const authStore = useAuthStore();
      if (!authStore.token) return;

      try {
        const res = await fetch(`${API_URL}/employees/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`
          },
          body: JSON.stringify(updatedData)
        });

        if (res.ok) {
          await this.logActivity(`Updated employee: ${updatedData.firstName} ${updatedData.lastName}`, 'update');
          await this.fetchEmployees();
        }
      } catch (error) {
        console.error('Error updating employee:', error);
      }
    },

    async deleteEmployee(id) {
      const authStore = useAuthStore();
      if (!authStore.token) return;

      const emp = this.employees.find(e => e.id === id);
      const empName = emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';

      try {
        const res = await fetch(`${API_URL}/employees/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        });

        if (res.ok) {
          await this.logActivity(`Removed employee: ${empName}`, 'delete');
          await this.fetchEmployees();
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    },

    async fetchDelegatedMembers() {
      const authStore = useAuthStore();
      if (!authStore.token) return;

      try {
        const res = await fetch(`${API_URL}/delegated-members`, {
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        });
        if (!res.ok) throw new Error('Unauthorized');
        this.delegatedMembers = await res.json();
      } catch (error) {
        console.error('Error fetching delegated members:', error);
      }
    },

    async addDelegatedMember(data) {
      const authStore = useAuthStore();
      if (!authStore.token) return;

      try {
        const res = await fetch(`${API_URL}/delegated-members`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`
          },
          body: JSON.stringify(data)
        });

        if (res.ok) {
          await this.fetchDelegatedMembers();
        }
      } catch (error) {
        console.error('Error adding delegated member:', error);
      }
    },

    async removeDelegatedMember(id) {
      const authStore = useAuthStore();
      if (!authStore.token) return;

      try {
        const res = await fetch(`${API_URL}/delegated-members/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        });

        if (res.ok) {
          await this.fetchDelegatedMembers();
        }
      } catch (error) {
        console.error('Error removing delegated member:', error);
      }
    }
  }
});