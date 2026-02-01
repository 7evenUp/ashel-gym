import { Platform } from "react-native"

export const logger = (message: any, ...optionalParams: any[]) => {
  console.log(`=========== Log for ${Platform.OS} platform ===========`)
  console.log()
  console.log(message, ...optionalParams)
  console.log()
  console.log(`=============================================`)
}
