/**
 * Class decorator that is going to add a pre execution hook to every method
 * @param hook - Function that is going to be called before each class method execution.
 */
export function PreMethodsHook(hook: () => Promise<void>) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function <T extends Function>(constructor: T) {
    const properties = Object.getOwnPropertyNames(constructor.prototype)
    const filtered = properties.filter(property => {
      if (property === 'constructor') return false

      // This wil return true for functions, thus
      //  telling filter to keep this one.
      return typeof constructor.prototype[property] === 'function'
    })

    filtered.forEach(property => {
      const descriptor =
        Object.getOwnPropertyDescriptor(constructor.prototype, property) ?? {}

      const value = descriptor?.value

      descriptor.value = async (...args: unknown[]) => {
        await hook()

        return value.apply(constructor.prototype, args)
      }

      Object.defineProperty(constructor.prototype, property, descriptor)
    })
  }
}
