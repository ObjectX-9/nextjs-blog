import { request } from "@/utils/request";
import { ISocialLink } from "../model/social-link";

class SocialLinkBusiness {
    async getSocialLinks(): Promise<ISocialLink[]> {
        const response = await request.get<{ socialLinks: ISocialLink[] }>('social-links');
        return response.data.socialLinks;
    }

    async createSocialLink(socialLink: ISocialLink): Promise<ISocialLink> {
        const response = await request.post<ISocialLink>('social-links', socialLink);
        return response.data;
    }

    async updateSocialLink(socialLink: ISocialLink): Promise<ISocialLink> {
        const response = await request.put<ISocialLink>('social-links', socialLink);
        return response.data;
    }

    async deleteSocialLink(id: string): Promise<ISocialLink> {
        const response = await request.delete<ISocialLink>(`social-links?id=${id}`);
        return response.data;
    }
}

export const socialLinkBusiness = new SocialLinkBusiness();