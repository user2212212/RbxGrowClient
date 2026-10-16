export interface NotificationData {
  icon?: string | null;
  amount?: number | null;
}

export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  data: NotificationData;
  read: boolean;
  createdAt: string;
}