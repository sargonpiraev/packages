import assert from 'assert'
import { HabitifyApiClient } from '../src/HabitifyApiClient.js'
import dotenv from 'dotenv'

dotenv.config()

const habitifyApiClient = new HabitifyApiClient(process.env.HABITIFY_API_KEY || '')

console.log(await habitifyApiClient.getAreas())

console.log(
  await habitifyApiClient
    .getJournal({
      target_date: '2025-07-01T00:00:00+00:00',
    })
    .catch((x) => console.error(x.response.data))
)
