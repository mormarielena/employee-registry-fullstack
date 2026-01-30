import { db } from "../config/firebase.js"; 

export const register = async (req, res) => {
  try {
    const { adminName, companyName, companyEmail, cif, uid } = req.body;

    const companyRef = db.collection("companies");
    const snapshot = await companyRef.where("companyEmail", "==", companyEmail).get();
    
    if (!snapshot.empty) {
      return res.status(400).json({ msg: "This company already exists!" });
    }

    const newCompany = {
      name: companyName,
      adminName,
      companyEmail,
      cif,
      certificateUrl: "https://bypass-storage.placeholder.com/onrc.pdf",
      status: "pending",
      createdAt: new Date()
    };
    const companyDoc = await db.collection("companies").add(newCompany);

    const profileData = {
      email: companyEmail,
      role: 'admin',
      companyId: companyDoc.id,
      companyName: companyName,
      createdAt: new Date()
    };
    await db.collection("users").doc(uid).set(profileData);

    res.status(201).json({ 
      msg: "You have successfully registered the company.", 
      companyId: companyDoc.id 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    res.json({ msg: "Login successful", user: req.user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};