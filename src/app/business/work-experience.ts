import { request } from "@/utils/request";
import { IWorkExperience } from "../model/work-experience";

class WorkExperienceBusiness {
    async getWorkExperiences(): Promise<IWorkExperience[]> {
        const response = await request.get<{ workExperiences: IWorkExperience[] }>('work-experience');
        return response.data.workExperiences;
    }

    async createWorkExperience(workExperience: IWorkExperience): Promise<IWorkExperience> {
        const response = await request.post<{ workExperience: IWorkExperience }>('work-experience', workExperience);
        return response.data.workExperience;
    }

    async updateWorkExperience(workExperience: IWorkExperience): Promise<IWorkExperience> {
        const response = await request.put<{ workExperience: IWorkExperience }>('work-experience', workExperience);
        return response.data.workExperience;
    }

    async deleteWorkExperience(id: string): Promise<IWorkExperience> {
        const response = await request.delete<IWorkExperience>(`work-experience?id=${id}`);
        return response.data;
    }
}
export const workExperienceBusiness = new WorkExperienceBusiness();