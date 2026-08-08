import { client } from './generated/client.gen.js'
import * as sdk from './generated/sdk.gen.js'

export interface Config {
  userAgent: string
}

export class HhApiClient {
  private client: typeof client

  constructor(config: Config) {
    this.client = client
    this.client.setConfig({
      headers: { 'User-Agent': config.userAgent },
    })
  }

  sdk = sdk
}
