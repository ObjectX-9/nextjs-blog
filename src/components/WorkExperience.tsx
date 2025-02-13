interface Experience {
  _id: string;
  description: string;
  companyUrl: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string | null;
}

interface WorkExperienceProps {
  experiences: Experience[];
  calculateDuration: (startDate: string, endDate: string | null) => { years: number; months: number };
}

export const WorkExperience = ({ experiences, calculateDuration }: WorkExperienceProps) => {
  const ensureHttps = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  return (
    <div className="space-y-8">
      {experiences.map((experience) => {
        const { years, months } = calculateDuration(
          experience.startDate,
          experience.endDate
        );
        return (
          <div key={experience._id} className="mb-8">
            <div className="mb-4">
              <p className="text-gray-800">
                {experience.description}{" "}
                <a
                  href={ensureHttps(experience.companyUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-500 font-medium"
                >
                  {experience.company}
                </a>{" "}
                {experience.position}
              </p>
            </div>
            <div className="mt-4">
              <p className="text-gray-800">
                工作经验：{years}年{months}个月
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
