import { Tabs } from "expo-router"
import { Calendar, UserRound, Dumbbell } from "lucide-react-native"

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#ffd33d",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#25292e",
          borderColor: "#55595e",
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
