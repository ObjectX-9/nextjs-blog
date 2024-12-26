export interface IEducation {
  school: string;     // 学校名称
  major: string;      // 专业
  degree: string;     // 学位
  certifications?: string[];  // 证书，如 CET6 等
  startDate: string;  // 入学时间
  endDate: string;    // 毕业时间
}
