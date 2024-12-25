// 创建一个简单的类来模拟 ObjectId
export class ObjectId {
  private value: string;

  constructor(id?: string) {
    this.value = id || '';
  }

  toString() {
    return this.value;
  }

  toJSON() {
    return this.value;
  }
}

// 用于类型检查的接口
export interface WithId {
  _id?: ObjectId;
}
