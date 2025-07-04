#!/usr/bin/env node

/**
 * 构建时环境变量处理脚本
 * 此脚本在 Docker 构建阶段执行，用于确保环境变量正确地被 Next.js 构建过程使用
 * 同时不将敏感信息留在最终的镜像中
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 检查是否有必要的环境变量
const requiredEnvVars = [
  'JWT_SECRET',
  'ADMIN_PASSWORD',
  'ADMIN_USERNAME',
  'OSS_BUCKET',
  'OSS_ACCESS_KEY_SECRET',
  'OSS_ACCESS_KEY_ID',
  'OSS_REGION',
  'MONGODB_URI'
];

// 检查环境变量是否存在
const missingEnvVars = requiredEnvVars.filter(name => !process.env[name]);
if (missingEnvVars.length > 0) {
  console.warn(`警告: 以下构建时环境变量缺失: ${missingEnvVars.join(', ')}`);
  console.warn('这可能会影响应用的某些功能。');
}

try {
  console.log('开始构建 Next.js 应用...');

  // 使用pnpm命令执行build，这样更可靠
  execSync('pnpm build', {
    stdio: 'inherit',
    env: process.env // 确保传递所有环境变量
  });

  console.log('构建完成!');
} catch (error) {
  console.error('构建过程中出错:', error);
  process.exit(1);
} 