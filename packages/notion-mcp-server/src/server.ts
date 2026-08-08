import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import axios, { AxiosInstance } from 'axios'
import dotenv from 'dotenv'
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js'

dotenv.config()

export const envSchema = z.object({
  NOTION_API_TOKEN: z.string(),
})

export const mcpServer = new McpServer(
  {
    name: '@sargonpiraev/notion-mcp-server',
    version: '1',
  },
  {
    instructions: ``,
    capabilities: {
      tools: {},
      logging: {},
    },
  }
)

export const env = envSchema.parse(process.env)

export const apiClient: AxiosInstance = axios.create({
  baseURL: 'https://api.notion.com',
  headers: {
    Accept: 'application/json',
  },
  timeout: 30000,
})

apiClient.interceptors.request.use(
  (config) => {
    if (env.NOTION_API_TOKEN) {
      config.headers['Authorization'] = env.NOTION_API_TOKEN
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

function handleResult(data: unknown): CallToolResult {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
    ],
  }
}

function handleError(error: unknown): CallToolResult {
  console.error(error)

  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message
    return {
      isError: true,
      content: [{ type: 'text', text: `API Error: ${message}` }],
    } as CallToolResult
  }

  return {
    isError: true,
    content: [{ type: 'text', text: `Error: ${error}` }],
  } as CallToolResult
}

// Register tools
mcpServer.tool(
  'get-user',
  `Retrieve a user`,
  {
    userId: z.string(),
  },
  async (args, extra) => {
    try {
      const { userId, ...otherParams } = args
      const url = `/v1/users/${userId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('userId' in mappedParams) {
        mappedParams['user_id'] = mappedParams['userId']
        delete mappedParams['userId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-users',
  `List all users`,
  {
    startCursor: z.string().optional(),
    pageSize: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('startCursor' in mappedParams) {
        mappedParams['start_cursor'] = mappedParams['startCursor']
        delete mappedParams['startCursor']
      }
      if ('pageSize' in mappedParams) {
        mappedParams['page_size'] = mappedParams['pageSize']
        delete mappedParams['pageSize']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/v1/users',
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool('get-self', `Retrieve your token&#x27;s bot user`, {}, async (args, extra) => {
  try {
    const otherParams = args

    // Map camelCase to original parameter names for API request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedParams: any = { ...otherParams }

    // Extract authorization token from HTTP request headers
    const authorization = extra?.requestInfo?.headers?.authorization as string
    const bearer = authorization?.replace('Bearer ', '')

    const response = await apiClient.request({
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
      method: 'GET',
      url: '/v1/users/me',
      params: mappedParams,
    })

    return handleResult(response.data)
  } catch (error) {
    return handleError(error)
  }
})

mcpServer.tool(
  'post-database-query',
  `Query a database`,
  {
    databaseId: z.string(),
    filterProperties: z.string().optional(),
    filter: z.any().optional(),
    sorts: z.any().optional(),
    startCursor: z.any().optional(),
    pageSize: z.any().optional(),
    archived: z.any().optional(),
    inTrash: z.any().optional(),
  },
  async (args, extra) => {
    try {
      const { databaseId, ...otherParams } = args
      const url = `/v1/databases/${databaseId}/query`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('databaseId' in mappedParams) {
        mappedParams['database_id'] = mappedParams['databaseId']
        delete mappedParams['databaseId']
      }
      if ('filterProperties' in mappedParams) {
        mappedParams['filter_properties'] = mappedParams['filterProperties']
        delete mappedParams['filterProperties']
      }
      if ('startCursor' in mappedParams) {
        mappedParams['start_cursor'] = mappedParams['startCursor']
        delete mappedParams['startCursor']
      }
      if ('pageSize' in mappedParams) {
        mappedParams['page_size'] = mappedParams['pageSize']
        delete mappedParams['pageSize']
      }
      if ('inTrash' in mappedParams) {
        mappedParams['in_trash'] = mappedParams['inTrash']
        delete mappedParams['inTrash']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: url,
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'post-search',
  `Search by title`,
  {
    query: z.any().optional(),
    sort: z.any().optional(),
    filter: z.any().optional(),
    startCursor: z.any().optional(),
    pageSize: z.any().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('startCursor' in mappedParams) {
        mappedParams['start_cursor'] = mappedParams['startCursor']
        delete mappedParams['startCursor']
      }
      if ('pageSize' in mappedParams) {
        mappedParams['page_size'] = mappedParams['pageSize']
        delete mappedParams['pageSize']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: '/v1/search',
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'get-block-children',
  `Retrieve block children`,
  {
    blockId: z.string(),
    startCursor: z.string().optional(),
    pageSize: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { blockId, ...otherParams } = args
      const url = `/v1/blocks/${blockId}/children`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('blockId' in mappedParams) {
        mappedParams['block_id'] = mappedParams['blockId']
        delete mappedParams['blockId']
      }
      if ('startCursor' in mappedParams) {
        mappedParams['start_cursor'] = mappedParams['startCursor']
        delete mappedParams['startCursor']
      }
      if ('pageSize' in mappedParams) {
        mappedParams['page_size'] = mappedParams['pageSize']
        delete mappedParams['pageSize']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'patch-block-children',
  `Append block children`,
  {
    blockId: z.string(),
    children: z.any(),
    after: z.any().optional(),
  },
  async (args, extra) => {
    try {
      const { blockId, ...otherParams } = args
      const url = `/v1/blocks/${blockId}/children`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('blockId' in mappedParams) {
        mappedParams['block_id'] = mappedParams['blockId']
        delete mappedParams['blockId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PATCH',
        url: url,
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'retrieve-a-block',
  `Retrieve a block`,
  {
    blockId: z.string(),
  },
  async (args, extra) => {
    try {
      const { blockId, ...otherParams } = args
      const url = `/v1/blocks/${blockId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('blockId' in mappedParams) {
        mappedParams['block_id'] = mappedParams['blockId']
        delete mappedParams['blockId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'update-a-block',
  `Update a block`,
  {
    blockId: z.string(),
    type: z.any().optional(),
    archived: z.any().optional(),
  },
  async (args, extra) => {
    try {
      const { blockId, ...otherParams } = args
      const url = `/v1/blocks/${blockId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('blockId' in mappedParams) {
        mappedParams['block_id'] = mappedParams['blockId']
        delete mappedParams['blockId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PATCH',
        url: url,
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'delete-a-block',
  `Delete a block`,
  {
    blockId: z.string(),
  },
  async (args, extra) => {
    try {
      const { blockId, ...otherParams } = args
      const url = `/v1/blocks/${blockId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('blockId' in mappedParams) {
        mappedParams['block_id'] = mappedParams['blockId']
        delete mappedParams['blockId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'DELETE',
        url: url,
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'retrieve-a-page',
  `Retrieve a page`,
  {
    pageId: z.string(),
    filterProperties: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { pageId, ...otherParams } = args
      const url = `/v1/pages/${pageId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('pageId' in mappedParams) {
        mappedParams['page_id'] = mappedParams['pageId']
        delete mappedParams['pageId']
      }
      if ('filterProperties' in mappedParams) {
        mappedParams['filter_properties'] = mappedParams['filterProperties']
        delete mappedParams['filterProperties']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'patch-page',
  `Update page properties`,
  {
    pageId: z.string(),
    properties: z.any().optional(),
    inTrash: z.any().optional(),
    archived: z.any().optional(),
    icon: z.any().optional(),
    cover: z.any().optional(),
  },
  async (args, extra) => {
    try {
      const { pageId, ...otherParams } = args
      const url = `/v1/pages/${pageId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('pageId' in mappedParams) {
        mappedParams['page_id'] = mappedParams['pageId']
        delete mappedParams['pageId']
      }
      if ('inTrash' in mappedParams) {
        mappedParams['in_trash'] = mappedParams['inTrash']
        delete mappedParams['inTrash']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PATCH',
        url: url,
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'post-page',
  `Create a page`,
  {
    parent: z.any(),
    properties: z.any(),
    children: z.any().optional(),
    icon: z.any().optional(),
    cover: z.any().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: '/v1/pages',
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'create-a-database',
  `Create a database`,
  {
    parent: z.any(),
    properties: z.any(),
    title: z.any().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: '/v1/databases',
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'update-a-database',
  `Update a database`,
  {
    databaseId: z.string(),
    title: z.any().optional(),
    description: z.any().optional(),
    properties: z.any().optional(),
  },
  async (args, extra) => {
    try {
      const { databaseId, ...otherParams } = args
      const url = `/v1/databases/${databaseId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('databaseId' in mappedParams) {
        mappedParams['database_id'] = mappedParams['databaseId']
        delete mappedParams['databaseId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'PATCH',
        url: url,
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'retrieve-a-database',
  `Retrieve a database`,
  {
    databaseId: z.string(),
  },
  async (args, extra) => {
    try {
      const { databaseId, ...otherParams } = args
      const url = `/v1/databases/${databaseId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('databaseId' in mappedParams) {
        mappedParams['database_id'] = mappedParams['databaseId']
        delete mappedParams['databaseId']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'retrieve-a-page-property',
  `Retrieve a page property item`,
  {
    pageId: z.string(),
    propertyId: z.string(),
    pageSize: z.string().optional(),
    startCursor: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const { pageId, propertyId, ...otherParams } = args
      const url = `/v1/pages/${pageId}/properties/${propertyId}`

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('pageId' in mappedParams) {
        mappedParams['page_id'] = mappedParams['pageId']
        delete mappedParams['pageId']
      }
      if ('propertyId' in mappedParams) {
        mappedParams['property_id'] = mappedParams['propertyId']
        delete mappedParams['propertyId']
      }
      if ('pageSize' in mappedParams) {
        mappedParams['page_size'] = mappedParams['pageSize']
        delete mappedParams['pageSize']
      }
      if ('startCursor' in mappedParams) {
        mappedParams['start_cursor'] = mappedParams['startCursor']
        delete mappedParams['startCursor']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: url,
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'retrieve-a-comment',
  `Retrieve comments`,
  {
    blockId: z.string(),
    startCursor: z.string().optional(),
    pageSize: z.string().optional(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = { ...otherParams }
      if ('blockId' in mappedParams) {
        mappedParams['block_id'] = mappedParams['blockId']
        delete mappedParams['blockId']
      }
      if ('startCursor' in mappedParams) {
        mappedParams['start_cursor'] = mappedParams['startCursor']
        delete mappedParams['startCursor']
      }
      if ('pageSize' in mappedParams) {
        mappedParams['page_size'] = mappedParams['pageSize']
        delete mappedParams['pageSize']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'GET',
        url: '/v1/comments',
        params: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)

mcpServer.tool(
  'create-a-comment',
  `Create comment`,
  {
    parent: z.any(),
    richText: z.any(),
  },
  async (args, extra) => {
    try {
      const otherParams = args

      // Map camelCase to original parameter names for API request
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedParams: any = (args as any).requestData || { ...otherParams }
      if ('richText' in mappedParams) {
        mappedParams['rich_text'] = mappedParams['richText']
        delete mappedParams['richText']
      }

      // Extract authorization token from HTTP request headers
      const authorization = extra?.requestInfo?.headers?.authorization as string
      const bearer = authorization?.replace('Bearer ', '')

      const response = await apiClient.request({
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
        method: 'POST',
        url: '/v1/comments',
        data: mappedParams,
      })

      return handleResult(response.data)
    } catch (error) {
      return handleError(error)
    }
  }
)
