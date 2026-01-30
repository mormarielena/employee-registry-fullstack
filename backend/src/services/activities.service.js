import { db } from '../config/firebase.js';

const activitiesRef = db.collection('activities');

export const addActivity = async (data) => {
  return await activitiesRef.add({
    ...data,
    timestamp: new Date()
  });
};

export const getActivitiesByCompany = async (companyId) => {
  const snapshot = await activitiesRef
    .where('companyId', '==', companyId)
    .orderBy('timestamp', 'desc')
    .limit(5)
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
