import axios, { AxiosInstance } from 'axios'
import type {
  Habit,
  GetHabitStatusResult,
  Log,
  Mood,
  Area,
  Note,
  Action,
  GetJournalParams,
  GetHabitStatusParams,
  UpdateHabitStatusParams,
  GetLogsParams,
  AddLogParamsFull,
  DeleteLogParams,
  DeleteLogsParamsFull,
  GetMoodsParams,
  GetMoodParams,
  CreateMoodParamsFull,
  UpdateMoodParamsFull,
  DeleteMoodParams,
  GetAreasParams,
  GetNotesParams,
  AddTextNoteParamsFull,
  AddImageNoteParamsFull,
  DeleteNoteParams,
  DeleteNotesParamsFull,
  GetActionsParams,
  GetActionParams,
  CreateActionParamsFull,
  UpdateActionParamsFull,
  DeleteActionParams,
} from './types.js'

export class HabitifyApiClient {
  private client: AxiosInstance

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('API key is required')
    }

    this.client = axios.create({
      baseURL: 'https://api.habitify.me',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
    })
  }

  // Journal methods
  async getJournal(params?: GetJournalParams): Promise<Habit[]> {
    const response = await this.client.get('/journal', { params })
    return response.data
  }

  // Habit methods
  async getHabitStatus(params: GetHabitStatusParams): Promise<GetHabitStatusResult> {
    const { habit_id, target_date } = params
    const queryParams = target_date ? { target_date } : undefined
    const response = await this.client.get(`/habits/${habit_id}/status`, { params: queryParams })
    return response.data
  }

  async updateHabitStatus(params: UpdateHabitStatusParams): Promise<void> {
    const { habit_id, ...updateData } = params
    const response = await this.client.put(`/habits/${habit_id}/status`, updateData)
    return response.data
  }

  // Log methods
  async getLogs(params: GetLogsParams): Promise<Log[]> {
    const { habit_id, ...queryParams } = params
    const response = await this.client.get(`/habits/${habit_id}/logs`, { params: queryParams })
    return response.data
  }

  async addLog(params: AddLogParamsFull): Promise<Log> {
    const { habit_id, ...logData } = params
    const response = await this.client.post(`/habits/${habit_id}/logs`, logData)
    return response.data
  }

  async deleteLog(params: DeleteLogParams): Promise<void> {
    const { habit_id, log_id } = params
    const response = await this.client.delete(`/habits/${habit_id}/logs/${log_id}`)
    return response.data
  }

  async deleteLogs(params: DeleteLogsParamsFull): Promise<void> {
    const { habit_id, ...queryParams } = params
    const url = `/habits/${habit_id}/logs`
    return this.client.delete(url, { params: queryParams }).then((res) => res.data)
  }

  // Mood methods
  async getMoods(params?: GetMoodsParams): Promise<Mood[]> {
    const response = await this.client.get('/moods', { params })
    return response.data
  }

  async getMood(params: GetMoodParams): Promise<Mood> {
    const { mood_id } = params
    const response = await this.client.get(`/moods/${mood_id}`)
    return response.data
  }

  async createMood(params: CreateMoodParamsFull): Promise<Mood> {
    const response = await this.client.post('/moods', params)
    return response.data
  }

  async updateMood(params: UpdateMoodParamsFull): Promise<Mood> {
    const { mood_id, ...updateData } = params
    const response = await this.client.put(`/moods/${mood_id}`, updateData)
    return response.data
  }

  async deleteMood(params: DeleteMoodParams): Promise<void> {
    const { mood_id } = params
    const response = await this.client.delete(`/moods/${mood_id}`)
    return response.data
  }

  // Area methods
  async getAreas(params?: GetAreasParams): Promise<Area[]> {
    const response = await this.client.get('/areas', { params })
    return response.data
  }

  // Note methods
  async getNotes(params: GetNotesParams): Promise<Note[]> {
    const { habit_id, ...queryParams } = params
    const response = await this.client.get(`/habits/${habit_id}/notes`, { params: queryParams })
    return response.data
  }

  async addTextNote(params: AddTextNoteParamsFull): Promise<Note> {
    const { habit_id, ...noteData } = params
    const response = await this.client.post(`/habits/${habit_id}/notes`, noteData)
    return response.data
  }

  async addImageNote(params: AddImageNoteParamsFull): Promise<Note> {
    const { habit_id, image, created_at } = params
    const formData = new FormData()
    formData.append('image', image)
    formData.append('created_at', created_at)

    const response = await this.client.post(`/habits/${habit_id}/notes`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async deleteNote(params: DeleteNoteParams): Promise<void> {
    const { habit_id, note_id } = params
    const response = await this.client.delete(`/habits/${habit_id}/notes/${note_id}`)
    return response.data
  }

  async deleteNotes(params: DeleteNotesParamsFull): Promise<void> {
    const { habit_id, ...queryParams } = params
    const url = `/habits/${habit_id}/notes`
    return this.client.delete(url, { params: queryParams }).then((res) => res.data)
  }

  // Action methods
  async getActions(params: GetActionsParams): Promise<Action[]> {
    const { habit_id } = params
    const response = await this.client.get(`/habits/${habit_id}/actions`)
    return response.data
  }

  async getAction(params: GetActionParams): Promise<Action> {
    const { habit_id, action_id } = params
    const response = await this.client.get(`/habits/${habit_id}/actions/${action_id}`)
    return response.data
  }

  async createAction(params: CreateActionParamsFull): Promise<Action> {
    const { habit_id, ...actionData } = params
    const response = await this.client.post(`/habits/${habit_id}/actions`, actionData)
    return response.data
  }

  async updateAction(params: UpdateActionParamsFull): Promise<Action> {
    const { habit_id, action_id, ...updateData } = params
    const response = await this.client.put(`/habits/${habit_id}/actions/${action_id}`, updateData)
    return response.data
  }

  async deleteAction(params: DeleteActionParams): Promise<void> {
    const { habit_id, action_id } = params
    const response = await this.client.delete(`/habits/${habit_id}/actions/${action_id}`)
    return response.data
  }
}
