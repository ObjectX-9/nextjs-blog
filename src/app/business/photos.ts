import { request } from "@/utils/request";
import { IPhoto } from "../model/photo";

class PhotosBusiness {
    async getPhotos(): Promise<IPhoto[]> {
        const response = await request.get<{ photos: IPhoto[] }>('photos');
        return response.data.photos;
    }

    async createPhoto(photo: Omit<IPhoto, '_id' | 'createdAt' | 'updatedAt'>): Promise<IPhoto> {
        const response = await request.post<{ photo: IPhoto }>('photos', photo);
        return response.data.photo;
    }

    async updatePhoto(photo: IPhoto): Promise<IPhoto> {
        const response = await request.put<{ photo: IPhoto }>('photos', photo);
        return response.data.photo;
    }

    async deletePhoto(id: string): Promise<IPhoto> {
        const response = await request.delete<{ photo: IPhoto }>(`photos?id=${id}`);
        return response.data.photo;
    }
}

export const photosBusiness = new PhotosBusiness(); 