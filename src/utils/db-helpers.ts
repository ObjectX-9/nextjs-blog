import { getDb } from "@/lib/mongodb";
import { ObjectId, WithId, Collection, Filter, UpdateFilter, DeleteResult, UpdateResult, OptionalUnlessRequiredId } from "mongodb";

/**
 * 类型安全的 ObjectId 转换工具
 */
export class DbHelper {
  /**
   * 安全地转换字符串为 ObjectId
   */
  static toObjectId(id: string | ObjectId): ObjectId {
    if (typeof id === 'string') {
      if (!ObjectId.isValid(id)) {
        throw new Error(`Invalid ObjectId: ${id}`);
      }
      return new ObjectId(id);
    }
    return id;
  }

  /**
   * 批量转换字符串数组为 ObjectId 数组
   */
  static toObjectIds(ids: (string | ObjectId)[]): ObjectId[] {
    return ids.map(id => this.toObjectId(id));
  }

  /**
   * 安全地转换 ObjectId 为字符串
   */
  static toString(id: ObjectId | string): string {
    return id.toString();
  }

  /**
   * 检查是否为有效的 ObjectId
   */
  static isValidObjectId(id: string): boolean {
    return ObjectId.isValid(id);
  }
}

/**
 * 数据库文档基础类型（MongoDB 原生类型）
 */
export type DbDocument = {
  _id?: ObjectId;
  [key: string]: any;
};

/**
 * 前端文档类型（兼容 string ID）
 */
export type FrontendDocument = {
  _id?: string | ObjectId;
  [key: string]: any;
};

/**
 * 类型安全的数据库操作类
 * T: 前端使用的类型（_id 可以是 string | ObjectId）
 * DbT: 数据库实际存储的类型（_id 必须是 ObjectId）
 */
export class TypeSafeDb<T extends FrontendDocument> {
  private collection: Collection<DbDocument> | null = null;

  constructor(private collectionName: string) {
    this.collection = null;
  }

  /**
   * 获取集合实例
   */
  private async getCollection(): Promise<Collection<DbDocument>> {
    if (!this.collection) {
      const db = await getDb();
      this.collection = db.collection<DbDocument>(this.collectionName);
    }
    return this.collection;
  }

  /**
   * 将前端文档转换为数据库文档
   */
  private toDbDocument(doc: Partial<T>): Partial<DbDocument> {
    const { _id, ...rest } = doc;
    const dbDoc: Partial<DbDocument> = { ...rest };

    if (_id) {
      dbDoc._id = DbHelper.toObjectId(_id as string | ObjectId);
    }

    return dbDoc;
  }

  /**
   * 将数据库文档转换为前端文档
   */
  private toFrontendDocument(doc: WithId<DbDocument>): T {
    return {
      ...doc,
      _id: doc._id.toString()
    } as T;
  }

  /**
   * 根据 ID 查找单个文档
   */
  async findById(id: string | ObjectId): Promise<T | null> {
    const collection = await this.getCollection();
    const doc = await collection.findOne({
      _id: DbHelper.toObjectId(id)
    } as Filter<DbDocument>);

    return doc ? this.toFrontendDocument(doc) : null;
  }

  /**
   * 根据条件查找单个文档
   */
  async findOne(filter: Partial<T>): Promise<T | null> {
    const collection = await this.getCollection();
    const dbFilter = this.toDbDocument(filter) as Filter<DbDocument>;
    const doc = await collection.findOne(dbFilter);

    return doc ? this.toFrontendDocument(doc) : null;
  }

  /**
   * 查找多个文档
   */
  async find(filter: Partial<T> = {}, options?: {
    sort?: any;
    skip?: number;
    limit?: number;
  }): Promise<T[]> {
    const collection = await this.getCollection();
    const dbFilter = this.toDbDocument(filter) as Filter<DbDocument>;
    let query = collection.find(dbFilter);

    if (options?.sort) {
      query = query.sort(options.sort);
    }
    if (options?.skip) {
      query = query.skip(options.skip);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const docs = await query.toArray();
    return docs.map(doc => this.toFrontendDocument(doc));
  }

  /**
   * 计算文档数量
   */
  async count(filter: Partial<T> = {}): Promise<number> {
    const collection = await this.getCollection();
    const dbFilter = this.toDbDocument(filter) as Filter<DbDocument>;
    return collection.countDocuments(dbFilter);
  }

  /**
   * 插入新文档
   */
  async insertOne(doc: Omit<T, '_id'>): Promise<T> {
    const collection = await this.getCollection();
    const dbDoc = this.toDbDocument(doc as Partial<T>);
    const result = await collection.insertOne(dbDoc as unknown as OptionalUnlessRequiredId<DbDocument>);

    return {
      _id: result.insertedId.toString(),
      ...doc
    } as T;
  }

  /**
   * 根据 ID 更新文档
   */
  async updateById(id: string | ObjectId, update: UpdateFilter<DbDocument>): Promise<UpdateResult<DbDocument>> {
    const collection = await this.getCollection();
    return collection.updateOne(
      { _id: DbHelper.toObjectId(id) } as Filter<DbDocument>,
      update
    );
  }

  /**
   * 根据条件更新文档
   */
  async updateOne(filter: Partial<T>, update: UpdateFilter<DbDocument>): Promise<UpdateResult<DbDocument>> {
    const collection = await this.getCollection();
    const dbFilter = this.toDbDocument(filter) as Filter<DbDocument>;
    return collection.updateOne(dbFilter, update);
  }

  /**
   * 根据 ID 删除文档
   */
  async deleteById(id: string | ObjectId): Promise<DeleteResult> {
    const collection = await this.getCollection();
    return collection.deleteOne({
      _id: DbHelper.toObjectId(id)
    } as Filter<DbDocument>);
  }

  /**
   * 根据条件删除文档
   */
  async deleteOne(filter: Partial<T>): Promise<DeleteResult> {
    const collection = await this.getCollection();
    const dbFilter = this.toDbDocument(filter) as Filter<DbDocument>;
    return collection.deleteOne(dbFilter);
  }

  /**
   * 分页查询
   */
  async paginate(filter: Partial<T> = {}, options: {
    page: number;
    limit: number;
    sort?: any;
  }) {
    const skip = (options.page - 1) * options.limit;
    const [items, total] = await Promise.all([
      this.find(filter, {
        sort: options.sort,
        skip,
        limit: options.limit
      }),
      this.count(filter)
    ]);

    return {
      items,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages: Math.ceil(total / options.limit),
        hasMore: skip + items.length < total
      }
    };
  }
}

/**
 * 创建类型安全的数据库操作实例
 */
export function createDbHelper<T extends FrontendDocument>(collectionName: string): TypeSafeDb<T> {
  return new TypeSafeDb<T>(collectionName);
} 