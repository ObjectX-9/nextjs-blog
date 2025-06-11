'use client'

import { ISocialLink } from "@/app/model/social-link";
import { IWorkExperience } from "@/app/model/work-experience";
import { Article } from "@/app/model/article";
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

interface HomePageClientProps {
  socialLinks: ISocialLink[];
  workExperiences: IWorkExperience[];
  articles: (Article & { _id?: any })[];
}

export default function HomePageClient({
  socialLinks,
  workExperiences,
  articles
}: HomePageClientProps) {
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