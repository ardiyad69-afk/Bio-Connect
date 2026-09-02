import type { ProfileTheme, Socials } from "./schemas/profile";

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  themeColor: string;
  theme: ProfileTheme;
  isVerified: boolean;
  socials: Socials;
  createdAt: string;
  updatedAt: string;
}

export interface Link {
  id: string;
  profileId: string;
  title: string;
  url: string;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

// Shape returned by the public /[username] read path: profile plus only
// the links visible to anonymous visitors, already in display order.
export interface PublicProfile extends Profile {
  links: Link[];
}

export interface SessionUser {
  id: string;
  email: string;
}
