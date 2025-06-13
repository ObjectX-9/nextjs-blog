import { NextRequest } from "next/server";
import { DbHelper } from "./db-helpers";

/**
 * 从 URL 搜索参数中提取参数
 */
export class ApiParams {
  private searchParams: URLSearchParams;

  constructor(request: Request) {
    const url = new URL(request.url);
    this.searchParams = url.searchParams;
  }

  /**
   * 获取字符串参数
   */
  getString(key: string, defaultValue?: string): string | undefined {
    return this.searchParams.get(key) || defaultValue;
  }

  /**
   * 获取必需的字符串参数
   */
  getRequiredString(key: string): string {
    const value = this.searchParams.get(key);
    if (!value) {
      throw new Error(`缺少必需参数: ${key}`);
    }
    return value;
  }

  /**
   * 获取数字参数
   */
  getNumber(key: string, defaultValue?: number): number | undefined {
    const value = this.searchParams.get(key);
    if (!value) return defaultValue;
    const num = parseInt(value);
    if (isNaN(num)) {
      throw new Error(`参数 ${key} 必须是数字`);
    }
    return num;
  }

  /**
   * 获取必需的数字参数
   */
  getRequiredNumber(key: string): number {
    const value = this.getNumber(key);
    if (value === undefined) {
      throw new Error(`缺少必需参数: ${key}`);
    }
    return value;
  }

  /**
   * 获取布尔参数
   */
  getBoolean(key: string, defaultValue?: boolean): boolean | undefined {
    const value = this.searchParams.get(key);
    if (!value) return defaultValue;
    return value.toLowerCase() === 'true';
  }

  /**
   * 获取 ObjectId 参数
   */
  getObjectId(key: string): string | undefined {
    const value = this.searchParams.get(key);
    if (!value) return undefined;
    if (!DbHelper.isValidObjectId(value)) {
      throw new Error(`参数 ${key} 不是有效的 ObjectId`);
    }
    return value;
  }

  /**
   * 获取必需的 ObjectId 参数
   */
  getRequiredObjectId(key: string): string {
    const value = this.getObjectId(key);
    if (!value) {
      throw new Error(`缺少必需参数: ${key}`);
    }
    return value;
  }

  /**
   * 获取分页参数
   */
  getPagination(defaultPage = 1, defaultLimit = 20) {
    return {
      page: this.getNumber('page', defaultPage)!,
      limit: this.getNumber('limit', defaultLimit)!
    };
  }
}

/**
 * 请求体数据验证工具
 */
export class RequestValidator {
  /**
   * 验证必需字段
   */
  static validateRequired<T extends Record<string, any>>(
    data: T,
    requiredFields: (keyof T)[]
  ): void {
    const missingFields = requiredFields.filter(
      field => data[field] === undefined || data[field] === null || data[field] === ''
    );

    if (missingFields.length > 0) {
      throw new Error(`缺少必需字段: ${missingFields.join(', ')}`);
    }
  }

  /**
   * 验证 ObjectId 字段
   */
  static validateObjectIds<T extends Record<string, any>>(
    data: T,
    objectIdFields: (keyof T)[]
  ): void {
    objectIdFields.forEach(field => {
      const value = data[field];
      if (value && !DbHelper.isValidObjectId(value)) {
        throw new Error(`字段 ${String(field)} 不是有效的 ObjectId`);
      }
    });
  }

  /**
   * 验证数字字段
   */
  static validateNumbers<T extends Record<string, any>>(
    data: T,
    numberFields: (keyof T)[]
  ): void {
    numberFields.forEach(field => {
      const value = data[field];
      if (value !== undefined && value !== null && isNaN(Number(value))) {
        throw new Error(`字段 ${String(field)} 必须是数字`);
      }
    });
  }

  /**
   * 清理数据（移除空值和无效字段）
   */
  static sanitize<T extends Record<string, any>>(
    data: T,
    allowedFields?: (keyof T)[]
  ): Partial<T> {
    const sanitized: Partial<T> = {};

    Object.keys(data).forEach(key => {
      // 如果指定了允许的字段，只保留这些字段
      if (allowedFields && !allowedFields.includes(key as keyof T)) {
        return;
      }

      const value = data[key];
      // 只保留非空值
      if (value !== undefined && value !== null && value !== '') {
        sanitized[key as keyof T] = value;
      }
    });

    return sanitized;
  }
}

/**
 * 创建 API 参数解析器
 */
export function createApiParams(request: Request): ApiParams {
  return new ApiParams(request);
}

/**
 * 解析请求体数据
 */
export async function parseRequestBody<T = any>(request: Request): Promise<T> {
  try {
    return await request.json();
  } catch (error) {
    throw new Error('无效的请求体格式');
  }
} 