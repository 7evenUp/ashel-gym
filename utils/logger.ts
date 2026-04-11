import { Platform } from "react-native"

export const logger = (message: unknown, ...optionalParams: unknown[]) => {
  if (!__DEV__) return

  console.log(`=========== Log for ${Platform.OS} platform ===========`)
  console.log()
  console.log(message, ...optionalParams)
  console.log()
  console.log(`=============================================`)
}
