import { basename, dirname, join } from 'path'

export const getCallerInfo = (): {
  directoryPath: string | undefined
  fileName: string | undefined
} => {
  let errorStack = new Error().stack

  if (errorStack && process.platform === 'win32') {
    errorStack = errorStack.replace(/\\/g, '/')
  }

  const errorLine = errorStack
    ?.split('\n')
    .find(line => line.includes('/pages/api/'))
  const fileInfo = errorLine?.split(/:\d+:\d+/)

  if (!fileInfo?.length) {
    return { directoryPath: undefined, fileName: undefined }
  }

  const fileName = fileInfo[0]?.trim().split('/pages/api/')

  if (!fileName) return { directoryPath: undefined, fileName: undefined }

  const name = fileName[fileName.length - 1]

  if (!name) return { directoryPath: undefined, fileName: undefined }

  return {
    directoryPath: join('/pages/api', dirname(name)).replace(/\\/g, '/'),
    fileName: basename(name),
  }
}
