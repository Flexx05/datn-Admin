export interface IConversation {
  _id: string;
  participants: IParticipant[];
  messages: IMessage[];
  statusLogs: IStatusLog[];
  status: string;
  chatType: number;
  assignedTo: {
    _id: string;
    fullName: string;
    email: string;
  };
  createdBy: string;
  lastUpdated: string;
}

export interface IParticipant {
  userId: {
    _id: string;
    fullName: string;
    role: string;
    avatar: string | null;
    isActive: boolean;
    activeStatus: boolean;
  };
  joinedAt: string;
}

export interface IMessage {
  senderId: string;
  senderRole: string;
  content: string;
  files: string[];
  readBy: string[];
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface IStatusLog {
  status: string;
  updateBy: {
    _id: string;
    fulLName: string;
    email: string;
  };
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
