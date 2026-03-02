import { Tabs } from "expo-router"
import { Calendar, UserRound, Dumbbell } from "lucide-react-native"

import { md3Colors } from "@/constants/colors"

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: md3Colors.dark.primary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: md3Colors.dark.background,
          borderColor: md3Colors.dark.outlineVariant,
          paddingTop: 4,
        },
      }}
      initialRouteName="profile"
    >
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color }) => <Calendar color={color} size={24} />,
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: "Training",
          tabBarIcon: ({ color }) => <Dumbbell color={color} size={24} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <UserRound color={color} size={24} />,
        }}
      />
    </Tabs>
  )
}
