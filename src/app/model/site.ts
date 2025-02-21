import { Schema, model, models } from "mongoose";
import { IEducation } from "./education";

export interface ISite {
  createdAt: Date; // 网站创建时间
  visitCount: number; // 访问人数
  likeCount: number; // 点赞数量
  favicon: string; // 网站图标链接
  qrcode: string; // 二维码图片链接
  appreciationCode: string; // 赞赏码图片链接
  wechatGroup: string; // 微信公众号图片链接
  wechatGroupName?: string; // 微信公众号名称
  title: string; // 网站标题
  description: string; // 网站描述
  backgroundImage: string; // 首页背景图链接
  author: {
    // 作者信息
    name: string;
    avatar: string;
    description: string; // 作者一句话描述
    bio: string; // 作者详细介绍
    education: IEducation[]; // 教育经历
  };
  icp?: string; // 备案信息
  seo: {
    // SEO相关信息
    keywords: string[];
    description: string;
  };
  isOpenVerifyArticle?: boolean;
  verificationCode?: string; // 文章验证
  verificationCodeCreateTime?: number;
  verificationCodeExpirationTime?: number; // 文章验证过期时间
  wechatKeyword?: string; // 微信公众号关键词
  googleTagManagerId?: string; // 谷歌标签管理器ID
  googleAdsenseId?: string; // 谷歌广告 ID
}

const siteSchema = new Schema<ISite>({
  createdAt: { type: Date, default: Date.now },
  visitCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
  favicon: { type: String, required: true },
  qrcode: { type: String, required: true },
  appreciationCode: { type: String, required: true },
  wechatGroupName: { type: String },
  wechatGroup: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  backgroundImage: { type: String, required: true },
  author: {
    name: { type: String, required: true },
    avatar: { type: String, required: true },
    description: { type: String, required: true },
    bio: { type: String, required: true },
    education: [{ type: Schema.Types.ObjectId, ref: "Education" }],
  },
  icp: String,
  seo: {
    keywords: [String],
    description: { type: String, required: true },
    ogImage: String,
  },
  isOpenVerifyArticle: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationCodeCreateTime: { type: Number },
  verificationCodeExpirationTime: { type: Number },
  wechatKeyword: { type: String },
  googleTagManagerId: { type: String },
  googleAdsenseId: { type: String },
});

export const Site = models.Site || model<ISite>("Site", siteSchema);
