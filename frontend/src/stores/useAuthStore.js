import { defineStore } from 'pinia';
import { ref } from 'vue';
import { auth, db } from '../config/firebase'; 
import { useEmployeesStore } from './employeesStore';

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  setPersistence,          
  browserSessionPersistence
} from 'firebase/auth';

import { doc, getDoc } from 'firebase/firestore';

const API_URL = 'http://localhost:5000/api/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const userProfile = ref(null);
  const token = ref(null); 

  onAuthStateChanged(auth, async (firebaseUser) => {
    user.value = firebaseUser;
    
    if (firebaseUser) {
      token.value = await firebaseUser.getIdToken();
      
      const docSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (docSnap.exists()) {
        userProfile.value = docSnap.data();
        
        const employeesStore = useEmployeesStore();
        employeesStore.fetchEmployees();
        employeesStore.fetchActivities();
      }
    } else {
      userProfile.value = null;
      token.value = null;
    }
  }); 

  const validatePassword = (pass) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(pass);
  };

  const validateCIF = (cif) => {
    const regex = /^(RO)?[0-9]{2,10}$/i;
    return regex.test(cif.trim());
  };

  const loginUser = async (email, password) => {
    try {
      await setPersistence(auth, browserSessionPersistence);
      const res = await signInWithEmailAndPassword(auth, email, password);
      user.value = res.user;
      token.value = await res.user.getIdToken();
    } catch (error) {
      console.error("Login error:", error);
      throw error; 
    }
  };

  const logoutUser = async () => {
    await signOut(auth);
    user.value = null;
    userProfile.value = null;
    token.value = null;
  };

  const registerCompany = async ({ adminName, companyName, companyEmail, cif, password }) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, companyEmail, password);
      const uid = res.user.uid;

      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminName,
          companyName,
          companyEmail,
          cif,
          uid 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Registration failed");
      }

      const data = await response.json();
      console.log("Backend response:", data.msg);
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };

  const checkDelegation = async (email) => {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const q = query(collection(db, 'delegatedMembers'), where('email', '==', email.toLowerCase()));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  };

  const registerIndividual = async (email, password, delegationData) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const uid = res.user.uid;

      const { setDoc, doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      
      const profileData = {
        email,
        uid,
        companyId: delegationData.companyId,
        role: delegationData.role,
        firstName: delegationData.firstName,
        lastName: delegationData.lastName,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'users', uid), profileData);
      await updateDoc(doc(db, 'delegatedMembers', delegationData.id), {
        isRegistered: true,
        registeredAt: serverTimestamp()
      });

      userProfile.value = profileData;
    } catch (error) {
      console.error("Error registering individual:", error);
      throw error;
    }
  };

  return {
    user,
    userProfile,
    token,
    loginUser,
    logoutUser,
    registerCompany,
    checkDelegation,
    registerIndividual,
    validatePassword, 
    validateCIF
  };
});