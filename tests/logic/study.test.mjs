import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

// Runs the real TS modules (pure logic, no network) and follows relative imports.
const cache = new Map();
function load(file) {
  const full = path.resolve(file);
  if (cache.has(full)) return cache.get(full);
  const js = ts.transpileModule(fs.readFileSync(full, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  cache.set(full, exports);
  vm.runInNewContext(js, { exports, Date, Math, Number, Map, Set, Intl, require(name) {
    if (!name.startsWith('.')) throw new Error(`Unexpected dependency: ${name}`);
    return load(path.join(path.dirname(full), `${name}.ts`));
  }});
  return exports;
}

const { generateStudyPlan, REVIEW_OFFSETS } = load('lib/study/planner.ts');
const { summarizeGame, getLevel, getSessionXp, getCompletionXp } = load('lib/study/gamification.ts');
const { getSessionKind, addDays, daysBetween } = load('lib/study/sessions.ts');

const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
function topics(count, overrides = {}) {
  return Array.from({ length: count }, (_, index) => ({
    baseTopicId: `b${index + 1}`, userTopicId: `u${index + 1}`, number: index + 1,
    title: `Título del tema ${index + 1}`, studied: false, priority: 'low', mastery: 'low',
    ...overrides,
  }));
}
function plan(overrides = {}) {
  return generateStudyPlan({
    todayKey: '2026-11-23', // a Monday
    examDateKey: '2027-06-19',
    availableDays: weekdays,
    weeklyHours: 12,
    topicMinutes: 60,
    practicalMinutes: 90,
    topics: topics(30),
    practicals: [],
    ...overrides,
  });
}

test('plan only uses available days between today and the day before the exam', () => {
  const { tasks } = plan({ availableDays: ['monday', 'thursday'], examDateKey: '2027-01-15' });
  assert.ok(tasks.length > 0);
  for (const task of tasks) {
    const day = new Date(`${task.task_date}T12:00:00`).getDay();
    assert.ok(day === 1 || day === 4, `unexpected weekday for ${task.task_date}`);
    assert.ok(task.task_date >= '2026-11-23' && task.task_date <= '2027-01-14');
  }
});

test('every topic is studied once and its reviews follow the spaced offsets', () => {
  const { tasks, summary } = plan();
  const studies = tasks.filter((task) => task.kind === 'study');
  assert.equal(studies.length, 30);
  assert.equal(new Set(studies.map((task) => task.base_topic_id)).size, 30);
  assert.equal(summary.topicsLeftForLater, 0);
  for (const study of studies.slice(0, 10)) {
    const reviews = tasks
      .filter((task) => task.kind === 'review' && task.base_topic_id === study.base_topic_id)
      .map((task) => daysBetween(study.task_date, task.task_date));
    assert.equal(reviews.length, REVIEW_OFFSETS.length);
    reviews.forEach((gap, index) => assert.ok(gap >= REVIEW_OFFSETS[index], `review ${index} too early`));
  }
});

test('high priority topics come first and studied topics are not studied again', () => {
  const list = topics(6);
  list[4].priority = 'high';
  list[0].studied = true;
  const { tasks } = plan({ topics: list });
  const studies = tasks.filter((task) => task.kind === 'study');
  assert.equal(studies[0].base_topic_id, 'b5');
  assert.ok(!studies.some((task) => task.base_topic_id === 'b1'));
  assert.ok(tasks.some((task) => task.kind === 'review' && task.base_topic_id === 'b1'));
});

test('daily load stays within the weekly time, apart from a first oversized session', () => {
  const { tasks } = plan({ weeklyHours: 10 });
  const byDay = new Map();
  for (const task of tasks) byDay.set(task.task_date, (byDay.get(task.task_date) ?? 0) + task.estimated_duration_minutes);
  for (const [day, minutes] of byDay) assert.ok(minutes <= 120, `${day} has ${minutes} minutes`);
});

test('one practical a week, cycling through the ones not mastered', () => {
  const { tasks } = plan({
    examDateKey: '2026-12-20',
    practicals: [
      { id: 'p1', name: 'Genética', status: 'worked' },
      { id: 'p2', name: 'Corte geológico', status: 'not_started' },
      { id: 'p3', name: 'Dominado', status: 'mastered' },
    ],
  });
  const practicals = tasks.filter((task) => task.kind === 'practical');
  assert.equal(practicals.length, 4);
  assert.equal(practicals.map((task) => task.user_practical_id).join(), 'p1,p2,p1,p2');
  assert.ok(practicals.every((task) => task.task_type === 'practical'));
});

test('an impossible pace is reported with the weekly hours it would take', () => {
  const { summary } = plan({ topics: topics(75), weeklyHours: 4, examDateKey: '2027-02-01' });
  assert.equal(summary.reachesExam, false);
  assert.ok(summary.hoursPerWeekNeeded > 4);
  assert.equal(plan().summary.reachesExam, true);
});

function minutesByWeek(tasks, mondayKey = '2026-11-23') {
  const weeks = new Map();
  for (const task of tasks) {
    const week = Math.floor(daysBetween(mondayKey, task.task_date) / 7);
    weeks.set(week, (weeks.get(week) ?? 0) + task.estimated_duration_minutes);
  }
  return weeks;
}
const twoPracticals = [
  { id: 'p1', name: 'Genética', status: 'worked' },
  { id: 'p2', name: 'Corte geológico', status: 'not_started' },
];

test('with few hours no week goes over the weekly time', () => {
  for (const weeklyHours of [1, 2, 3, 4, 6]) {
    const { tasks } = plan({ weeklyHours, topics: topics(20), practicals: twoPracticals });
    assert.ok(tasks.length > 0);
    for (const [week, minutes] of minutesByWeek(tasks)) {
      assert.ok(minutes <= weeklyHours * 60, `${weeklyHours} h: week ${week} has ${minutes} min`);
    }
  }
  // A week shorter than one topic still gets that topic, and nothing else.
  const short = minutesByWeek(plan({ weeklyHours: 0.5, topics: topics(5) }).tasks);
  assert.ok([...short.values()].every((minutes) => minutes <= 60));
});

test('the week of today only gets its share of the weekly time', () => {
  // Thursday: two study days left out of five.
  const { tasks } = plan({ todayKey: '2026-11-26', weeklyHours: 10, practicals: twoPracticals });
  assert.ok(minutesByWeek(tasks).get(0) <= 240);
});

test('practicals and mock exams only enter when topics still fit', () => {
  const few = plan({ weeklyHours: 3, topics: topics(20), practicals: twoPracticals }).summary;
  assert.equal(few.practicals, 0);
  assert.equal(few.simulations, 0);
  assert.equal(few.practicalsLeftOut, true);
  assert.equal(few.newTopics, 20);
  assert.equal(few.reachesExam, true);

  const enough = plan({ weeklyHours: 12, practicals: twoPracticals }).summary;
  assert.ok(enough.practicals > 0 && enough.simulations > 0);
  assert.equal(enough.practicalsLeftOut, false);

  // Nothing new to study: practicals take the time even with few hours.
  const onlyPracticals = plan({ weeklyHours: 2, topics: [], practicals: twoPracticals }).summary;
  assert.ok(onlyPracticals.practicals > 0);
});

test('topics left without room before the exam mean the plan does not reach it', () => {
  // One topic a week is the pace needed, but its reviews fill the weeks.
  const { summary } = plan({ weeklyHours: 1, topics: topics(22) });
  assert.ok(summary.topicsLeftForLater > 0);
  assert.equal(summary.reachesExam, false);
  assert.ok(summary.hoursPerWeekNeeded > 1);

  // Without an exam date they are only left for later.
  const open = plan({ weeklyHours: 1, topics: topics(75), examDateKey: null }).summary;
  assert.ok(open.topicsLeftForLater > 0);
  assert.equal(open.reachesExam, true);
});

test('recalculating carries on the rotation of practicals and mock exams', () => {
  const idsOf = (practicals) =>
    plan({ examDateKey: '2026-12-20', practicals }).tasks
      .filter((task) => task.kind === 'practical')
      .map((task) => task.user_practical_id)
      .join();

  // p1 was worked last week: the plan starts with the one waiting longest.
  assert.equal(
    idsOf([
      { id: 'p1', name: 'A', status: 'worked', lastWorkedOnKey: '2026-11-20', timesWorked: 1 },
      { id: 'p2', name: 'B', status: 'not_started', lastWorkedOnKey: null, timesWorked: 0 },
      { id: 'p3', name: 'C', status: 'worked', lastWorkedOnKey: '2026-11-06', timesWorked: 1 },
    ]),
    'p2,p3,p1,p2',
  );
  // Without dates, the one worked fewer times goes first.
  assert.equal(
    idsOf([
      { id: 'p1', name: 'A', status: 'worked', timesWorked: 2 },
      { id: 'p2', name: 'B', status: 'worked', timesWorked: 1 },
    ]),
    'p2,p1,p2,p1',
  );

  // Mock exams: topic 1 already has two, so the others go before it.
  const list = topics(3, { studied: true, mastery: 'high' });
  list[0].simulationCount = 2;
  list[1].simulationCount = 1;
  const simulations = plan({ topics: list, examDateKey: '2027-02-01' }).tasks
    .filter((task) => task.kind === 'simulation')
    .map((task) => task.base_topic_id);
  assert.equal(simulations.slice(0, 5).join(), 'b3,b2,b3,b1,b2');
});

test('nothing is planned without days, topics or time left', () => {
  assert.equal(plan({ availableDays: [] }).summary.reason, 'no-days');
  assert.equal(plan({ topics: [], practicals: [] }).summary.reason, 'no-topics');
  assert.equal(plan({ examDateKey: '2026-11-20' }).summary.reason, 'exam-passed');
  assert.equal(plan({ examDateKey: '2026-11-20' }).tasks.length, 0);
});

test('titles written by the planner are read back as the right kind of session', () => {
  const { tasks } = plan({ practicals: [{ id: 'p1', name: 'Genética', status: 'worked' }] });
  for (const task of tasks) assert.equal(getSessionKind(task.task_type, task.title), task.kind);
  assert.equal(getSessionKind('rest', 'Descanso'), 'rest');
  assert.equal(getSessionKind('study_topic', 'Estudiar tema 12'), 'study');
});

function done(day, title = 'Tema 1: algo', taskType = 'study_topic') {
  return { status: 'completed', completedAt: `${day}T10:00:00`, title, taskType };
}

test('xp adds up by kind and pending sessions are worth nothing', () => {
  const game = summarizeGame([
    done('2026-11-20'),
    done('2026-11-20', 'Repaso: Tema 1'),
    done('2026-11-21', 'Simulacro: Tema 1'),
    done('2026-11-21', 'Práctico: genética', 'practical'),
    done('2026-11-21', 'Descanso', 'rest'),
    { status: 'pending', completedAt: null, title: 'Tema 2', taskType: 'study_topic' },
  ], new Date('2026-11-23T12:00:00'));
  assert.equal(game.xpTotal, 20 + 10 + 30 + 15);
  assert.equal(game.streak, 2);
  assert.equal(game.studiedToday, false);
  assert.equal(game.level.number, 1);
  assert.equal(game.xpToNextLevel, 200 - 75);
});

test('streak counts study days, survives short breaks and ends after a week off', () => {
  const sessions = ['2026-11-02', '2026-11-05', '2026-11-09', '2026-11-10', '2026-11-12', '2026-11-13'].map((day) => done(day));
  const active = summarizeGame(sessions, new Date('2026-11-15T12:00:00'));
  assert.equal(active.streak, 6);
  // From the fifth study day on, each session earns the streak bonus.
  assert.equal(active.xpTotal, 4 * 20 + 2 * 25);
  const lapsed = summarizeGame(sessions, new Date('2026-11-23T12:00:00'));
  assert.equal(lapsed.streak, 0);
  assert.equal(lapsed.bestStreak, 6);
  const restarted = summarizeGame([...sessions, done('2026-11-23')], new Date('2026-11-23T12:00:00'));
  assert.equal(restarted.streak, 1);
  assert.equal(restarted.studiedToday, true);
});

test('levels and session xp', () => {
  assert.equal(getLevel(0).number, 1);
  assert.equal(getLevel(199).number, 1);
  assert.equal(getLevel(200).name, 'Estudiante constante');
  assert.equal(getLevel(99999).number, 10);
  assert.equal(getLevel(99999).nextXp, null);
  assert.equal(getSessionXp('study_topic', 'Tema 3: x', 0), 20);
  assert.equal(getSessionXp('study_topic', 'Repaso: Tema 3', 6), 15);
  assert.equal(getSessionXp('rest', 'Descanso', 9), 0);
  assert.equal(addDays('2026-12-30', 3), '2027-01-02');
});

test('the xp shown on completing includes the streak bonus on the day it is reached', () => {
  const now = new Date('2026-11-23T10:00:00Z');
  const past = (id, day) => ({
    id, taskType: 'study_topic', title: `Tema ${id}`, status: 'completed',
    completedAt: `${day}T10:00:00Z`, taskDate: day,
  });
  const pending = (id, title, taskType = 'study_topic') => ({
    id, taskType, title, status: 'pending', completedAt: null, taskDate: '2026-11-23',
  });
  const study = pending('s', 'Tema 9: x');
  const review = pending('r', 'Repaso: Tema 3');
  const rest = pending('d', 'Descanso', 'rest');

  // Four study days behind: today is the fifth, so the bonus starts now.
  const fourDays = ['2026-11-19', '2026-11-20', '2026-11-21', '2026-11-22'].map((day, i) => past(`p${i}`, day));
  const list = [...fourDays, study, review, rest];
  assert.equal(getCompletionXp(list, study, now), 25);
  assert.equal(getCompletionXp(list, review, now), 15);
  assert.equal(getCompletionXp(list, rest, now), 0);
  // What the screens showed before: the streak as it was, without the bonus.
  assert.equal(getSessionXp(study.taskType, study.title, summarizeGame(list, now).streak), 20);

  // A shorter streak gets no bonus, and the sum matches the total afterwards.
  const short = [...fourDays.slice(2), study];
  assert.equal(getCompletionXp(short, study, now), 20);
  const after = short.map((item) => (item === study ? { ...study, status: 'completed', completedAt: now.toISOString() } : item));
  assert.equal(summarizeGame(after, now).xpTotal - summarizeGame(short, now).xpTotal, 20);
});

test('recalculating keeps the spaced reviews of a topic studied in the calendar', () => {
  const list = topics(3);
  list[0].studied = true;
  list[0].studiedOnKey = '2026-11-23';
  const { tasks } = plan({ topics: list, busy: [{ dateKey: '2026-11-23', minutes: 60 }] });
  const reviews = tasks.filter((task) => task.kind === 'review' && task.base_topic_id === 'b1');
  assert.equal(
    reviews.slice(0, 4).map((task) => daysBetween('2026-11-23', task.task_date)).join(),
    '3,7,14,30',
  );
  assert.ok(reviews.length > 4, 'maintenance reviews follow the spaced ones');
  assert.ok(daysBetween(reviews[3].task_date, reviews[4].task_date) >= 14);
  // The topic studied today already fills this week's pace of one new topic.
  const studies = tasks.filter((task) => task.kind === 'study');
  assert.ok(studies.every((task) => task.task_date >= '2026-11-30'));
  assert.ok(!tasks.some((task) => task.task_date === '2026-11-23'));
});

test('reviews already done are not planned again and overdue ones collapse into one', () => {
  const list = topics(1, { studied: true, studiedOnKey: '2026-11-16', reviewsDone: 1 });
  const done = plan({ topics: list }).tasks.filter((task) => task.kind === 'review');
  assert.equal(
    done.slice(0, 3).map((task) => daysBetween('2026-11-16', task.task_date)).join(),
    '7,14,30',
  );
  const late = topics(1, { studied: true, studiedOnKey: '2026-10-01', reviewsDone: 0 });
  const overdue = plan({ topics: late }).tasks.filter((task) => task.kind === 'review');
  assert.equal(overdue[0].task_date, '2026-11-23');
  assert.ok(overdue[0].description.startsWith('Repaso 4 de 4'));
  assert.ok(daysBetween(overdue[0].task_date, overdue[1].task_date) >= 14);
});

test('an overdue review done today does not come back when recalculating', () => {
  const reviewsOf = (overrides) =>
    plan({ topics: topics(1, { studied: true, ...overrides }) })
      .tasks.filter((task) => task.kind === 'review');

  // All four reviews were overdue and collapsed into one, done today.
  const caughtUp = reviewsOf({
    studiedOnKey: '2026-10-01', reviewsDone: 1, lastReviewOnKey: '2026-11-23',
  });
  assert.ok(caughtUp.length > 0);
  assert.ok(caughtUp.every((task) => task.description.startsWith('Repaso de mantenimiento')));
  assert.ok(daysBetween('2026-11-23', caughtUp[0].task_date) >= 14);

  // Two were overdue (days 3 and 7): today's catch-up covers both, and the
  // ones at 14 and 30 days keep their dates.
  const partly = reviewsOf({
    studiedOnKey: '2026-11-11', reviewsDone: 1, lastReviewOnKey: '2026-11-23',
  });
  assert.equal(
    partly.slice(0, 2).map((task) => daysBetween('2026-11-11', task.task_date)).join(),
    '14,30',
  );

  // A review done on its day does not swallow the next ones.
  const onTime = reviewsOf({
    studiedOnKey: '2026-11-16', reviewsDone: 1, lastReviewOnKey: '2026-11-19',
  });
  assert.equal(
    onTime.slice(0, 3).map((task) => daysBetween('2026-11-16', task.task_date)).join(),
    '7,14,30',
  );

  // A topic marked as studied in Temas: its maintenance review, done today,
  // waits two weeks before the next one.
  const byHand = reviewsOf({ lastReviewOnKey: '2026-11-23' });
  assert.ok(daysBetween('2026-11-23', byHand[0].task_date) >= 14);
});

test('sessions the plan keeps take up their day', () => {
  const { tasks } = plan({ weeklyHours: 10, busy: [{ dateKey: '2026-11-24', minutes: 120 }] });
  assert.ok(!tasks.some((task) => task.task_date === '2026-11-24'));
});

// Error messages
const { friendlyError } = load('lib/errors.ts');

test('errors from Supabase reach the user in Spanish, never as raw text', () => {
  assert.equal(friendlyError({ message: 'Invalid login credentials' }), 'El correo o la contraseña no son correctos.');
  assert.equal(friendlyError(new Error('User already registered')), 'Ya hay una cuenta con ese correo.');
  assert.equal(
    friendlyError({ message: 'Password should be at least 6 characters.' }),
    'La contraseña debe tener al menos 6 caracteres.',
  );
  assert.match(friendlyError('TypeError: Failed to fetch'), /conexión/);
  assert.match(friendlyError({ message: 'new row violates row-level security policy for table "calendar_tasks"' }), /permiso/);
  assert.match(friendlyError({ message: 'JWT expired' }), /sesión ha caducado/);

  // Anything unknown, with its table and column names, becomes a neutral sentence.
  const unknown = friendlyError({ message: 'column user_practicals.last_worked_date does not exist' });
  assert.equal(unknown, 'Inténtalo de nuevo en un momento.');
  assert.equal(friendlyError(null), unknown);
  assert.equal(friendlyError({ message: 42 }), unknown);

  // An error rethrown with a friendly message keeps it.
  for (const raw of ['Invalid login credentials', 'Password should be at least 8 characters.', 'boom']) {
    const once = friendlyError({ message: raw });
    assert.equal(friendlyError(new Error(once)), once);
  }
});

// Deleting a session
const { revertsProgressOnDelete, studiedSessionChange, STUDIED_IN_TOPICS_NOTE } = load('lib/study/progress-sync.ts');

test('deleting a completed session takes its progress back', () => {
  const row = (id, title, overrides = {}) => ({
    id, title, taskType: 'study_topic', status: 'completed', userTopicId: 'u1',
    userPracticalId: null, ...overrides,
  });
  const review = row('r', 'Repaso: Tema 1');
  const simulation = row('m', 'Simulacro: Tema 1');
  const practical = row('p', 'Práctico: Genética', { taskType: 'practical', userTopicId: null, userPracticalId: 'p1' });
  const study = row('s', 'Tema 1: La célula');
  const all = [review, simulation, practical, study];

  assert.equal(revertsProgressOnDelete(review, all), true);
  assert.equal(revertsProgressOnDelete(simulation, all), true);
  assert.equal(revertsProgressOnDelete(practical, all), true);
  assert.equal(revertsProgressOnDelete(study, all), true);

  // Pending or cancelled sessions gave nothing, and neither did loose ones.
  assert.equal(revertsProgressOnDelete({ ...review, status: 'pending' }, all), false);
  assert.equal(revertsProgressOnDelete({ ...review, status: 'cancelled' }, all), false);
  assert.equal(revertsProgressOnDelete({ ...review, userTopicId: null }, all), false);
  assert.equal(revertsProgressOnDelete({ ...practical, userPracticalId: null }, all), false);
  assert.equal(revertsProgressOnDelete(row('d', 'Descanso', { taskType: 'rest' }), all), false);

  // Studied twice: deleting one of the two sessions keeps the topic studied.
  const again = row('s2', 'Tema 1: La célula');
  assert.equal(revertsProgressOnDelete(study, [...all, again]), false);
  assert.equal(revertsProgressOnDelete(study, [...all, { ...again, status: 'pending' }]), true);
  assert.equal(revertsProgressOnDelete(study, [...all, { ...again, userTopicId: 'u2' }]), true);
});

test('marking a topic as studied in Temas reaches its calendar session', () => {
  const row = (id, overrides = {}) => ({
    id, title: 'Tema 1: La célula', description: '', taskType: 'study_topic',
    taskDate: '2026-12-01', status: 'pending', completedAt: null, isAutoGenerated: true,
    ...overrides,
  });
  const act = (sessions, studied) => {
    const change = studiedSessionChange(sessions, studied);
    return change.id ? `${change.action}:${change.id}` : change.action;
  };
  const review = row('r', { title: 'Repaso: Tema 1' });

  // Studied: the earliest planned study session is completed; reviews are not.
  assert.equal(act([review, row('b', { taskDate: '2026-12-09' }), row('a')], true), 'complete:a');
  // No session to complete: one is written.
  assert.equal(act([review], true), 'create');
  assert.equal(act([row('c', { status: 'cancelled' })], true), 'create');
  // Already completed in the calendar: nothing to add.
  assert.equal(act([row('a', { status: 'completed' })], true), 'none');

  // Not studied: a plan session goes back to pending, one written by Temas goes.
  const done = { status: 'completed', completedAt: '2026-11-26T10:00:00Z' };
  assert.equal(act([row('a', done)], false), 'reopen:a');
  assert.equal(
    act([row('t', { ...done, isAutoGenerated: false, description: STUDIED_IN_TOPICS_NOTE })], false),
    'delete:t',
  );
  // A session the user wrote by hand is left alone, and so is nothing at all.
  assert.equal(act([row('h', { ...done, isAutoGenerated: false, description: 'Mía' })], false), 'none');
  assert.equal(act([review, row('a')], false), 'none');
  // Several completed: the last one is the one that changes.
  assert.equal(
    act([row('old', { ...done, completedAt: '2026-11-20T10:00:00Z' }), row('new', done)], false),
    'reopen:new',
  );
});

// Swapping the old plan for the new one
const { replacePlan } = load('lib/study/replace-plan.ts');

function fakeCalendar(oldCount, { failInsertAt = 0, failRemoves = 0 } = {}) {
  const rows = new Set(Array.from({ length: oldCount }, (_, index) => `old${index}`));
  let inserts = 0;
  let removes = 0;
  let next = 0;
  let smallest = rows.size;
  return {
    rows,
    smallest: () => smallest,
    store: {
      async insert(chunk) {
        inserts++;
        if (inserts === failInsertAt) return { ids: [], error: 'sin conexión' };
        const ids = chunk.map(() => `new${next++}`);
        ids.forEach((id) => rows.add(id));
        return { ids, error: null };
      },
      async remove(ids) {
        removes++;
        if (removes <= failRemoves) return { error: 'sin conexión' };
        ids.forEach((id) => rows.delete(id));
        smallest = Math.min(smallest, rows.size);
        return { error: null };
      },
    },
  };
}
const oldIds = (count) => Array.from({ length: count }, (_, index) => `old${index}`);
const newRows = (count) => Array.from({ length: count }, (_, index) => ({ title: `Sesión ${index}` }));
const count = (rows, prefix) => [...rows].filter((id) => id.startsWith(prefix)).length;

test('replacing the plan writes the new one before removing the old one', async () => {
  const calendar = fakeCalendar(250);
  const result = await replacePlan(calendar.store, oldIds(250), newRows(450));
  assert.equal(result.ok, true);
  assert.equal(count(calendar.rows, 'old'), 0);
  assert.equal(count(calendar.rows, 'new'), 450);
  // The calendar never holds less than a whole plan.
  assert.ok(calendar.smallest() >= 250);
});

test('a failed insert undoes the new plan and keeps the old one', async () => {
  const calendar = fakeCalendar(250, { failInsertAt: 3 });
  const result = await replacePlan(calendar.store, oldIds(250), newRows(450));
  assert.equal(result.ok, false);
  assert.equal(result.state, 'kept-old');
  assert.equal(result.message, 'sin conexión');
  assert.equal(count(calendar.rows, 'old'), 250);
  assert.equal(count(calendar.rows, 'new'), 0);

  // If the undo fails as well, it says the calendar is left mixed.
  const stuck = fakeCalendar(250, { failInsertAt: 3, failRemoves: 99 });
  const mixed = await replacePlan(stuck.store, oldIds(250), newRows(450));
  assert.equal(mixed.state, 'mixed');
  assert.equal(count(stuck.rows, 'old'), 250);
});

test('old sessions that cannot be removed leave the new plan whole', async () => {
  // A passing failure is retried and goes unnoticed.
  const flaky = fakeCalendar(250, { failRemoves: 1 });
  assert.equal((await replacePlan(flaky.store, oldIds(250), newRows(450))).ok, true);
  assert.equal(count(flaky.rows, 'old'), 0);

  const stuck = fakeCalendar(250, { failRemoves: 99 });
  const result = await replacePlan(stuck.store, oldIds(250), newRows(450));
  assert.equal(result.state, 'old-left');
  assert.equal(count(stuck.rows, 'new'), 450);
});

// "Hoy" screen
const { buildTodayView, formatMinutes } = load('lib/study/today.ts');

function todaySession(id, taskDate, overrides = {}) {
  return {
    id, title: `Tema ${id}`, description: '', taskDate, taskType: 'study_topic',
    status: 'pending', completedAt: null, userTopicId: null, userPracticalId: null,
    estimatedMinutes: 60, ...overrides,
  };
}

test('hoy: separa lo de hoy, lo atrasado y lo de mañana', () => {
  const view = buildTodayView([
    todaySession('a', '2026-11-20'),
    todaySession('b', '2026-11-22', { status: 'completed' }),
    todaySession('c', '2026-11-23', { status: 'completed' }),
    todaySession('d', '2026-11-23', { title: 'Repaso: Tema 1', estimatedMinutes: 30 }),
    todaySession('e', '2026-11-23'),
    todaySession('f', '2026-11-23', { status: 'cancelled' }),
    todaySession('g', '2026-11-24'),
    todaySession('h', '2026-11-25'),
  ], '2026-11-23');

  assert.equal(view.today.map((s) => s.id).join(), 'e,d,c');
  assert.equal(view.overdue.map((s) => s.id).join(), 'a');
  assert.equal(view.tomorrow.map((s) => s.id).join(), 'g');
  assert.equal(view.doneCount, 1);
  assert.equal(view.totalCount, 3);
  assert.equal(view.minutesLeft, 90);
});

test('hoy: el descanso no cuenta como trabajo ni como atrasado', () => {
  const view = buildTodayView([
    todaySession('a', '2026-11-22', { taskType: 'rest', title: 'Descanso' }),
    todaySession('b', '2026-11-23', { taskType: 'rest', title: 'Descanso' }),
  ], '2026-11-23');

  assert.equal(view.totalCount, 0);
  assert.equal(view.overdue.length, 0);
  assert.equal(view.rest.length, 1);
  assert.equal(view.minutesLeft, null);
});

test('hoy: lo atrasado sale de más reciente a más antiguo', () => {
  const view = buildTodayView([
    todaySession('a', '2026-11-10'),
    todaySession('b', '2026-11-21'),
    todaySession('c', '2026-11-15'),
  ], '2026-11-23');

  assert.equal(view.overdue.map((s) => s.id).join(), 'b,c,a');
});

test('hoy: formato de minutos', () => {
  assert.equal(formatMinutes(45), '45 min');
  assert.equal(formatMinutes(60), '1 h');
  assert.equal(formatMinutes(90), '1 h 30 min');
});
