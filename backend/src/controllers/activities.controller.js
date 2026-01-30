import * as activityService from '../services/activities.service.js';

export const createActivity = async (req, res, next) => {
  try {
    const { message, type } = req.body;
    const companyId = req.user.companyId;

    if (!message || !companyId) {
      return res.status(400).json({ message: 'Invalid activity data' });
    }

    await activityService.addActivity({
      text: message,
      type: type || 'info',
      companyId,
      userId: req.user.uid
    });

    res.status(201).json({ message: 'Activity logged' });
  } catch (err) {
    next(err);
  }
};

export const getActivities = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const activities = await activityService.getActivitiesByCompany(companyId);
    res.json(activities);
  } catch (err) {
    next(err);
  }
};
