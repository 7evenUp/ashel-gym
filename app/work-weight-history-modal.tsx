import StatsHistoryModalContent from "@/components/stats/StatsHistoryModalContent"

const WorkWeightHistoryModal = () => {
  return (
    <StatsHistoryModalContent
      title="Work weight history"
      historyType="work"
      emptyStateText="Edit work weight to see the graph"
    />
  )
}

export default WorkWeightHistoryModal
