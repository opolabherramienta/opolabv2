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
  vm.runInNewContext(js, { exports, Date, Math, Number, Map, Set, require(name) {
    if (!name.startsWith('.')) throw new Error(`Unexpected dependency: ${name}`);
    return load(path.join(path.dirname(full), `${name}.ts`));
  }});
  return exports;
}

const { generateStudyPlan, REVIEW_OFFSETS } = load('lib/study/planner.ts');
const { summarizeGame, getLevel, getSessionXp } = load('lib/study/gamification.ts');
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
