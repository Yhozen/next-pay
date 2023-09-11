import type { GetValueByName } from 'helpers/integration.helpers'

export type FintocIntegrationConfig = {
  accessToken: string | GetValueByName
  fintocLink: string | GetValueByName
}
