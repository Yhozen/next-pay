import { getCallerInfo } from 'helpers/getCallerInfo'

const PAGES_FOLDER = 'pages'
const FOLDER_LENGTH = PAGES_FOLDER.length
export const getBasePath = () => {
  const { directoryPath } = getCallerInfo()

  console.log({ directoryPath })

  if (!directoryPath) return

  return directoryPath.substring(
    directoryPath.indexOf(PAGES_FOLDER) + FOLDER_LENGTH,
  )
}
