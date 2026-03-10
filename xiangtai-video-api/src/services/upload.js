/**
 * 文件存储服务：本地磁盘或 S3 兼容存储
 * 当前实现：落盘到 UPLOAD_DIR，返回相对路径或 UPLOAD_PUBLIC_URL
 * 扩展：若配置 S3 环境变量（S3_BUCKET 等），则上传到 S3/OSS 并返回对象 key；
 *      下载时通过预签名 URL（短时有效）实现防盗链。
 */

import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const UPLOAD_DIR = process.env.UPLOAD_DIR || join(__dirname, '../../uploads')
const PUBLIC_URL = process.env.UPLOAD_PUBLIC_URL || ''

const S3_BUCKET = process.env.S3_BUCKET || ''
const S3_ENDPOINT = process.env.S3_ENDPOINT || ''
const S3_REGION = process.env.S3_REGION || 'auto'
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || ''
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || ''

/**
 * 保存文件：优先 S3，其次本地磁盘
 * @param {Buffer} buffer
 * @param {string} filename
 * @returns {Promise<{ storage: 's3'|'local', key: string, url?: string }>}
 */
export async function saveFile(buffer, filename) {
  if (isS3Enabled()) {
    const key = buildObjectKey(filename)
    await putObjectToS3(key, buffer)
    return { storage: 's3', key }
  }
  await mkdir(UPLOAD_DIR, { recursive: true })
  const safeName = Date.now() + '-' + (filename || 'video').replace(/[^a-zA-Z0-9.-]/g, '_')
  const filepath = join(UPLOAD_DIR, safeName)
  await writeFile(filepath, buffer)
  const url = PUBLIC_URL ? PUBLIC_URL + '/' + safeName : '/uploads/' + safeName
  return { storage: 'local', key: safeName, url }
}

/**
 * 生成下载 URL：S3 返回预签名 URL，本地返回 /uploads/ 路径
 * @param {{ storage: 's3'|'local', key: string, url?: string }} file
 * @param {number=} expiresSeconds
 */
export async function getDownloadUrl(file, expiresSeconds = 300) {
  if (!file) return null
  if (file.storage === 'local') {
    return file.url || (PUBLIC_URL ? PUBLIC_URL + '/' + file.key : '/uploads/' + file.key)
  }
  if (file.storage === 's3') {
    return await getSignedUrlForS3(file.key, expiresSeconds)
  }
  return null
}

function isS3Enabled() {
  return !!(S3_BUCKET && (S3_ENDPOINT || S3_REGION) && S3_ACCESS_KEY && S3_SECRET_KEY)
}

function buildObjectKey(filename) {
  const clean = (filename || 'video').replace(/[^a-zA-Z0-9.-]/g, '_')
  return `uploads/${Date.now()}-${randomUUID()}-${clean}`
}

async function getS3Client() {
  const { S3Client } = await import('@aws-sdk/client-s3')
  return new S3Client({
    region: S3_REGION,
    endpoint: S3_ENDPOINT || undefined,
    credentials: {
      accessKeyId: S3_ACCESS_KEY,
      secretAccessKey: S3_SECRET_KEY
    }
  })
}

async function putObjectToS3(key, buffer) {
  const { PutObjectCommand } = await import('@aws-sdk/client-s3')
  const client = await getS3Client()
  await client.send(new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: buffer
  }))
}

async function getSignedUrlForS3(key, expiresSeconds) {
  const { GetObjectCommand } = await import('@aws-sdk/client-s3')
  const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')
  const client = await getS3Client()
  const cmd = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key })
  return await getSignedUrl(client, cmd, { expiresIn: expiresSeconds })
}
