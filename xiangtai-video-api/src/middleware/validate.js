/**
 * 请求体校验（zod）
 */

/**
 * 使用 zod schema 校验 req.body
 * @param {import('zod').ZodSchema} schema
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: '参数不合法', issues: result.error.issues })
    }
    req.body = result.data
    next()
  }
}

