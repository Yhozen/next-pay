type GetValueByName = (name?: string) => string | Promise<string>

export type FintocIntegrationConfig = {
  accessToken: string | GetValueByName
  fintocLink: string | GetValueByName
}
