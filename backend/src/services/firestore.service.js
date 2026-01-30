import { db } from '../config/firebase.js';

const employeesRef = db.collection('employees');

export const getAllEmployees = async (companyId) => {
  const snapshot = await employeesRef
    .where("metadata.companyId", "==", companyId)
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const addEmployee = async (data) => {
  return await employeesRef.add(data);
};

export const updateEmployee = async (id, data) => {
  return await employeesRef.doc(id).update(data);
};

export const deleteEmployee = async (id) => {
  return await employeesRef.doc(id).delete();
};