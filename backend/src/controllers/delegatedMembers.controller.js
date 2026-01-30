import * as delegatedService from '../services/delegatedMembers.service.js';

export const fetchDelegatedMembers = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const members = await delegatedService.getDelegatedMembers(companyId);
    res.json(members);
  } catch (err) {
    next(err);
  }
};

export const createDelegatedMember = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const userId = req.user.uid;

    await delegatedService.addDelegatedMember({
      ...req.body,
      companyId,
      addedBy: userId,
      isRegistered: false
    });

    res.status(201).json({ message: 'Delegated member added' });
  } catch (err) {
    next(err);
  }
};

export const removeDelegatedMember = async (req, res, next) => {
  try {
    await delegatedService.deleteDelegatedMember(req.params.id);
    res.json({ message: 'Delegated member removed' });
  } catch (err) {
    next(err);
  }
};
