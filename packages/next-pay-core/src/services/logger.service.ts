import { Service } from 'typedi'

@Service()
export class Logger {
  /**
   * Display in console
   */
  log(name: string, ...messages: unknown[]) {
    return console.log('\x1b[44m%s\x1b[0m', `${name}:`, ...messages)
  }
}
