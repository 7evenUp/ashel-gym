import { Tabs } from "expo-router"
import { Calendar, UserRound, Dumbbell } from "lucide-react-native"

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#b861c8",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#211e27",
          borderColor: "#383342",
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
