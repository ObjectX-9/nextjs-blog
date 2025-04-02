import { ISocialLink } from "@/app/model/social-link";
import { IWorkExperience } from "@/app/model/work-experience";
import { getDb } from "@/lib/mongodb";
import { Article } from "./model/article";
import HomeHeader from "@/components/HomePage/HomeHeader";
import AuthorIntro from "@/components/HomePage/AuthorIntro";
import { ListSection } from "@/components/HomePage/ListSection";
import { Section } from "@/components/HomePage/Section";
import { SocialLinks } from "@/components/HomePage/SocialLinks";
import { WorkExperience } from "@/components/HomePage/WorkExperience";
import { Education } from "@/components/HomePage/Education";
import { WebRunInfo } from '@/components/HomePage/WebRunInfo'
import { WebControlInfo } from '@/components/HomePage/WebControlInfo'
import { calculateDuration } from "@/utils/time";

// 服务端组件
async function getSocialLinks() {
  try {
    const db = await getDb();
    const socialLinks = await db
      .collection<ISocialLink>("socialLinks")
      .find()
      .toArray();
    return socialLinks;
  } catch (error) {
    console.error("Error fetching social links:", error);
    return [];
  }
}

async function getWorkExperiences() {
  try {
    const db = await getDb();
    const workExperiences = await db
      .collection<IWorkExperience>("workExperiences")
      .find()
      .sort({ startDate: -1 }) // Sort by start date in descending order
      .toArray();
    return workExperiences;
  } catch (error) {
    console.error("Error fetching work experiences:", error);
    return [];
  }
}

async function getArticles() {
  try {
    const db = await getDb();
    const articles = await db
      .collection<Article>("articles")
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    return articles as (Article & { _id?: any })[];
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [] as (Article & { _id?: any })[];
  }
}

export default async function App() {
  const socialLinks = await getSocialLinks();
  const workExperiences = await getWorkExperiences();
  const articles = await getArticles();

  return (
    <main className="flex h-screen w-full box-border flex-col overflow-y-auto py-8 px-8">
      <HomeHeader />

      <div className="w-full max-w-3xl my-0 mx-auto mt-24">
        <AuthorIntro />
        <div className="max-w-2xl">
          <Section title="社交账号">
            <SocialLinks links={socialLinks} />
          </Section>

          <Section title="运行信息">
            <WebRunInfo />
          </Section>

          <Section title="网站信息">
            <WebControlInfo />
          </Section>

          <Section title="教育经历">
            <Education />
          </Section>
          <Section title="工作经历">
            <WorkExperience
              experiences={workExperiences}
              calculateDuration={calculateDuration}
            />
          </Section>
        </div>
      </div>
      <ListSection
        title="📚 技术文章"
        titleLink="/articles"
        items={articles}
      />
    </main>
  );
}
