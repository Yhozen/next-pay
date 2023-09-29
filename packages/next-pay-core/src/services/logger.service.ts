import { Service } from 'typedi'

export interface ILogger {
  log(...messages: unknown[]): void
  error(...messages: unknown[]): void
  warn(...messages: unknown[]): void
  info(...messages: unknown[]): void
}

@Service()
export class Logger implements ILogger {
  name = 'not_specified'
  setName(name: string) {
    this.name = name
  }
  /**
   * Display in console
   */
  log = (...messages: unknown[]) => {
    return console.log('\x1b[44m%s\x1b[0m', `${this.name}:`, ...messages)
  }
  error = (...messages: unknown[]) => {
    return console.error('\x1b[44m%s\x1b[0m', `${this.name}:`, ...messages)
  }
  warn = (...messages: unknown[]) => {
    return console.warn('\x1b[44m%s\x1b[0m', `${this.name}:`, ...messages)
  }
  info = (...messages: unknown[]) => {
    return console.info('\x1b[44m%s\x1b[0m', `${this.name}:`, ...messages)
  }
}
