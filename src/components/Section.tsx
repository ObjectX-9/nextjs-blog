import { ReactNode } from "react";

interface SectionProps {
  title: string;
  children: ReactNode;
}

export const Section = ({ title, children }: SectionProps) => {
  return (
    <>
      <h1 className="mb-4 mt-8 font-semibold text-lg text-gray-900">
        {title}
      </h1>
      <div className="mb-8">
        {children}
      </div>
    </>
  );
};
