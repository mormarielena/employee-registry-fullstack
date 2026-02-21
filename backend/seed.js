import admin from "firebase-admin";
import { fakerRO as faker } from '@faker-js/faker'; 
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const serviceAccount = require("./src/config/serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

async function seedEmployees(count = 10) {
  const employeesRef = db.collection('employees'); 
  const targetCompanyId = "FGyBE2rWXgUCrYaEy0yc"; 

  console.log(`Generez ${count} angajati de test...`);

  for (let i = 0; i < count; i++) {
    const newEmployee = {
      personalInfo: {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        cnp: faker.string.numeric(13)
      },
      employmentDetails: {
        position: faker.person.jobTitle(),
        salary: faker.number.int({ min: 3700, max: 15000 }), 
        startDate: faker.date.past().toISOString().split('T')[0]
      },
      metadata: {
        companyId: targetCompanyId,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    };

    await employeesRef.add(newEmployee);
    console.log(`Am adaugat ${newEmployee.personalInfo.firstName} ${newEmployee.personalInfo.lastName}`);
  }

  console.log("\nAm adaugat angajati cu succes!");
  process.exit();
}

seedEmployees(5);