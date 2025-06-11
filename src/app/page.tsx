import { ISocialLink } from "@/app/model/social-link";
import { IWorkExperience } from "@/app/model/work-experience";
import { getDb } from "@/lib/mongodb";
import { Article, ArticleStatus } from "./model/article";
import HomePageClient from "@/components/HomePage/HomePageClient";
import { WithId } from "mongodb";

// 序列化MongoDB对象，移除复杂类型
const serializeData = (data: WithId<IWorkExperience>[] | WithId<ISocialLink>[] | WithId<Article>[]) => {
  return JSON.parse(JSON.stringify(data));
};

// 使用缓存包装数据获取函数
const getSocialLinks = async () => {
  try {
    const db = await getDb();
    const socialLinks = await db
      .collection<ISocialLink>("socialLinks")
      .find()
      .toArray();
    return serializeData(socialLinks);
  } catch (error) {
    console.error("Error fetching social links:", error);
    return [];
  }
};

const getWorkExperiences = async () => {
  try {
    const db = await getDb();
    const workExperiences = await db
      .collection<IWorkExperience>("workExperiences")
      .find()
      .sort({ startDate: -1 }) 
      .toArray();
    return serializeData(workExperiences);
  } catch (error) {
    console.error("Error fetching work experiences:", error);
    return [];
  }
};

const getArticles = async () => {
  try {
    const db = await getDb();
    const articles = await db
      .collection<Article>("articles")
      .find({ status: ArticleStatus.PUBLISHED })
      .sort({ createdAt: -1 })
      .toArray();
    return serializeData(articles) as (Article & { _id?: string })[];
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [] as (Article & { _id?: string })[];
  }
};

export default async function App() {
  const [socialLinks, workExperiences, articles] = await Promise.all([
    getSocialLinks(),
    getWorkExperiences(),
    getArticles()
  ]);

  return (
    <HomePageClient
      socialLinks={socialLinks}
      workExperiences={workExperiences}
      articles={articles}
    />
  );
}
