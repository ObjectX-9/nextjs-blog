import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios';

const isDev = process.env.NODE_ENV === 'development';

/**
 * 响应结构接口定义
 */
export interface ResponseData<T = any> {
    code: number;
    data: T;
    message: string;
    success: boolean;
}

/**
 * 请求配置接口扩展
 */
export interface RequestConfig extends AxiosRequestConfig {
    retry?: number;       // 重试次数
    retryDelay?: number;  // 重试延迟时间(ms)
}

/**
 * 初始化配置
 * 开发环境使用本地代理，生产环境使用后端API地址
 */
const initConfig = {
    baseURL: isDev ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_API_URL || '',
    timeout: 10000,
    withCredentials: true
}

/**
 * 处理URL，自动添加/api前缀
 * @param url 原始URL
 * @returns 处理后的URL
 */
function processUrl(url: string): string {
    // 如果URL已经以/api开头或者是完整的URL（包含http或https），则不添加前缀
    if (url.startsWith('/api/') || url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    // 否则添加/api前缀
    return `/api/${url.startsWith('/') ? url.substring(1) : url}`;
}

/**
 * 初始化拦截器
 * 请求拦截器：在发送请求之前做些什么
 * 响应拦截器：在收到响应之后做些什么
 */
function initInterceptor(service: AxiosInstance) {
    // 请求拦截器
    service.interceptors.request.use(
        (config) => {
            // 在发送请求之前做些什么
            // 例如：添加通用header，身份验证token等
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            // 处理请求错误
            console.error('请求错误:', error);
            return Promise.reject(error);
        }
    );

    // 响应拦截器
    service.interceptors.response.use(
        (response: AxiosResponse) => {
            const res = response.data;

            // 如果返回的状态码不是200，说明接口请求有误
            // 这里可以根据自己的后端接口规范自定义
            if (response.status !== 200) {
                console.error('接口请求失败:', res);

                // 处理特定错误码
                if (response.status === 401) {
                    // 401: 未授权
                    // 可以在这里处理登出逻辑
                    console.error('未授权，请重新登录');
                }
                return Promise.reject(new Error(res.message || '请求失败'));
            } else {
                // 统一包装返回数据格式
                if (res.data !== undefined) {
                    // 如果后端已经包装了data字段，直接返回
                    return res;
                } else {
                    // 如果后端没有包装data字段，手动包装
                    return {
                        code: 200,
                        data: res,
                        message: 'success',
                        success: true
                    };
                }
            }
        },
        (error) => {
            // 如果是取消请求的错误，直接返回
            if (axios.isCancel(error)) {
                console.log('请求被取消:', error.message);
                return Promise.reject(error);
            }

            console.error('响应错误:', error);
            let message = '请求出错了，请稍后再试';

            // 处理请求重试
            const config = error.config as RequestConfig;
            if (config && config.retry && config.retry > 0) {
                config.retry--;
                const retryDelay = config.retryDelay || 1000;

                console.log(`请求失败，${retryDelay}ms后重试，剩余重试次数：${config.retry}`);

                // 创建新的Promise用于延迟重试
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(axios(config));
                    }, retryDelay);
                });
            }

            if (error.response) {
                // 请求成功发出且服务器也响应了状态码，但状态代码超出了2xx的范围
                switch (error.response.status) {
                    case 400:
                        message = '请求错误(400)';
                        break;
                    case 401:
                        message = '未授权，请重新登录(401)';
                        // 可以在这里处理登出逻辑
                        break;
                    case 403:
                        message = '拒绝访问(403)';
                        break;
                    case 404:
                        message = '请求的资源不存在(404)';
                        break;
                    case 500:
                        message = '服务器错误(500)';
                        break;
                    default:
                        message = `连接出错(${error.response.status})!`;
                }
            } else if (error.request) {
                // 请求已经成功发起，但没有收到响应
                message = '网络异常，请检查您的网络连接!';
            } else {
                // 发送请求时出了点问题
                message = error.message;
            }

            // 可以在这里集成全局的错误提示
            console.error(message);

            return Promise.reject(error);
        }
    );
}

/**
 * 请求类
 * 封装了GET、POST、PUT、DELETE、PATCH请求
 * 并添加了拦截器
 */
class Request {
    private service: AxiosInstance;
    private pendingRequests: Map<string, CancelTokenSource>;

    constructor() {
        this.service = axios.create(initConfig);
        this.pendingRequests = new Map();
        initInterceptor(this.service);
    }

    /**
     * 生成请求的唯一键
     * @param config 请求配置
     * @returns 唯一键
     */
    private generateRequestKey(config: AxiosRequestConfig): string {
        const { url, method, params, data } = config;
        return [url, method, JSON.stringify(params), JSON.stringify(data)].join('&');
    }

    /**
     * 添加请求到待处理列表
     * @param config 请求配置
     */
    private addPendingRequest(config: AxiosRequestConfig): void {
        const requestKey = this.generateRequestKey(config);
        if (!config.cancelToken) {
            const source = axios.CancelToken.source();
            config.cancelToken = source.token;
            this.pendingRequests.set(requestKey, source);
        }
    }

    /**
     * 移除待处理请求
     * @param config 请求配置
     */
    private removePendingRequest(config: AxiosRequestConfig): void {
        const requestKey = this.generateRequestKey(config);
        if (this.pendingRequests.has(requestKey)) {
            this.pendingRequests.delete(requestKey);
        }
    }

    /**
     * 取消所有待处理请求
     */
    cancelAllRequests(): void {
        this.pendingRequests.forEach((source) => {
            source.cancel('用户取消了请求');
        });
        this.pendingRequests.clear();
    }

    /**
     * 取消特定请求
     * @param config 请求配置
     */
    cancelRequest(config: AxiosRequestConfig): void {
        const requestKey = this.generateRequestKey(config);
        if (this.pendingRequests.has(requestKey)) {
            const source = this.pendingRequests.get(requestKey)!;
            source.cancel('用户取消了请求');
            this.pendingRequests.delete(requestKey);
        }
    }

    /**
     * GET请求
     * @param url 请求地址 (无需添加/api前缀)
     * @param params 请求参数
     * @param config 请求配置
     * @returns Promise<T> 返回泛型T类型的数据
     */
    get<T = any>(url: string, params?: any, config?: RequestConfig): Promise<ResponseData<T>> {
        const requestConfig = { ...config, params };
        this.addPendingRequest(requestConfig);

        return this.service.get(processUrl(url), requestConfig)
            .finally(() => this.removePendingRequest(requestConfig)) as unknown as Promise<ResponseData<T>>;
    }

    /**
     * POST请求
     * @param url 请求地址 (无需添加/api前缀)
     * @param data 请求数据
     * @param config 请求配置
     * @returns Promise<T> 返回泛型T类型的数据
     */
    post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>> {
        const requestConfig = { ...config };
        this.addPendingRequest(requestConfig);

        return this.service.post(processUrl(url), data, requestConfig)
            .finally(() => this.removePendingRequest(requestConfig)) as unknown as Promise<ResponseData<T>>;
    }

    /**
     * PUT请求
     * @param url 请求地址 (无需添加/api前缀)
     * @param data 请求数据
     * @param config 请求配置
     * @returns Promise<T> 返回泛型T类型的数据
     */
    put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>> {
        const requestConfig = { ...config };
        this.addPendingRequest(requestConfig);

        return this.service.put(processUrl(url), data, requestConfig)
            .finally(() => this.removePendingRequest(requestConfig)) as unknown as Promise<ResponseData<T>>;
    }

    /**
     * DELETE请求
     * @param url 请求地址 (无需添加/api前缀)
     * @param config 请求配置
     * @returns Promise<T> 返回泛型T类型的数据
     */
    delete<T = any>(url: string, config?: RequestConfig): Promise<ResponseData<T>> {
        const requestConfig = { ...config };
        this.addPendingRequest(requestConfig);

        return this.service.delete(processUrl(url), requestConfig)
            .finally(() => this.removePendingRequest(requestConfig)) as unknown as Promise<ResponseData<T>>;
    }

    /**
     * PATCH请求
     * @param url 请求地址 (无需添加/api前缀)
     * @param data 请求数据
     * @param config 请求配置
     * @returns Promise<T> 返回泛型T类型的数据
     */
    patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>> {
        const requestConfig = { ...config };
        this.addPendingRequest(requestConfig);

        return this.service.patch(processUrl(url), data, requestConfig)
            .finally(() => this.removePendingRequest(requestConfig)) as unknown as Promise<ResponseData<T>>;
    }
}

export const request = new Request();