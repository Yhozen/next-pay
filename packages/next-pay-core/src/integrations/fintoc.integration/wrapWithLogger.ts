import { ILogger } from 'services/logger.service'

type AnyFunction<Args extends any[] = any[], Ret = any> = (...args: Args) => Ret

export const wrapWithLogger = <Args extends any[] = any[], Ret = any>(
  logger: ILogger,
  fn: AnyFunction<Args, Ret>,
) => {
  return async (...args: Args) => {
    try {
      const result = await fn(...args)
      return result
    } catch (error) {
      logger.error(error, (error as { message: string })?.message)
      throw error
    }
  }
}
