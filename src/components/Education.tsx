"use client";

import { useSiteStore } from "@/store/site";

export const Education = () => {
  const { site } = useSiteStore();

  return (
    <div className="space-y-4">
      {site?.author?.education?.map((edu, index) => (
        <div key={`${edu.school}-${index}`} className="group flex items-center space-x-2 py-2 hover:bg-gray-50 rounded-lg transition-colors duration-200">
          <div className="flex-1">
            <p className="text-gray-600 flex items-center flex-wrap gap-2">
              <span>{edu.school}</span>
              <span className="text-gray-300">|</span>
              <span>{edu.major}</span>
              <span className="text-gray-300">|</span>
              <span>{edu.degree}</span>
              {edu.certifications?.length ? (
                <>
                  <span className="text-gray-300">|</span>
                  {edu.certifications.map((cert, i) => (
                    <span key={cert} className="text-gray-600">
                      {cert}
                    </span>
                  ))}
                </>
              ) : null}
            </p>
          </div>
          <div className="text-gray-600 text-sm whitespace-nowrap">
            {new Date(edu.startDate).getFullYear()} - {new Date(edu.endDate).getFullYear()}
          </div>
        </div>
      ))}
    </div>
  );
};
