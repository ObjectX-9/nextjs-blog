import { NextResponse } from "next/server";
import OSS from "ali-oss";
import { v4 as uuidv4 } from "uuid";

// Check if all required environment variables are set
const requiredEnvVars = {
  region: process.env.OSS_REGION || process.env.NEXT_PUBLIC_OSS_REGION,
  accessKeyId:
    process.env.OSS_ACCESS_KEY_ID || process.env.NEXT_PUBLIC_OSS_ACCESS_KEY_ID,
  accessKeySecret:
    process.env.OSS_ACCESS_KEY_SECRET ||
    process.env.NEXT_PUBLIC_OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET || process.env.NEXT_PUBLIC_OSS_BUCKET,
};

// Validate environment variables
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
}

const client = new OSS({
  region: requiredEnvVars.region!,
  accessKeyId: requiredEnvVars.accessKeyId!,
  accessKeySecret: requiredEnvVars.accessKeySecret!,
  bucket: requiredEnvVars.bucket!,
});

// 重试配置
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1秒
  maxDelay: 5000, // 5秒
};

// 延迟函数
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 带重试的上传函数
async function uploadWithRetry(
  client: OSS,
  filename: string,
  buffer: Buffer,
  attempt: number = 1
): Promise<OSS.PutObjectResult> {
  try {
    return (await Promise.race([
      client.put(filename, buffer),
      new Promise(
        (_, reject) =>
          setTimeout(() => reject(new Error("Upload timeout")), 30000) // 30秒超时
      ),
    ])) as OSS.PutObjectResult;
  } catch (error) {
    const isRetryable = (error: any) => {
      // 判断是否是可重试的错误
      return (
        error.code === "ConnectionTimeoutError" ||
        error.code === "RequestTimeoutError" ||
        error.message === "Upload timeout" ||
        error.status === 504 ||
        error.name === "ConnectionTimeoutError" ||
        error.name === "RequestTimeoutError"
      );
    };

    if (attempt < RETRY_CONFIG.maxRetries && isRetryable(error)) {
      // 计算延迟时间（指数退避）
      const delayTime = Math.min(
        RETRY_CONFIG.initialDelay * Math.pow(2, attempt - 1),
        RETRY_CONFIG.maxDelay
      );

      console.log(
        `Upload attempt ${attempt} failed, retrying in ${delayTime}ms...`,
        {
          error,
          attempt,
        }
      );

      await delay(delayTime);
      return uploadWithRetry(client, filename, buffer, attempt + 1);
    }

    throw error;
  }
}

export async function POST(request: Request) {
  try {
    // Check if any environment variables are missing
    if (missingEnvVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingEnvVars.join(", ")}`
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    // 验证文件大小（最大10MB）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Log file details for debugging
    console.log("File details:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Get directory path from form data or default to 'album'
    const directory = (formData.get("directory") as string) || "album";

    // Generate unique filename
    const ext = file.name.split(".").pop();
    const filename = `/images/${directory}/${uuidv4()}.${ext}`;

    console.log("Attempting to upload file:", filename);

    // Upload to OSS with retry mechanism
    const result = await uploadWithRetry(client, filename, buffer);

    console.log("Upload successful:", result.url);

    return NextResponse.json({ success: true, url: result.url });
  } catch (error: any) {
    // 详细的错误日志记录
    console.error("Upload error details:", {
      message: error.message,
      code: error.code,
      name: error.name,
      status: error.status,
      stack: error.stack,
      requestId: error.requestId, // OSS错误特有
      hostname: error.hostname, // OSS错误特有
    });

    // 根据错误类型返回适当的状态码和消息
    let statusCode = 500;
    let errorMessage = "Failed to upload file";

    if (error.status === 403) {
      statusCode = 403;
      errorMessage = "Permission denied to upload file";
    } else if (error.code === "RequestTimeoutError" || error.status === 504) {
      statusCode = 504;
      errorMessage = "Upload request timed out";
    } else if (error.code === "ConnectionTimeoutError") {
      statusCode = 503;
      errorMessage = "Connection timed out";
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error.message,
        requestId: error.requestId,
      },
      { status: statusCode }
    );
  }
}
