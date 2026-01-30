import * as employeeService from '../services/firestore.service.js';

export const getEmployees = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    if (!companyId) {
      return res.status(403).json({ message: 'No access to any company data.' });
    }
    const employees = await employeeService.getAllEmployees(companyId);
    res.json(employees);
  } catch (err) {
    next(err);
  }
};

//Create
export const createEmployee = async (req, res, next) => {
  try {
    const { firstName, lastName, position, cnp, salary, startDate, companyId } = req.body;

    if (!firstName || !lastName || !cnp || !companyId) {
      return res.status(400).json({ message: 'Incomplete data. First name, last name, CNP and company ID are required.' });
    }

    const employeeDocument = {
      personalInfo: {
        firstName,
        lastName,
        cnp
      },
      employmentDetails: {
        position,
        salary: Number(salary), 
        startDate
      },
      metadata: {
        companyId,
        createdBy: req.user.uid,
        createdAt: new Date().toISOString()
      }
    };

    await employeeService.addEmployee(employeeDocument);
    res.status(201).json({ message: 'Employee created successfully' });
  } catch (err) {
    next(err);
  }
};

//Update
export const updateEmployee = async (req, res, next) => {
  try {
    const { firstName, lastName, position, cnp, salary, startDate } = req.body;

    const updatedData = {
      personalInfo: {
        firstName,
        lastName,
        cnp
      },
      employmentDetails: {
        position,
        salary: Number(salary),
        startDate
      }
    };

    await employeeService.updateEmployee(req.params.id, updatedData);
    res.json({ message: 'Employee updated successfully' });
  } catch (err) {
    next(err);
  }
};

//Delete
export const deleteEmployee = async (req, res, next) => {
  try {
    await employeeService.deleteEmployee(req.params.id);
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    next(err);
  }
};