import { ISite } from "@/app/model/site";

export interface SiteWithId extends ISite {
  _id?: string;
}

export interface EditableSite extends Omit<ISite, "visitCount" | "likeCount"> {
  _id?: string;
  visitCount: number | null;
  likeCount: number | null;
  isOpenVerifyArticle?: boolean;
  verificationCodeExpirationTime?: number;
  wechatGroupName?: string;
  wechatKeyword?: string;
  googleTagManagerId?: string;
  googleAdsenseId?: string;
  isOpenGtm?: boolean;
  isOpenAdsense?: boolean;
  // Giscus 评论配置
  isOpenGiscus?: boolean;
  giscusRepo?: string;
  giscusRepoId?: string;
  giscusCategory?: string;
  giscusCategoryId?: string;
}

export interface CaptchaDetail {
  _id: string;
  code?: string;
  createdAt: Date;
  expiresAt: Date;
  isActivated?: boolean;
  activatedAt?: Date;
  activationExpiryHours?: number;
  status?: "valid" | "used" | "expired";
}

export interface FileState {
  selectedFiles: { [key: string]: File };
  previewUrls: { [key: string]: string };
  isUploading: { [key: string]: boolean };
}
