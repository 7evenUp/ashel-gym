import StatsHistoryModalContent from "@/components/stats/StatsHistoryModalContent"

const MaxWeightHistoryModal = () => {
  return (
    <StatsHistoryModalContent
      title="Max weight history"
      historyType="max"
      emptyStateText="Edit max weight to see the graph"
    />
  )
}

export default MaxWeightHistoryModal
