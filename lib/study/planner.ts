import {
  addDays,
  dateFromKey,
  daysBetween,
  PRACTICAL_PREFIX,
  REVIEW_PREFIX,
  SIMULATION_PREFIX,
  type SessionKind,
} from "./sessions";

// Builds a study calendar from the exam date, the weekly time available and
// the chosen topics. Pure and deterministic: same input, same plan.

/** A new topic is reviewed this many days after studying it. */
export const REVIEW_OFFSETS = [3, 7, 14, 30];

/** Share of the time left reserved for the first pass through the syllabus. */
const FIRST_PASS_SHARE = 0.75;
const DEFAULT_MAX_WEEKS = 40;
const STUDIED_REVIEW_EVERY_DAYS = 14;
const dayNames = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export type PlanTopic = {
  baseTopicId: string;
  userTopicId: string | null;
  number: number | null;
  title: string;
  studied: boolean;
  priority: "low" | "medium" | "high";
  mastery: "low" | "medium" | "high";
  /** Day the topic was studied in the calendar, when known. */
  studiedOnKey?: string | null;
  /** Reviews already completed since that day. */
  reviewsDone?: number;
};

/** Time already taken by sessions the plan must leave alone. */
export type PlanBusySlot = {
  dateKey: string;
  minutes: number;
};

export type PlanPractical = {
  id: string;
  name: string;
  status: "not_started" | "worked" | "mastered";
};

export type PlanInput = {
  todayKey: string;
  examDateKey: string | null;
  availableDays: string[];
  weeklyHours: number;
  topicMinutes: number;
  practicalMinutes: number;
  /** Only the topics the user has chosen to prepare. */
  topics: PlanTopic[];
  practicals: PlanPractical[];
  /** Completed and hand-written sessions from today on: the plan fits around them. */
  busy?: PlanBusySlot[];
  maxWeeks?: number;
};

export type PlannedTask = {
  kind: SessionKind;
  title: string;
  description: string;
  task_date: string;
  task_type: "study_topic" | "practical";
  estimated_duration_minutes: number;
  base_topic_id: string | null;
  user_topic_id: string | null;
  user_practical_id: string | null;
};

export type PlanSummary = {
  sessions: number;
  newTopics: number;
  reviews: number;
  practicals: number;
  simulations: number;
  firstDateKey: string | null;
  lastDateKey: string | null;
  /** Day the last new topic is studied within this plan. */
  firstPassEndKey: string | null;
  newTopicsPerWeek: number;
  /** New topics that do not fit in the calendar generated now. */
  topicsLeftForLater: number;
  /** False when the pace needed to finish before the exam exceeds the time given. */
  reachesExam: boolean;
  /** Weekly hours that would be needed to finish the first pass in time. */
  hoursPerWeekNeeded: number | null;
  reason: "ok" | "no-topics" | "no-days" | "exam-passed";
};

export type PlanResult = {
  tasks: PlannedTask[];
  summary: PlanSummary;
};

const priorityOrder = { high: 0, medium: 1, low: 2 };
const kindOrder: Record<SessionKind, number> = {
  study: 0,
  review: 1,
  practical: 2,
  simulation: 3,
  rest: 4,
};

function shorten(text: string, max = 90) {
  const clean = text.trim().replace(/\s+/g, " ");

  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

function topicLabel(topic: PlanTopic) {
  return topic.number === null ? shorten(topic.title, 60) : `Tema ${topic.number}`;
}

function emptyResult(reason: PlanSummary["reason"]): PlanResult {
  return {
    tasks: [],
    summary: {
      sessions: 0,
      newTopics: 0,
      reviews: 0,
      practicals: 0,
      simulations: 0,
      firstDateKey: null,
      lastDateKey: null,
      firstPassEndKey: null,
      newTopicsPerWeek: 0,
      topicsLeftForLater: 0,
      reachesExam: true,
      hoursPerWeekNeeded: null,
      reason,
    },
  };
}

export function generateStudyPlan(input: PlanInput): PlanResult {
  const { todayKey } = input;
  const availableDays = input.availableDays.filter((day) => dayNames.includes(day));
  const topicMinutes = Math.max(15, Math.round(input.topicMinutes));
  const practicalMinutes = Math.max(15, Math.round(input.practicalMinutes));
  const reviewMinutes = Math.max(20, Math.round(topicMinutes / 2));
  const simulationMinutes = Math.min(120, Math.max(60, topicMinutes));
  const weeklyMinutes = Math.max(30, Math.round(input.weeklyHours * 60));

  if (input.topics.length === 0 && input.practicals.length === 0) {
    return emptyResult("no-topics");
  }

  if (availableDays.length === 0) {
    return emptyResult("no-days");
  }

  // The day before the exam is the last study day.
  const examEndKey = input.examDateKey ? addDays(input.examDateKey, -1) : null;

  if (examEndKey && examEndKey < todayKey) {
    return emptyResult("exam-passed");
  }

  const horizonKey = addDays(todayKey, (input.maxWeeks ?? DEFAULT_MAX_WEEKS) * 7 - 1);
  const endKey = examEndKey && examEndKey < horizonKey ? examEndKey : horizonKey;

  const days: string[] = [];

  for (let key = todayKey; key <= endKey; key = addDays(key, 1)) {
    if (availableDays.includes(dayNames[dateFromKey(key).getDay()])) {
      days.push(key);
    }
  }

  if (days.length === 0) {
    return emptyResult("no-days");
  }

  const dayCapacity = Math.max(30, Math.round(weeklyMinutes / availableDays.length));
  const remaining = new Map(days.map((key) => [key, dayCapacity]));
  const used = new Map(days.map((key) => [key, 0]));
  const tasks: PlannedTask[] = [];

  for (const slot of input.busy ?? []) {
    if (remaining.has(slot.dateKey)) {
      remaining.set(slot.dateKey, (remaining.get(slot.dateKey) ?? 0) - Math.max(0, slot.minutes));
      used.set(slot.dateKey, (used.get(slot.dateKey) ?? 0) + 1);
    }
  }

  // Weeks run Monday to Sunday, counted from the week of today.
  const today = dateFromKey(todayKey);
  const firstMondayKey = addDays(todayKey, -((today.getDay() + 6) % 7));
  const weekOf = (key: string) => Math.floor(daysBetween(firstMondayKey, key) / 7);
  const daysByWeek = new Map<number, string[]>();

  for (const key of days) {
    const week = weekOf(key);
    daysByWeek.set(week, [...(daysByWeek.get(week) ?? []), key]);
  }

  // A session fits when there is time left, or when the day is still empty:
  // a day too short for a whole topic must not block the plan forever.
  const fits = (key: string, minutes: number) =>
    (remaining.get(key) ?? 0) >= minutes || used.get(key) === 0;

  const place = (key: string, task: Omit<PlannedTask, "task_date">) => {
    remaining.set(key, (remaining.get(key) ?? 0) - task.estimated_duration_minutes);
    used.set(key, (used.get(key) ?? 0) + 1);
    tasks.push({ ...task, task_date: key });
  };

  const firstFit = (fromKey: string, minutes: number) =>
    days.find((key) => key >= fromKey && fits(key, minutes)) ?? null;

  const reviewTask = (topic: PlanTopic, description: string) => ({
    kind: "review" as const,
    title: `${REVIEW_PREFIX}${topicLabel(topic)}`,
    description,
    task_type: "study_topic" as const,
    estimated_duration_minutes: reviewMinutes,
    base_topic_id: topic.baseTopicId,
    user_topic_id: topic.userTopicId,
    user_practical_id: null,
  });

  // Pace of new topics.
  const newQueue = input.topics
    .filter((topic) => !topic.studied)
    .sort(
      (a, b) =>
        priorityOrder[a.priority] - priorityOrder[b.priority] ||
        (a.number ?? Number.MAX_SAFE_INTEGER) - (b.number ?? Number.MAX_SAFE_INTEGER),
    );
  const pendingPracticals = input.practicals.filter(
    (practical) => practical.status !== "mastered",
  );
  const weeklyPracticalMinutes = pendingPracticals.length > 0 ? practicalMinutes : 0;
  const minutesPerNewTopic = topicMinutes + REVIEW_OFFSETS.length * reviewMinutes;
  const paceByTime = Math.max(
    1,
    Math.floor((weeklyMinutes - weeklyPracticalMinutes) / minutesPerNewTopic),
  );
  let newTopicsPerWeek = paceByTime;
  let reachesExam = true;
  let hoursPerWeekNeeded: number | null = null;

  if (examEndKey && newQueue.length > 0) {
    const weeksToExam = Math.max(1, Math.ceil((daysBetween(todayKey, examEndKey) + 1) / 7));
    const firstPassWeeks = Math.max(1, Math.floor(weeksToExam * FIRST_PASS_SHARE));
    const paceNeeded = Math.ceil(newQueue.length / firstPassWeeks);

    if (paceNeeded > paceByTime) {
      reachesExam = false;
      hoursPerWeekNeeded = Math.ceil(
        (paceNeeded * minutesPerNewTopic + weeklyPracticalMinutes) / 60,
      );
    } else {
      // No need to rush: spread the first pass over the time reserved for it.
      newTopicsPerWeek = paceNeeded;
    }
  }

  const initialTopicCount = newQueue.length;
  const studiedPool = input.topics.filter((topic) => topic.studied);
  const simulationPool: PlanTopic[] = [...studiedPool];
  const maintenanceQueue = studiedPool.filter((topic) => topic.mastery !== "high");
  const lastMaintenance = new Map<string, string>();
  const newPerWeek = new Map<number, number>();

  // Topics already studied this week count towards this week's pace, so
  // recalculating does not pile a second new topic on top of them.
  for (const topic of studiedPool) {
    if (topic.studiedOnKey && topic.studiedOnKey >= firstMondayKey && topic.studiedOnKey <= todayKey) {
      newPerWeek.set(0, (newPerWeek.get(0) ?? 0) + 1);
    }
  }
  let practicalIndex = 0;
  let simulationIndex = 0;
  let maintenanceIndex = 0;
  let firstPassEndKey: string | null = null;

  // Practicals and mock exams take their place first, so the reviews that
  // spill into later days cannot crowd them out.
  const simulationHold = new Set<string>();

  for (const [week, weekDays] of daysByWeek) {
    const lastDay = weekDays[weekDays.length - 1];
    const practicalDay = weekDays.length > 1 ? weekDays[weekDays.length - 2] : lastDay;

    // One practical a week.
    if (pendingPracticals.length > 0) {
      const practical = pendingPracticals[practicalIndex % pendingPracticals.length];
      practicalIndex++;
      place(practicalDay, {
        kind: "practical",
        title: `${PRACTICAL_PREFIX}${shorten(practical.name, 70)}`,
        description: "Resuélvelo sin mirar la solución y apunta dónde te atascas.",
        task_type: "practical",
        estimated_duration_minutes: practicalMinutes,
        base_topic_id: null,
        user_topic_id: null,
        user_practical_id: practical.id,
      });
    }

    // A timed mock exam every other week: hold the time until we know
    // which topics are already studied by then.
    if (week % 2 === 1 && fits(lastDay, simulationMinutes)) {
      simulationHold.add(lastDay);
      remaining.set(lastDay, (remaining.get(lastDay) ?? 0) - simulationMinutes);
    }
  }

  // Topics studied through the calendar keep the spaced reviews they still
  // owe. Reviews whose day has passed collapse into a single catch-up.
  const owedReviews = studiedPool
    .filter((topic) => topic.studiedOnKey)
    .sort((a, b) => (a.studiedOnKey as string).localeCompare(b.studiedOnKey as string));

  for (const topic of owedReviews) {
    const studiedOnKey = topic.studiedOnKey as string;
    const targets: Array<{ index: number; key: string }> = [];

    for (let index = Math.max(0, topic.reviewsDone ?? 0); index < REVIEW_OFFSETS.length; index++) {
      const dueKey = addDays(studiedOnKey, REVIEW_OFFSETS[index]);

      if (dueKey >= todayKey) {
        targets.push({ index, key: dueKey });
      } else {
        // Overdue: only the latest one is kept, to be done as soon as possible.
        targets.splice(0, targets.length, { index, key: todayKey });
      }
    }

    let lastKey: string | null = null;

    for (const target of targets) {
      const fromKey: string =
        lastKey && addDays(lastKey, 1) > target.key ? addDays(lastKey, 1) : target.key;
      const reviewKey = firstFit(fromKey, reviewMinutes);

      if (reviewKey) {
        lastKey = reviewKey;
        place(
          reviewKey,
          reviewTask(
            topic,
            `Repaso ${target.index + 1} de ${REVIEW_OFFSETS.length}: recita el índice sin mirar y comprueba.`,
          ),
        );
      }
    }

    // Maintenance reviews start two weeks after the last spaced one.
    lastMaintenance.set(
      topic.baseTopicId,
      lastKey ?? (studiedOnKey > todayKey ? todayKey : studiedOnKey),
    );
  }

  for (const key of days) {
    const week = weekOf(key);

    if (simulationHold.has(key)) {
      remaining.set(key, (remaining.get(key) ?? 0) + simulationMinutes);

      if (simulationPool.length > 0) {
        const topic = simulationPool[simulationIndex % simulationPool.length];
        simulationIndex++;
        place(key, {
          kind: "simulation",
          title: `${SIMULATION_PREFIX}${topicLabel(topic)}`,
          description:
            "Escribe o canta el tema completo con el tiempo del examen, sin apuntes.",
          task_type: "study_topic",
          estimated_duration_minutes: simulationMinutes,
          base_topic_id: topic.baseTopicId,
          user_topic_id: topic.userTopicId,
          user_practical_id: null,
        });
      }
    }

    // New topics, each followed by its spaced reviews.
    while (
      newQueue.length > 0 &&
      (newPerWeek.get(week) ?? 0) < newTopicsPerWeek &&
      fits(key, topicMinutes)
    ) {
      const topic = newQueue.shift() as PlanTopic;
      newPerWeek.set(week, (newPerWeek.get(week) ?? 0) + 1);
      firstPassEndKey = key;
      place(key, {
        kind: "study",
        title:
          topic.number === null
            ? shorten(topic.title)
            : shorten(`Tema ${topic.number}: ${topic.title}`),
        description: "Estudia el tema, haz tu esquema y apunta las dudas.",
        task_type: "study_topic",
        estimated_duration_minutes: topicMinutes,
        base_topic_id: topic.baseTopicId,
        user_topic_id: topic.userTopicId,
        user_practical_id: null,
      });
      simulationPool.push(topic);

      REVIEW_OFFSETS.forEach((offset, index) => {
        const reviewKey = firstFit(addDays(key, offset), reviewMinutes);

        if (reviewKey) {
          place(
            reviewKey,
            reviewTask(
              topic,
              `Repaso ${index + 1} de ${REVIEW_OFFSETS.length}: recita el índice sin mirar y comprueba.`,
            ),
          );
        }
      });
    }

    // Spare time keeps alive what was already studied before this plan.
    if (maintenanceQueue.length > 0 && (remaining.get(key) ?? 0) >= reviewMinutes) {
      for (let attempt = 0; attempt < maintenanceQueue.length; attempt++) {
        const topic = maintenanceQueue[(maintenanceIndex + attempt) % maintenanceQueue.length];
        const last = lastMaintenance.get(topic.baseTopicId);

        if (!last || daysBetween(last, key) >= STUDIED_REVIEW_EVERY_DAYS) {
          maintenanceIndex = (maintenanceIndex + attempt + 1) % maintenanceQueue.length;
          lastMaintenance.set(topic.baseTopicId, key);
          place(
            key,
            reviewTask(topic, "Repaso de mantenimiento: recita el índice y repasa lo que falle."),
          );
          break;
        }
      }
    }
  }

  tasks.sort(
    (a, b) =>
      a.task_date.localeCompare(b.task_date) || kindOrder[a.kind] - kindOrder[b.kind],
  );

  const count = (kind: SessionKind) => tasks.filter((task) => task.kind === kind).length;

  return {
    tasks,
    summary: {
      sessions: tasks.length,
      newTopics: count("study"),
      reviews: count("review"),
      practicals: count("practical"),
      simulations: count("simulation"),
      firstDateKey: tasks[0]?.task_date ?? null,
      lastDateKey: tasks[tasks.length - 1]?.task_date ?? null,
      firstPassEndKey,
      newTopicsPerWeek: initialTopicCount === 0 ? 0 : newTopicsPerWeek,
      topicsLeftForLater: newQueue.length,
      reachesExam,
      hoursPerWeekNeeded,
      reason: tasks.length === 0 ? "no-topics" : "ok",
    },
  };
}
