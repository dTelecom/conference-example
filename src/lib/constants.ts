import { LocalUserChoices } from "@dtelecom/components-react";

export const ADMIN_POINTS_MULTIPLIER = 2;
export const BASE_REWARDS_PER_MINUTE = 10;
export const REFERRAL_REWARD_PERCENTAGE = 10;

export const defaultPreJoinChoices: Partial<LocalUserChoices> = {
  username: "",
  videoEnabled: true,
  audioEnabled: process.env.NODE_ENV !== "development"
};
