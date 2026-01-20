import { NativeTabs, Label, Icon } from "expo-router/unstable-native-tabs"

export default function TabLayout() {
  return (
    <NativeTabs backgroundColor="#161a1f">
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon src={require("../../assets/icons/home.png")} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="sessions">
        <Label>Sessions</Label>
        <Icon src={require("../../assets/icons/dumbbell.png")} />
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
