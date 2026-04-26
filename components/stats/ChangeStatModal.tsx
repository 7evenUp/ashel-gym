import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Modal, Pressable, StyleSheet, Text, View } from "react-native"
import { X } from "lucide-react-native"
import WheelPicker from "@quidone/react-native-wheel-picker"
import * as Haptics from "expo-haptics"

import { md3Colors } from "@/constants/colors"
import Button from "../Button"

const integerPart = [...Array(201).keys()].map((index) => ({
  value: index,
  label: index.toString(),
}))
const fractionalPart = [
  { value: 0, label: "00" },
  { value: 5, label: "05" },
  { value: 10, label: "10" },
  { value: 15, label: "15" },
  { value: 20, label: "20" },
  { value: 25, label: "25" },
  { value: 30, label: "30" },
  { value: 35, label: "35" },
  { value: 40, label: "40" },
  { value: 45, label: "45" },
  { value: 50, label: "50" },
  { value: 55, label: "55" },
  { value: 60, label: "60" },
  { value: 65, label: "65" },
  { value: 70, label: "70" },
  { value: 75, label: "75" },
  { value: 80, label: "80" },
  { value: 85, label: "85" },
  { value: 90, label: "90" },
  { value: 95, label: "95" },
]

const ChangeStatModal = ({
  isOpened,
  setIsOpened,
  value,
  setValue,
  onSaveClick,
}: {
  isOpened: boolean
  setIsOpened: Dispatch<SetStateAction<boolean>>
  value: string
  setValue: Dispatch<SetStateAction<string>>
  onSaveClick: VoidFunction
}) => {
  const [integer, setInteger] = useState(0)
  const [fraction, setFraction] = useState(0)

  const onCloseClick = () => {
    setIsOpened(false)
  }

  useEffect(() => {
    const [int, frac] = value.replace(",", ".").split(".")
    if (int) setInteger(parseInt(int))
    if (frac) setFraction(parseInt(frac))
  }, [value])

  return (
    <Modal
      animationType="fade"
      transparent
      visible={isOpened}
      onRequestClose={onCloseClick}
    >
      <View style={styles.modal}>
        <Pressable style={styles.backdrop} onPress={onCloseClick} />

        <View style={styles.modal_card}>
          <View style={styles.header}>
            <Text style={styles.title}>Changing progress</Text>
            <Pressable style={styles.close_button} onPress={onCloseClick}>
              <X color={md3Colors.dark.onSurface} size={20} />
            </Pressable>
          </View>

          <View style={styles.wheels_container}>
            <WheelPicker
              data={integerPart}
              value={integer}
              onValueChanged={({ item: { value } }) => {
                setInteger(value)
                setValue(`${value}.${fraction}`)
              }}
              enableScrollByTapOnItem={true}
              style={{ flex: 1 }}
              itemTextStyle={{
                color: md3Colors.dark.onSurface,
                fontWeight: 600,
                fontSize: 24,
              }}
              overlayItemStyle={{
                backgroundColor: md3Colors.dark.surfaceVariant,
                opacity: 0.5,
              }}
              onValueChanging={() => {
                Haptics.performAndroidHapticsAsync(
                  Haptics.AndroidHaptics.Keyboard_Tap,
                )
              }}
            />

            <Text style={styles.devider}>.</Text>

            <WheelPicker
              data={fractionalPart}
              value={fraction}
              onValueChanged={({ item: { value } }) => {
                setFraction(value)
                setValue(`${integer}.${value}`)
              }}
              enableScrollByTapOnItem={true}
              style={{ flex: 1 }}
              itemTextStyle={{
                color: md3Colors.dark.onSurface,
                fontWeight: 600,
                fontSize: 24,
              }}
              overlayItemStyle={{
                backgroundColor: md3Colors.dark.surfaceVariant,
                opacity: 0.5,
              }}
              onValueChanging={() => {
                Haptics.performAndroidHapticsAsync(
                  Haptics.AndroidHaptics.Keyboard_Tap,
                )
              }}
            />
          </View>

          <Button
            label="Save"
            onPress={() => {
              onSaveClick()
              onCloseClick()
            }}
            style={{ marginTop: 32 }}
          />
        </View>
      </View>
    </Modal>
  )
}

export default ChangeStatModal

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: md3Colors.dark.scrim,
    opacity: 0.55,
  },
  modal_card: {
    maxHeight: "72%",
    backgroundColor: md3Colors.dark.surfaceContainerHigh,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "500",
    color: md3Colors.dark.onSurface,
  },
  close_button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: md3Colors.dark.surfaceContainerHighest,
  },
  wheels_container: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    gap: 16,
  },
  devider: {
    fontWeight: 800,
    fontSize: 24,
    color: md3Colors.dark.onSurface,
  },
})
