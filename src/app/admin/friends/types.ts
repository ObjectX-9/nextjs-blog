import { Friend } from "@/config/friends";

export interface FriendWithId extends Friend {
  _id: string;
}

export interface ActionModalFriend {
  friend: FriendWithId;
  index: number;
}
