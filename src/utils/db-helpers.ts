import { getDb } from "@/lib/mongodb";
import { Collection, WithId, UpdateFilter, DeleteResult, UpdateResult, InsertOneResult, InsertManyResult, ObjectId } from "mongodb";

/**
 * 简单的ID转换工具
 */
export class IdHelper {
  static isValidObjectId(id: string): boolean {
    return ObjectId.isValid(id);
  }

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
   * 转换查询条件中的_id字段
   */
  static convertFilterIds(filter: any): any {
    if (!filter || typeof filter !== 'object') {
      return filter;
    }

    const converted = { ...filter };

    if (converted._id !== undefined) {
      if (typeof converted._id === 'object' && converted._id !== null && !ObjectId.isValid(converted._id)) {
        // 处理查询操作符，如 { $in: [...], $ne: "..." }
        const operators: any = {};
        for (const [op, opValue] of Object.entries(converted._id)) {
          if (op.startsWith('$')) {
            if (op === '$in' || op === '$nin') {
              // 处理数组操作符
              operators[op] = Array.isArray(opValue)
                ? opValue.map(id => this.toObjectId(id as string | ObjectId))
                : [this.toObjectId(opValue as string | ObjectId)];
            } else {
              operators[op] = this.toObjectId(opValue as string | ObjectId);
            }
          } else {
            operators[op] = opValue;
          }
        }
        converted._id = operators;
      } else {
        // 直接的 _id 值
        converted._id = this.toObjectId(converted._id);
      }
    }

    return converted;
  }

  /**
   * 转换文档，将ObjectId转为字符串
   */
  static convertDocumentIds<T>(doc: WithId<any>): T & { _id: string } {
    return {
      ...doc,
      _id: doc._id.toString()
    } as T & { _id: string };
  }
}

/**
 * 前端文档类型（string ID）
 */
export type FrontendDocument = {
  _id?: string;
  [key: string]: any;
};

/**
 * 创建简单的数据库操作Helper
 * 只需要传入collection名称，自动处理ID转换
 */
export function createDbHelper<T extends FrontendDocument>(collectionName: string) {
  let collection: Collection | null = null;

  const getCollection = async (): Promise<Collection> => {
    if (!collection) {
      const db = await getDb();
      collection = db.collection(collectionName);
    }
    return collection;
  };

  return {
    /**
     * 查找单个文档
     */
    async findOne(filter?: any, options?: any): Promise<T | null> {
      const coll = await getCollection();
      const convertedFilter = IdHelper.convertFilterIds(filter);
      const result = await coll.findOne(convertedFilter, options);
      return result ? IdHelper.convertDocumentIds<T>(result) : null;
    },

    /**
     * 查找多个文档
     */
    async find(filter?: any, options?: any): Promise<T[]> {
      const coll = await getCollection();
      const convertedFilter = IdHelper.convertFilterIds(filter);
      const docs = await coll.find(convertedFilter, options).toArray();
      return docs.map(doc => IdHelper.convertDocumentIds<T>(doc));
    },

    /**
     * 根据ID查找文档
     */
    async findById(id: string): Promise<T | null> {
      return this.findOne({ _id: id });
    },

    /**
     * 插入单个文档
     */
    async insertOne(doc: Omit<T, '_id'>): Promise<T> {
      const coll = await getCollection();
      const result: InsertOneResult = await coll.insertOne(doc);
      return {
        ...doc,
        _id: result.insertedId.toString()
      } as T;
    },

    /**
     * 插入多个文档
     */
    async insertMany(docs: Omit<T, '_id'>[]): Promise<T[]> {
      const coll = await getCollection();
      const result: InsertManyResult = await coll.insertMany(docs);
      return docs.map((doc, index) => ({
        ...doc,
        _id: result.insertedIds[index].toString()
      })) as T[];
    },

    /**
     * 更新单个文档
     */
    async updateOne(filter: any, update: UpdateFilter<any>): Promise<UpdateResult> {
      const coll = await getCollection();
      const convertedFilter = IdHelper.convertFilterIds(filter);
      return coll.updateOne(convertedFilter, update);
    },

    /**
     * 更新多个文档
     */
    async updateMany(filter: any, update: UpdateFilter<any>): Promise<UpdateResult> {
      const coll = await getCollection();
      const convertedFilter = IdHelper.convertFilterIds(filter);
      return coll.updateMany(convertedFilter, update);
    },

    /**
     * 根据ID更新文档
     */
    async updateById(id: string, update: UpdateFilter<any>): Promise<UpdateResult> {
      return this.updateOne({ _id: id }, update);
    },

    /**
     * 删除单个文档
     */
    async deleteOne(filter: any): Promise<DeleteResult> {
      const coll = await getCollection();
      const convertedFilter = IdHelper.convertFilterIds(filter);
      return coll.deleteOne(convertedFilter);
    },

    /**
     * 删除多个文档
     */
    async deleteMany(filter: any): Promise<DeleteResult> {
      const coll = await getCollection();
      const convertedFilter = IdHelper.convertFilterIds(filter);
      return coll.deleteMany(convertedFilter);
    },

    /**
     * 根据ID删除文档
     */
    async deleteById(id: string): Promise<DeleteResult> {
      return this.deleteOne({ _id: id });
    },

    /**
     * 计算文档数量
     */
    async countDocuments(filter?: any): Promise<number> {
      const coll = await getCollection();
      const convertedFilter = IdHelper.convertFilterIds(filter);
      return coll.countDocuments(convertedFilter);
    },

    /**
     * 分页查询
     */
    async paginate(filter: any = {}, options: {
      page: number;
      limit: number;
      sort?: any;
    }) {
      const coll = await getCollection();
      const convertedFilter = IdHelper.convertFilterIds(filter);
      const skip = (options.page - 1) * options.limit;

      const [items, total] = await Promise.all([
        coll.find(convertedFilter)
          .sort(options.sort || {})
          .skip(skip)
          .limit(options.limit)
          .toArray()
          .then(docs => docs.map(doc => IdHelper.convertDocumentIds<T>(doc))),
        coll.countDocuments(convertedFilter)
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
    },

    /**
     * 聚合查询
     */
    async aggregate<R = any>(pipeline: any[]): Promise<R[]> {
      const coll = await getCollection();
      return coll.aggregate(pipeline).toArray() as Promise<R[]>;
    },

    /**
     * 获取原生Collection (高级用法)
     * 如果需要使用其他MongoDB方法，可以获取原生collection
     */
    async getRawCollection(): Promise<Collection> {
      return getCollection();
    }
  };
} 