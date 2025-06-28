import { useState } from 'react'

// API 响应类型定义
interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
  timestamp: string
  count?: number
}

interface TestResult {
  test_result: { test: number }
  timestamp: string
  database_name: string
}

interface InsertResult {
  inserted_id: number
  changes: number
  message: string
}

interface TestRecord {
  id: number
  message: string
  created_at: string
}

// API 基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787'

/**
 * 数据库测试相关的 API Hook
 * 提供数据库连接测试、表创建、数据插入和查询功能
 */
export const useDbTestApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 通用 API 调用函数
  const apiCall = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      const data: ApiResponse<T> = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '请求失败'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 测试数据库连接
  const testConnection = async (): Promise<ApiResponse<TestResult>> => {
    return apiCall<TestResult>('/api/test-db')
  }

  // 创建测试表
  const createTestTable = async (): Promise<ApiResponse> => {
    return apiCall('/api/init-test-table', {
      method: 'POST',
    })
  }

  // 插入测试数据
  const insertTestData = async (message = '测试消息'): Promise<ApiResponse<InsertResult>> => {
    return apiCall<InsertResult>('/api/test-insert', {
      method: 'POST',
      body: JSON.stringify({ message }),
    })
  }

  // 查询测试数据
  const getTestData = async (): Promise<ApiResponse<TestRecord[]>> => {
    return apiCall<TestRecord[]>('/api/test-select')
  }

  return {
    loading,
    error,
    testConnection,
    createTestTable,
    insertTestData,
    getTestData,
  }
}

export type { ApiResponse, TestResult, InsertResult, TestRecord }
