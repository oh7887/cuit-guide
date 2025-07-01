import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono<{ Bindings: CloudflareBindings }>()

// 启用 CORS 以便前端调用
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// 基础路由
app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// 数据库连接测试端点
app.get('/api/test-db', async (c) => {
  try {
    // 测试基本连接
    const result = await c.env.DB.prepare('SELECT 1 as test').first()
    
    return c.json({
      success: true,
      message: '数据库连接成功',
      data: {
        test_result: result,
        timestamp: new Date().toISOString(),
        database_name: 'epass-db'
      }
    })
  } catch (error) {
    console.error('数据库连接错误：', error)
    
    return c.json({
      success: false,
      message: '数据库连接失败',
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

// 创建测试表的端点（可选）
app.post('/api/init-test-table', async (c) => {
  try {
    // 创建一个简单的测试表
    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS test_table (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run()
    
    return c.json({
      success: true,
      message: '测试表创建成功',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('创建表错误：', error)
    
    return c.json({
      success: false,
      message: '创建表失败',
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

// 插入测试数据端点
app.post('/api/test-insert', async (c) => {
  try {
    const { message = '测试消息' } = await c.req.json().catch(() => ({}))
    
    const result = await c.env.DB.prepare(`
      INSERT INTO test_table (message) VALUES (?)
    `).bind(message).run()
    
    return c.json({
      success: true,
      message: '数据插入成功',
      data: {
        inserted_id: result.meta.last_row_id,
        changes: result.meta.changes,
        message: message
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('插入数据错误：', error)
    
    return c.json({
      success: false,
      message: '插入数据失败',
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

// 查询测试数据端点
app.get('/api/test-select', async (c) => {
  try {
    const results = await c.env.DB.prepare(`
      SELECT * FROM test_table ORDER BY created_at DESC LIMIT 10
    `).all()
    
    return c.json({
      success: true,
      message: '查询数据成功',
      data: results.results,
      count: results.results.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('查询数据错误：', error)
    
    return c.json({
      success: false,
      message: '查询数据失败',
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

export default app
