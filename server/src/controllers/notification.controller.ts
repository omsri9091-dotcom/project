import { Response } from 'express';
import { Notification } from '../models/Notification';
import { AuthRequest } from '../middleware/auth.middleware';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const query = {
      $or: [
        { userId: req.user._id },
        { roleTarget: req.user.role },
        { roleTarget: 'ALL' },
      ],
    };

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(20);
    const unreadCount = await Notification.countDocuments({ ...query, read: false });

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch notifications.' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: notification,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update notification.' });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    await Notification.updateMany(
      {
        $or: [
          { userId: req.user._id },
          { roleTarget: req.user.role },
          { roleTarget: 'ALL' },
        ],
      },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to mark notifications read.' });
  }
};
