import { ObjectId } from "mongodb";

// 服务器端的Demo接口
export interface IServerDemo {
  _id?: ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  completed: boolean;
  likes: number;
  views: number;
  gifUrl: string;
  description: string;
  tags: string[];
  categoryId: ObjectId;
}

// 服务器端的DemoCategory接口
export interface IServerDemoCategory {
  _id?: ObjectId;
  name: string;
  description?: string;
  demos: IServerDemo[];
  createdAt: Date;
  updatedAt: Date;
}
