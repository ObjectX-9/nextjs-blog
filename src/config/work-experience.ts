export interface WorkExperience {
  company: string;
  companyUrl: string;
  position: string;
  description: string;
  startDate: string;
  endDate: string | null; // null means current position
}

export const workExperiences: WorkExperience[] = [
  {
    "company": "js.design",
    "companyUrl": "https://js.design/",
    "position": "前端【图形编辑器方向】",
    "description": "实习和校招目前在北京即时设计",
    "startDate": "2022-07-01",
    "endDate": null
  }
];
