import { db } from '../config/firebase.js';

const delegatedRef = db.collection('delegatedMembers');

export const getDelegatedMembers = async (companyId) => {
  const snapshot = await delegatedRef
    .where('companyId', '==', companyId)
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const addDelegatedMember = async (data) => {
  return await delegatedRef.add({
    ...data,
    createdAt: new Date()
  });
};

export const deleteDelegatedMember = async (id) => {
  return await delegatedRef.doc(id).delete();
};
