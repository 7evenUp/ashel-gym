export const WEEK_DAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вск"]

export const toDayKey = (value: number | Date) => {
  const date = value instanceof Date ? value : new Date(value)

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-")
}

export const getMonthLabel = (date: Date) => {
  return new Intl.DateTimeFormat("ru-RU", {
    month: "short",
    year: "numeric",
  }).format(date)
}

export const getReadableDateLabel = (date: Date) => {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

export const getMonthGrid = (date: Date) => {
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
  const weekdayIndex = (monthStart.getDay() + 6) % 7
  const gridStart = new Date(monthStart)

  gridStart.setDate(monthStart.getDate() - weekdayIndex)

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart)
    day.setDate(gridStart.getDate() + index)
    return day
  })
}

export const shiftMonth = (date: Date, amount: number) => {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

export const formatMuscleGroupName = (name: string) => {
  return name.charAt(0).toUpperCase() + name.slice(1)
}
