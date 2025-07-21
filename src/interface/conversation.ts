export interface IConversation {
  _id: string;
  participants: IParticipant[];
  messages: IMessage[];
  statusLogs: IStatusLog[];
  status: string;
  chatType: number;
  assignedTo: string | null;
  createdBy: string;
  lastUpdated: string;
}

export interface IParticipant {
  userId: string;
  avatar: string | null;
  fullName: string;
  role: string;
  joinedAt: string;
  _id: string;
}

export interface IMessage {
  senderId: string;
  senderRole: string;
  content: string;
  readBy: string[];
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface IStatusLog {
  status: string;
  updateBy: string;
  updatedAt: string;
  _id: string;
}

export interface IQuickChat {
  _id: string;
  content: string;
  category: number;
  createdBy: {
    _id: string;
    fullName: string;
  };
  updatedBy: {
    _id: string;
    fullName: string;
  };
  createdAt: string;
  updatedAt: string;
}
