import { Service } from 'typedi'

export interface ILogger {
  log(...messages: unknown[]): void
  error(...messages: unknown[]): void
  warn(...messages: unknown[]): void
  info(...messages: unknown[]): void
}

@Service()
export class Logger implements ILogger {
  /**
   * Display in console
   */
  log(name: string, ...messages: unknown[]) {
    return console.log('\x1b[44m%s\x1b[0m', `${name}:`, ...messages)
  }
  error(name: string, ...messages: unknown[]) {
    return console.error('\x1b[44m%s\x1b[0m', `${name}:`, ...messages)
  }
  warn(name: string, ...messages: unknown[]) {
    return console.warn('\x1b[44m%s\x1b[0m', `${name}:`, ...messages)
  }
  info(name: string, ...messages: unknown[]) {
    return console.info('\x1b[44m%s\x1b[0m', `${name}:`, ...messages)
  }
}
