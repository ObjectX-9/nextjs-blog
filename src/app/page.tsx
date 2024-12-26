import { getDocsList } from "@/components/Markdown";
import { ISocialLink } from "@/app/model/social-link";
import { IWorkExperience } from "@/app/model/work-experience";
import { getDb } from "@/lib/mongodb";
import { Article } from "./model/article";
import HomeHeader from "@/components/HomeHeader";
import AuthorIntro from "@/components/AuthorIntro";
import { ListSection } from "@/components/ListSection";
import { Section } from "@/components/Section";
import { SocialLinks } from "@/components/SocialLinks";
import { WorkExperience } from "@/components/WorkExperience";
import { Education } from "@/components/Education";

const calculateDuration = (startDate: string, endDate: string | null) => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const diffInMonths =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  const years = Math.floor(diffInMonths / 12);
  const months = diffInMonths % 12;
  return { years, months };
};

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

export default async function Index() {
  const docsList = getDocsList();
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
        title="📒 时间笔记"
        titleLink="/writing"
        items={docsList}
      />
      <ListSection
        title="📚 技术文章"
        titleLink="/articles"
        items={articles}
        isArticle={true}
      />
      {/* */}
    </main>
  );
}
