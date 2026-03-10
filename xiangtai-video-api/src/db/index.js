/**
 * SQLite 数据库连接与初始化（sql.js / WASM）
 *
 * 说明：
 * - `better-sqlite3` 在 Windows + Node 24 环境下可能需要 C++ 编译工具链；
 * - 这里使用 `sql.js`（WASM）实现免编译运行，便于本地联调与快速部署。
 */

import initSqlJs from 'sql.js'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbPath = process.env.SQLITE_PATH || join(__dirname, '../../data.db')

/** @type {import('sql.js').Database | null} */
let db = null

/** @type {import('sql.js') | null} */
let SQL = null

/** 是否启用持久化写回（默认开启） */
const PERSIST = process.env.SQLITE_PERSIST !== '0'

/** 初始化 sql.js（单例） */
async function init() {
  if (SQL) return SQL
  const require = createRequire(import.meta.url)
  const distDir = dirname(require.resolve('sql.js/dist/sql-wasm.js'))
  SQL = await initSqlJs({
    // 用 require.resolve 定位 dist，部署更稳定（不依赖手写 node_modules 路径）
    locateFile: (file) => join(distDir, file)
  })
  return SQL
}

/** 将 DB 写回到磁盘（WASM 内存库持久化） */
function persist(database) {
  if (!PERSIST) return
  try {
    const data = database.export()
    writeFileSync(dbPath, Buffer.from(data))
  } catch {
    // 忽略写回错误（联调模式）
  }
}

/** 兼容 better-sqlite3 的 prepare().get/all/run 形态 */
function wrap(database) {
  return {
    exec(sql) {
      database.run(sql)
      persist(database)
    },
    prepare(sql) {
      return {
        get(...params) {
          const stmt = database.prepare(sql)
          stmt.bind(params)
          const row = stmt.step() ? stmt.getAsObject() : undefined
          stmt.free()
          return row
        },
        all(...params) {
          const stmt = database.prepare(sql)
          stmt.bind(params)
          const rows = []
          while (stmt.step()) rows.push(stmt.getAsObject())
          stmt.free()
          return rows
        },
        run(...params) {
          // 使用 Database.run(sql, params) 执行，确保 last_insert_rowid() 正常工作
          database.run(sql, params)
          persist(database)
          // sql.js 不直接提供 lastInsertRowid，这里返回占位结构，路由中避免依赖该值
          return { changes: 1, lastInsertRowid: null }
        }
      }
    }
  }
}

/**
 * 获取数据库实例（单例）
 * @returns {Promise<{ exec: Function, prepare: Function }>}
 */
export async function getDb() {
  if (!db) {
    const SQLLib = await init()
    if (existsSync(dbPath)) {
      const fileBuffer = readFileSync(dbPath)
      db = new SQLLib.Database(new Uint8Array(fileBuffer))
    } else {
      db = new SQLLib.Database()
    }
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8')
    db.run(schema)
    const w = wrap(db)
    await seedIfEmpty(w)
    ensureAdminPerms(w)
    persist(db)
  }
  return wrap(db)
}

/**
 * 轻量迁移：为历史 data.db 中的 admin 账号补齐默认权限（开发/联调用）
 * @param {{ prepare: Function }} database
 */
function ensureAdminPerms(database) {
  const admin = database.prepare("SELECT id FROM users WHERE role = 'admin' ORDER BY id LIMIT 1").get()
  if (!admin?.id) return
  const hasAny = database.prepare('SELECT COUNT(*) as n FROM admin_permissions WHERE user_id = ?').get(admin.id)
  if ((hasAny?.n ?? 0) > 0) return
  const perms = [
    'admin.stats.read',
    'admin.videos.read',
    'admin.videos.streaming_code.write',
    'admin.videos.cloud.write',
    'admin.videos.ai_analysis.write',
    'admin.points.read',
    'admin.audit.read'
  ]
  for (const p of perms) {
    database.prepare('INSERT OR IGNORE INTO admin_permissions (user_id, perm) VALUES (?, ?)').run(admin.id, p)
  }
}

/**
 * 无数据时写入种子数据（密码为明文演示，生产环境请用 bcrypt）
 * @param {{ prepare: Function }} database
 */
async function seedIfEmpty(database) {
  const adminCount = database.prepare("SELECT COUNT(*) as n FROM users WHERE role = 'admin'").get()
  if (adminCount.n > 0) return

  // 种子密码使用 bcrypt hash（生产环境仍建议改默认密码）
  // 为避免循环依赖，这里用动态导入
  const { hashPassword } = await import('../services/password.js')
  const seedHash = hashPassword('123456')

  database.prepare(
    "INSERT INTO users (username, password_hash, role) VALUES ('admin', ?, 'admin')"
  ).run(seedHash)
  database.prepare(
    "INSERT INTO users (username, password_hash, role) VALUES ('client', ?, 'client')"
  ).run(seedHash)
  database.prepare(
    "INSERT INTO users (username, password_hash, role) VALUES ('influencer', ?, 'influencer')"
  ).run(seedHash)

  const clientId = database.prepare("SELECT id FROM users WHERE role = 'client'").get().id
  const influencerId = database.prepare("SELECT id FROM users WHERE role = 'influencer'").get().id
  const adminId = database.prepare("SELECT id FROM users WHERE role = 'admin'").get().id

  database.prepare('INSERT INTO points_accounts (user_id, role, points) VALUES (?, ?, ?)').run(clientId, 'client', 1000)
  database.prepare('INSERT INTO points_accounts (user_id, role, points) VALUES (?, ?, ?)').run(influencerId, 'influencer', 5000)

  database.prepare(
    "INSERT INTO videos (title, video_type, video_link, streaming_code, ai_analysis, order_count, play_count) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run('产品推广视频 A', 'explain', 'https://example.com/video/1', 'ST-001', '已通过 AI 解析', 128, 15200)
  database.prepare(
    "INSERT INTO videos (title, video_type, video_link, streaming_code, ai_analysis, order_count, play_count) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run('产品推广视频 B', 'explain', 'https://example.com/video/2', 'ST-002', '已通过 AI 解析', 89, 8300)
  database.prepare(
    "INSERT INTO videos (title, video_type, video_link, streaming_code, ai_analysis, order_count, play_count) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run('产品推广视频 C', 'face', 'https://example.com/video/3', 'ST-003', '已通过 AI 解析', 256, 42100)

  database.prepare(
    "INSERT INTO tasks (product_type, video_download_link) VALUES (?, ?)"
  ).run('口播视频（不转场景）', 'https://example.com/download/task1.mp4')
  database.prepare(
    "INSERT INTO tasks (product_type, video_download_link) VALUES (?, ?)"
  ).run('多场景讲解视频', 'https://example.com/download/task2.mp4')

  // 管理员默认授予全部权限（示例：可按需缩减）
  const perms = [
    'admin.stats.read',
    'admin.videos.read',
    'admin.videos.streaming_code.write',
    'admin.videos.cloud.write',
    'admin.videos.ai_analysis.write',
    'admin.points.read',
    'admin.audit.read'
  ]
  for (const p of perms) {
    database.prepare('INSERT INTO admin_permissions (user_id, perm) VALUES (?, ?)').run(adminId, p)
  }
}
