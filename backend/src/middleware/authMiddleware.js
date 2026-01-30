import admin, { db } from "../config/firebase.js";

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader?.split(' ')[1]; 

  if (!token) return res.status(401).json({ msg: 'No token provided' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    const userData = userDoc.data();

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      companyId: userData?.companyId || null 
    };
    
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Invalid token' });
  }
};