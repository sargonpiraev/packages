# Habitify API Client

> Home: [`sargonpiraev/packages`](https://github.com/sargonpiraev/packages) → `packages/habitify-api-client`

![npm version](https://img.shields.io/npm/v/@sargonpiraev/habitify-api-client)
![npm downloads](https://img.shields.io/npm/dw/@sargonpiraev/habitify-api-client)
![license](https://img.shields.io/github/license/sargonpiraev/packages)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)

A TypeScript client for the Habitify API with complete type safety and modern developer experience.

## Features

- 🔥 **TypeScript first** - Full type safety with comprehensive type definitions
- 🚀 **Modern SDK** - Built with axios and modern JavaScript patterns
- 📝 **Complete API coverage** - All Habitify API endpoints supported
- 🛡️ **Built-in validation** - Request/response validation with meaningful errors
- 🎯 **Tree-shakeable** - Import only what you need for optimal bundle size
- 📚 **Well documented** - JSDoc comments and comprehensive examples

## Installation

```bash
npm install @sargonpiraev/habitify-api-client
```

## Get Your Credentials

Before using the client, you'll need a Habitify API key:

1. Open Habitify app on your mobile device
2. Go to Settings → Account → API
3. Generate new API key
4. Save API key for use in your application

## Requirements

- Node.js >= v18.0.0
- Habitify API key
- npm >= 8.0.0

## Quick Start

```typescript
import { HabitifyApiClient } from '@sargonpiraev/habitify-api-client'

// Create client with API key
const client = new HabitifyApiClient('your-api-key')

// Get today's habits
const habits = await client.getJournal()

// Update habit status
await client.updateHabitStatus({
  habit_id: 'habit-123',
  status: 'completed',
  target_date: '2025-01-15',
})

// Add a workout log
await client.addLog({
  habit_id: 'habit-456',
  unit_type: 'rep',
  value: 50,
  target_date: '2025-01-15',
})

console.log(`Found ${habits.length} habits for today`)
```

## Configuration

### Basic Configuration

```typescript
const client = new HabitifyApiClient('your-api-key')
```

### Advanced Configuration

```typescript
// The client uses sensible defaults but can be customized
const client = new HabitifyApiClient('your-api-key')

// Custom timeout and base URL are handled internally
// Default timeout: 30 seconds
// Default base URL: https://api.habitify.me
```

## Usage Examples

### Journal Operations

```typescript
// Get habits for today
const todayHabits = await client.getJournal()

// Get habits for specific date
const dateHabits = await client.getJournal({
  target_date: '2025-01-15',
  order_by: 'priority',
})

// Get habit status
const status = await client.getHabitStatus({
  habit_id: 'habit-123',
  target_date: '2025-01-15',
})

// Update habit status
await client.updateHabitStatus({
  habit_id: 'habit-123',
  status: 'completed',
})
```

### Log Management

```typescript
// Get logs for a habit
const logs = await client.getLogs({
  habit_id: 'habit-123',
  from: '2025-01-01',
  to: '2025-01-31',
})

// Add new log entry
await client.addLog({
  habit_id: 'habit-123',
  unit_type: 'min',
  value: 30,
  target_date: '2025-01-15',
})

// Delete specific log
await client.deleteLog({
  habit_id: 'habit-123',
  log_id: 'log-456',
})
```

### Mood Tracking

```typescript
// Get mood entries
const moods = await client.getMoods({
  target_date: '2025-01-15',
})

// Create mood entry
await client.createMood({
  value: 4, // 1-5 scale
  created_at: new Date().toISOString(),
})

// Update mood
await client.updateMood({
  mood_id: 'mood-123',
  value: 5,
  created_at: new Date().toISOString(),
})
```

### Raw HTTP Methods

```typescript
// For maximum flexibility, use raw HTTP methods
const customData = await client.get('/custom-endpoint', { param1: 'value' })
await client.post('/custom-endpoint', { data: 'value' })
await client.put('/custom-endpoint', { data: 'value' })
await client.delete('/custom-endpoint')
```

## API Reference

All methods return promises and include comprehensive error handling.

### Constructor

- `new HabitifyApiClient(apiKey: string)` - Create client instance

### Journal Methods

- `getJournal(params?)` - Get habits for a date with optional filtering
- `getHabitStatus(params)` - Get habit status for specific date
- `updateHabitStatus(params)` - Update habit completion status

### Log Methods

- `getLogs(params)` - Get logs for habit with date range
- `addLog(params)` - Add new log entry with value and unit
- `deleteLog(params)` - Delete specific log by ID
- `deleteLogs(params)` - Delete logs within date range

### Mood Methods

- `getMoods(params?)` - Get mood entries with optional date filter
- `getMood(params)` - Get specific mood by ID
- `createMood(params)` - Create new mood entry
- `updateMood(params)` - Update existing mood
- `deleteMood(params)` - Delete mood entry

### Utility Methods

- `getAreas()` - Get all habit areas/categories

See the [Habitify API documentation](https://habitify.me/api) for complete endpoint reference.

## Error Handling

```typescript
try {
  const habits = await client.getJournal()
} catch (error) {
  if (error.response?.status === 401) {
    console.error('Invalid API key')
  } else if (error.response?.status === 429) {
    console.error('Rate limit exceeded')
  } else {
    console.error('API error:', error.message)
  }
}
```

## Roadmap

**Coming Soon** 🚀

- [ ] **Enhanced Type Safety**: Additional validation and type guards
- [ ] **Response Caching**: Intelligent caching for frequently accessed data
- [ ] **Batch Operations**: Support for bulk API operations
- [ ] **Rate Limiting**: Built-in rate limiting and retry logic
- [ ] **Offline Support**: Offline-first capabilities with sync
- [ ] **React Hooks**: React hooks package for easier integration

**Completed** ✅

- [x] **Full API Coverage**: Complete Habitify API integration
- [x] **Type Safety**: Comprehensive TypeScript types
- [x] **Error Handling**: Structured error management
- [x] **Tree Shaking**: Optimized bundle size with selective imports

**Community Requests** 💭

Have an idea for Habitify API Client? [Open an issue](https://gitlab.com/sargonpiraev/habitify-api-client/issues) or contribute to our roadmap!

## Perfect for Building

- **MCP Servers** - integrate with Claude and other AI tools
- **Automation Scripts** - sync habits with other productivity services
- **Analytics Tools** - analyze your habit data and progress
- **Mobile Apps** - build custom habit tracking applications
- **Web Dashboards** - visualize your habit progress and insights

## MCP Server Integration

This client is designed specifically for building MCP (Model Context Protocol) servers:

```typescript
// Example MCP server integration
import { HabitifyApiClient } from '@sargonpiraev/habitify-api-client'

const habitify = new HabitifyApiClient(process.env.HABITIFY_API_KEY)

// Use in your MCP server tools
async function getHabitsForAI() {
  const habits = await habitify.getJournal()
  return habits.map((h) => `${h.name}: ${h.status || 'not started'}`)
}
```

## Support This Project

Hi! I'm [Sargon Piraev](https://sargonpiraev.com), a software engineer passionate about API integrations and developer tools. I create open-source API clients to help developers integrate with their favorite services more easily.

Your support helps me continue developing and maintaining these tools, and motivates me to create new integrations that make developer workflows even more efficient! 🚀

[![Support on Boosty](https://img.shields.io/badge/Support-Boosty-orange?logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K)](https://boosty.to/sargonpiraev)

## Connect with Author

- 🌐 Visit [sargonpiraev.com](https://sargonpiraev.com)
- 📧 Email: [sargonpiraev@gmail.com](mailto:sargonpiraev@gmail.com)
- 💬 Join [Discord](https://discord.gg/ZsWGxRGj)
