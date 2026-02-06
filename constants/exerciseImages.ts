export const exerciseImages: Record<
  "back" | "chest" | "biceps" | "triceps" | "legs" | "shoulders",
  any
> = {
  back: {
    deadlift: require("../assets/images/exercises/back/deadlift.png"),
  },
  chest: {
    bench_press: require("../assets/images/exercises/chest/bench_press.png"),
  },
  biceps: {
    barbell_curl: require("../assets/images/exercises/biceps/barbell_curl.png"),
    dumbbell_curl: require("../assets/images/exercises/biceps/dumbbell_curl.png"),
    dumbbell_incline_curl: require("../assets/images/exercises/biceps/dumbbell_incline_curl.png"),
    dumbbell_preacher_curl: require("../assets/images/exercises/biceps/dumbbell_preacher_curl.png"),
    faceaway_bayesian_cable_curl: require("../assets/images/exercises/biceps/faceaway_bayesian_cable_curl.png"),
    hammer_preacher_curl: require("../assets/images/exercises/biceps/hammer_preacher_curl.png"),
    machine_preacher_curl: require("../assets/images/exercises/biceps/machine_preacher_curl.png"),
  },

  triceps: {},
  shoulders: {},
  legs: {},
}
