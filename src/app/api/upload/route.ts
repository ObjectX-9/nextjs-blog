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
    return await client.put(filename, buffer);
  } catch (err) {
    if (attempt >= RETRY_CONFIG.maxRetries) {
      throw err;
    }

    const delayTime = Math.min(
      RETRY_CONFIG.initialDelay * Math.pow(2, attempt - 1),
      RETRY_CONFIG.maxDelay
    );
    await delay(delayTime);

    return uploadWithRetry(client, filename, buffer, attempt + 1);
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string || "articles"; // 默认为 articles 目录

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // 检查文件类型
    const allowedTypes = ["text/markdown", "text/plain", "image/"];
    const isAllowedType = allowedTypes.some(type => 
      file.type.startsWith(type) || file.name.endsWith(".md")
    );

    if (!isAllowedType) {
      return NextResponse.json(
        { error: "Only markdown and image files are allowed" },
        { status: 400 }
      );
    }

    // 获取文件扩展名
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension) {
      return NextResponse.json(
        { error: "Invalid file extension" },
        { status: 400 }
      );
    }

    // 根据文件类型决定存储路径
    const basePath = file.type.startsWith("image/") ? "images" : "articles";
    const filename = `${basePath}/${type}/${uuidv4()}.${extension}`;

    // 读取文件内容
    const buffer = Buffer.from(await file.arrayBuffer());

    // 上传文件到OSS
    const result = await uploadWithRetry(client, filename, buffer);

    // 构建完整的URL
    const url = `https://${requiredEnvVars.bucket}.${requiredEnvVars.region}.aliyuncs.com/${filename}`;

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
