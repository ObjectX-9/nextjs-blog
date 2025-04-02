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
          <div key={experience._id} className="mb-6 bg-white rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <div className="flex flex-wrap items-center justify-between mb-3">
              <div className="flex items-center justify-between w-full">
                <a
                  href={ensureHttps(experience.companyUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-800 font-semibold hover:text-gray-600 transition-colors duration-200 mr-2"
                >
                  {experience.company}
                </a>
                <span className="px-2 py-0.5 rounded text-gray-700 text-sm">
                  {experience.position}
                </span>
              </div>
            </div>
            <div className="text-gray-600 mb-3 leading-relaxed">
              {experience.description}
            </div>
            <div className="text-gray-500 text-sm flex items-center">
              <span>工作时长：<span className="font-medium">{years}年{months}个月</span></span>
              <span className="ml-2">工作时期：<span className="font-medium">{experience.startDate} - {experience.endDate || '至今'}</span></span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
