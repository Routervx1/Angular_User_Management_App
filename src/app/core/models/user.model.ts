export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  bio: string;
  avatarUrl: string;
  createdAt: string;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  emailNotifications: boolean;
  pushNotifications: boolean;
  language: string;
}

export interface StoredAccount {
  profile: UserProfile;
  passwordHash: string;
  settings: UserSettings;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
