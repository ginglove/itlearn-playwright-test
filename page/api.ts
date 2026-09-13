import type { APIRequestContext } from '@playwright/test';

export class ApiPage {
  readonly url = 'https://training-car-sell-system.vercel.app/api/v1/catalog/models';

  constructor(private readonly request: APIRequestContext) {}

  async getModels(params?: Record<string, string>) {
    const response = await this.request.get(this.url, { params });
    const body = await response.json();
    const list = body.data ?? body;
    return { response, list };
  }
}
