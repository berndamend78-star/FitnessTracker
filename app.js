(() => {
  'use strict';

  const STORAGE_KEY = 'repflow_data_v1';

  const COLOR_PALETTE = {
    orange: {
      name: 'Orange',
      light: { color: '#ea580c', soft: '#fff3eb', border: '#fed7aa' },
      dark:  { color: '#ff6b4a', soft: 'rgba(255, 107, 74, 0.14)', border: 'rgba(255, 107, 74, 0.32)' }
    },
    teal: {
      name: 'Türkis',
      light: { color: '#0d9488', soft: '#ecfdf8', border: '#99f6e4' },
      dark:  { color: '#2dd4bf', soft: 'rgba(45, 212, 191, 0.14)', border: 'rgba(45, 212, 191, 0.32)' }
    },
    violet: {
      name: 'Violett',
      light: { color: '#7c3aed', soft: '#f5f3ff', border: '#ddd6fe' },
      dark:  { color: '#a78bfa', soft: 'rgba(167, 139, 250, 0.14)', border: 'rgba(167, 139, 250, 0.32)' }
    },
    blue: {
      name: 'Blau',
      light: { color: '#2563eb', soft: '#eff6ff', border: '#bfdbfe' },
      dark:  { color: '#60a5fa', soft: 'rgba(96, 165, 250, 0.14)', border: 'rgba(96, 165, 250, 0.32)' }
    },
    rose: {
      name: 'Rot-Pink',
      light: { color: '#e11d48', soft: '#fff1f2', border: '#fecdd3' },
      dark:  { color: '#fb7185', soft: 'rgba(251, 113, 133, 0.14)', border: 'rgba(251, 113, 133, 0.32)' }
    },
    amber: {
      name: 'Gelb-Gold',
      light: { color: '#d97706', soft: '#fffbeb', border: '#fde68a' },
      dark:  { color: '#fbbf24', soft: 'rgba(251, 191, 36, 0.14)', border: 'rgba(251, 191, 36, 0.32)' }
    },
    emerald: {
      name: 'Grün',
      light: { color: '#059669', soft: '#ecfdf5', border: '#a7f3d0' },
      dark:  { color: '#34d399', soft: 'rgba(52, 211, 153, 0.14)', border: 'rgba(52, 211, 153, 0.32)' }
    }
  };

  const BUILTIN_ICONS = {
    pushups: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18h20"/><path d="M5 18l3-7h8l3 7"/><circle cx="17" cy="7" r="2"/></svg>`,
    pullups: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h18"/><path d="M8 5v5l4 2 4-2V5"/><path d="M12 12v8"/><circle cx="12" cy="8.5" r="1.8"/></svg>`,
    squats: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"/><path d="M12 7v5l-4 3 1 5"/><path d="M12 12l4 3-1 5"/><path d="M7 10h10"/></svg>`,
    custom: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
  };

  const DEFAULT_EXERCISES = [
    {
      id: 'pushups',
      name: 'Liegestütze',
      colorKey: 'orange',
      unit: 'reps',
      goalType: 'weekly',
      goal: 150,
      quickAdds: [8, 10, 12, 15],
      milestones: [50, 100, 250, 500, 1000, 2500, 5000, 10000],
      archived: false
    },
    {
      id: 'pullups',
      name: 'Klimmzüge',
      colorKey: 'teal',
      unit: 'reps',
      goalType: 'weekly',
      goal: 50,
      quickAdds: [1, 2, 3, 5],
      milestones: [25, 50, 100, 250, 500, 1000, 2500, 5000],
      archived: false
    },
    {
      id: 'squats',
      name: 'Kniebeugen',
      colorKey: 'violet',
      unit: 'reps',
      goalType: 'weekly',
      goal: 200,
      quickAdds: [5, 10, 15, 20],
      milestones: [100, 250, 500, 1000, 2500, 5000, 10000, 25000],
      archived: false
    }
  ];

  const COMPARISONS = {
    pushups: {
      emoji: '🏋️',
      title: 'Weggedrücktes Gewicht',
      subtitle: '50 kg pro Liegestütz',
      factor: 50,
      formatValue: (kg) => kg >= 1000
        ? `${(kg / 1000).toLocaleString('de-DE', { maximumFractionDigits: 2 })} t`
        : `${formatNumber(kg)} kg`,
      maxReachedText: '🏆 Du hast einen Airbus A380 weggedrückt!',
      landmarks: [
        { name: 'Konzertflügel', value: 500 },
        { name: 'Kleinwagen', value: 1500 },
        { name: 'Afrikanischer Elefant', value: 5000 },
        { name: 'Linienbus', value: 12000 },
        { name: 'Kampfpanzer', value: 60000 },
        { name: 'Blauwal', value: 150000 },
        { name: 'Airbus A380', value: 500000 }
      ]
    },
    pullups: {
      emoji: '🏔️',
      title: 'Klimmzug-Höhenmeter',
      subtitle: '0,5 m pro Klimmzug erklommen',
      factor: 0.5,
      formatValue: (m) => `${Number(m.toFixed(1)).toLocaleString('de-DE')} m`,
      maxReachedText: '🏆 Du hast den Mount Everest erklommen!',
      landmarks: [
        { name: 'Brandenburger Tor', value: 26 },
        { name: 'Freiheitsstatue', value: 93 },
        { name: 'Kölner Dom', value: 157 },
        { name: 'Eiffelturm', value: 330 },
        { name: 'Burj Khalifa', value: 828 },
        { name: 'Zugspitze', value: 2962 },
        { name: 'Mount Everest', value: 8849 }
      ]
    },
    squats: {
      emoji: '🪜',
      title: 'Bezwungene Treppenstufen',
      subtitle: '3 Stufen pro Kniebeuge',
      factor: 3,
      formatValue: (steps) => `${formatNumber(steps)} Stufen`,
      maxReachedText: '🏆 Du hast den Mount Everest in Stufen bezwungen!',
      landmarks: [
        { name: 'Leuchtturm', value: 150 },
        { name: 'Kölner Dom-Turm', value: 533 },
        { name: 'Eiffelturm zu Fuß', value: 1665 },
        { name: 'Burj Khalifa', value: 2909 },
        { name: 'Niesen-Treppe (Weltrekord)', value: 11674 },
        { name: 'Mount Everest in Stufen', value: 50000 }
      ]
    }
  };

  const DEFAULT_STATE = {
    entries: [], // { id, date: 'YYYY-MM-DD', ts: number, exercise: string, reps: number }
    exercises: structuredClone(DEFAULT_EXERCISES),
    weeklyGoalDays: 5,
    autoLevelUp: true,
    levelUpDays: 5,
    dayCutoffHour: 0,
    pauseMode: false,
    pausedWeeks: [],
    vibration: true,
    theme: 'light',
    themeMigratedToLight: true,
    exercisesMigratedV2: true,
    dismissedLevelUps: {}
  };

  let state = loadState();
  let activeTab = 'today';
  let historyFilter = state.exercises.find((e) => !e.archived)?.id || state.exercises[0]?.id || 'pushups';
  let customModalExerciseId = null;
  let editingExerciseId = null;
  let selectedColorKey = 'blue';

  // --- Helpers ---
  function getEffectiveDate(now = new Date()) {
    const cutoff = state?.dayCutoffHour || 0;
    if (!cutoff) return now;
    return new Date(now.getTime() - cutoff * 3600 * 1000);
  }

  function toDateKey(date = getEffectiveDate()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function addDays(date, delta) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    d.setDate(d.getDate() + delta);
    return d;
  }

  function formatHeaderDate(date = getEffectiveDate()) {
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }

  function formatShortDate(dateKey) {
    const [y, m, d] = dateKey.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit'
    });
  }

  function formatTime(ts) {
    return new Date(ts).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getMondayOfWeek(date = getEffectiveDate()) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
  }

  function formatNumber(n) {
    return Number(n).toLocaleString('de-DE');
  }

  function formatUnit(ex, value, short = false) {
    if (ex.unit === 'sec') {
      return short ? `${formatNumber(value)}s` : `${formatNumber(value)} Sek.`;
    }
    return short ? `${formatNumber(value)}` : `${formatNumber(value)} Wdh.`;
  }

  function unitLabel(ex) {
    return ex.unit === 'sec' ? 'Sek.' : 'Wdh.';
  }

  function getExColors(ex) {
    const palette = COLOR_PALETTE[ex.colorKey] || COLOR_PALETTE.blue;
    return state.theme === 'dark' ? palette.dark : palette.light;
  }

  function getExIcon(ex) {
    return BUILTIN_ICONS[ex.id] || BUILTIN_ICONS.custom;
  }

  function getExMilestones(ex) {
    if (Array.isArray(ex.milestones) && ex.milestones.length) return ex.milestones;
    if (ex.unit === 'sec') return [300, 600, 1800, 3600, 7200, 18000, 36000];
    return [50, 100, 250, 500, 1000, 2500, 5000, 10000];
  }

  function getSuggestedLevelUpStep(ex) {
    if (ex.goal < 20) return 2;
    if (ex.goal < 60) return 5;
    const pctStep = Math.round((ex.goal * 0.12) / 5) * 5;
    return Math.max(5, pctStep);
  }

  function getExerciseById(id) {
    return state.exercises.find((e) => e.id === id);
  }

  function getVisibleExercises() {
    return state.exercises.filter((e) => !e.archived);
  }

  function vibrate(pattern) {
    if (!state.vibration) return;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(pattern);
      } catch {}
    }
  }

  function parseQuickAdds(rawStr, fallback) {
    const nums = String(rawStr || '')
      .split(/[,;\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n) && n >= 1 && n <= 1000);
    const unique = [...new Set(nums)].slice(0, 6);
    return unique.length > 0 ? unique : [...fallback];
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function ensureCurrentWeekPausedIfNeeded() {
    if (!state.pauseMode) return;
    const mondayKey = toDateKey(getMondayOfWeek(getEffectiveDate()));
    if (!state.pausedWeeks.includes(mondayKey)) {
      state.pausedWeeks.push(mondayKey);
      saveState();
    }
  }

  // --- State Persistence & Migration ---
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(DEFAULT_STATE);
      const parsed = JSON.parse(raw);

      let exercises;
      if (Array.isArray(parsed.exercises) && parsed.exercises.length > 0) {
        exercises = parsed.exercises.map((ex) => ({
          unit: 'reps',
          goalType: 'weekly',
          archived: false,
          colorKey: 'blue',
          quickAdds: [5, 10, 15, 20],
          ...ex
        }));
      } else {
        // Seamless migration from v1–v9 (preserves old goals * 5 as weekly goals & custom quickAdds)
        exercises = structuredClone(DEFAULT_EXERCISES).map((ex) => {
          const oldGoal = parsed.goals?.[ex.id];
          const oldQA = parsed.quickAdds?.[ex.id];
          return {
            ...ex,
            goal: oldGoal ? Math.round(oldGoal * 5) : ex.goal,
            quickAdds: Array.isArray(oldQA) && oldQA.length ? oldQA : ex.quickAdds
          };
        });
      }

      const merged = {
        ...structuredClone(DEFAULT_STATE),
        ...parsed,
        exercises,
        pausedWeeks: Array.isArray(parsed.pausedWeeks) ? parsed.pausedWeeks : [],
        dismissedLevelUps: { ...(parsed.dismissedLevelUps || {}) },
        entries: Array.isArray(parsed.entries) ? parsed.entries : []
      };

      if (!parsed.themeMigratedToLight) {
        merged.theme = 'light';
        merged.themeMigratedToLight = true;
      }
      merged.exercisesMigratedV2 = true;
      return merged;
    } catch {
      return structuredClone(DEFAULT_STATE);
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // --- Aggregations ---
  function getDailyMap() {
    const map = {};
    for (const e of state.entries) {
      if (!map[e.date]) {
        map[e.date] = { total: 0 };
      }
      map[e.date][e.exercise] = (map[e.date][e.exercise] || 0) + e.reps;
      map[e.date].total += e.reps;
    }
    return map;
  }

  function getTodayKey() {
    return toDateKey(getEffectiveDate());
  }

  function getWeekTotal(dailyMap, exerciseId, referenceDate = getEffectiveDate()) {
    const monday = getMondayOfWeek(referenceDate);
    let sum = 0;
    for (let i = 0; i < 7; i++) {
      const key = toDateKey(addDays(monday, i));
      sum += dailyMap[key]?.[exerciseId] || 0;
    }
    return sum;
  }

  // Smart average: average of the last N days where this exercise was actually performed (never penalized by rest days)
  function getActiveDayAverage(dailyMap, exerciseId, lastN = 7) {
    const todayKey = getTodayKey();
    const activeVals = Object.entries(dailyMap)
      .filter(([dateKey, data]) => dateKey !== todayKey && (data[exerciseId] || 0) > 0)
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .slice(0, lastN)
      .map(([, data]) => data[exerciseId]);

    if (activeVals.length === 0) {
      const todayVal = dailyMap[todayKey]?.[exerciseId] || 0;
      return todayVal > 0 ? todayVal : 0;
    }
    const sum = activeVals.reduce((acc, v) => acc + v, 0);
    return Math.round(sum / activeVals.length);
  }

  function getExerciseRecords(dailyMap, exerciseId) {
    let bestDay = 0;
    let bestDayBeforeToday = 0;
    const todayKey = getTodayKey();

    for (const [dateKey, data] of Object.entries(dailyMap)) {
      const val = data[exerciseId] || 0;
      if (val > bestDay) bestDay = val;
      if (dateKey !== todayKey && val > bestDayBeforeToday) {
        bestDayBeforeToday = val;
      }
    }

    let maxSet = 0;
    let total = 0;
    for (const e of state.entries) {
      if (e.exercise === exerciseId) {
        total += e.reps;
        if (e.reps > maxSet) maxSet = e.reps;
      }
    }

    return { bestDay, bestDayBeforeToday, maxSet, total };
  }

  function getWeeklyConsistency(dailyMap) {
    const today = getEffectiveDate();
    const monday = getMondayOfWeek(today);
    const todayKey = getTodayKey();
    const days = [];
    const dayLabels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    let activeThisWeek = 0;

    for (let i = 0; i < 7; i++) {
      const d = addDays(monday, i);
      const key = toDateKey(d);
      const active = Boolean(dailyMap[key] && dailyMap[key].total > 0);
      if (active) activeThisWeek++;
      days.push({
        label: dayLabels[i],
        key,
        active,
        isToday: key === todayKey
      });
    }

    let streakWeeks = activeThisWeek >= state.weeklyGoalDays ? 1 : 0;
    let checkMonday = addDays(monday, -7);

    for (let w = 0; w < 52; w++) {
      const weekKey = toDateKey(checkMonday);
      let count = 0;
      for (let i = 0; i < 7; i++) {
        const key = toDateKey(addDays(checkMonday, i));
        if (dailyMap[key] && dailyMap[key].total > 0) count++;
      }
      if (count >= state.weeklyGoalDays) {
        streakWeeks++;
        checkMonday = addDays(checkMonday, -7);
      } else if (state.pausedWeeks.includes(weekKey)) {
        checkMonday = addDays(checkMonday, -7);
      } else {
        break;
      }
    }

    return { days, activeThisWeek, streakWeeks };
  }

  function getLevelUpSuggestions(dailyMap) {
    if (!state.autoLevelUp) return [];
    const requiredDays = Math.min(30, Math.max(2, parseInt(state.levelUpDays, 10) || 5));
    const today = getEffectiveDate();
    const suggestions = [];

    for (const ex of getVisibleExercises()) {
      const goal = ex.goal;
      if (state.dismissedLevelUps[ex.id] === goal) continue;

      if (ex.goalType === 'weekly') {
        // 2 consecutive weeks meeting the weekly goal
        const thisWeek = getWeekTotal(dailyMap, ex.id, today);
        const lastWeek = getWeekTotal(dailyMap, ex.id, addDays(today, -7));
        const twoWeeksAgo = getWeekTotal(dailyMap, ex.id, addDays(today, -14));

        const hitTwoWeeks = (thisWeek >= goal && lastWeek >= goal) || (lastWeek >= goal && twoWeeksAgo >= goal);
        if (hitTwoWeeks) {
          suggestions.push({
            exercise: ex,
            currentGoal: goal,
            nextGoal: goal + getSuggestedLevelUpStep(ex),
            label: '2 Wochen in Folge',
            periodLabel: 'Woche'
          });
        }
      } else {
        // Last N active training days of this exercise all met the daily goal
        const activeDays = Object.entries(dailyMap)
          .filter(([, data]) => (data[ex.id] || 0) > 0)
          .sort(([a], [b]) => (a < b ? 1 : -1))
          .slice(0, requiredDays);

        if (activeDays.length >= requiredDays && activeDays.every(([, data]) => (data[ex.id] || 0) >= goal)) {
          suggestions.push({
            exercise: ex,
            currentGoal: goal,
            nextGoal: goal + getSuggestedLevelUpStep(ex),
            label: `${requiredDays} Trainingstage in Folge`,
            periodLabel: 'Tag'
          });
        }
      }
    }
    return suggestions;
  }

  // --- Core Action: Log a Mini-Set ---
  function logReps(exerciseId, reps) {
    const num = parseInt(reps, 10);
    if (!num || num <= 0) return;

    const ex = getExerciseById(exerciseId);
    if (!ex) return;

    const todayKey = getTodayKey();
    const dailyMapBefore = getDailyMap();
    const prevTodayReps = dailyMapBefore[todayKey]?.[exerciseId] || 0;
    const prevWeekReps = getWeekTotal(dailyMapBefore, exerciseId);
    const prevRecords = getExerciseRecords(dailyMapBefore, exerciseId);
    const goal = ex.goal;

    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: todayKey,
      ts: Date.now(),
      exercise: exerciseId,
      reps: num
    };

    state.entries.push(entry);
    saveState();

    const newTodayReps = prevTodayReps + num;
    const newWeekReps = prevWeekReps + num;
    const newTotal = prevRecords.total + num;

    const hitGoal = ex.goalType === 'weekly'
      ? (prevWeekReps < goal && newWeekReps >= goal)
      : (prevTodayReps < goal && newTodayReps >= goal);

    const hitDailyPR = prevRecords.bestDayBeforeToday > 0 && prevTodayReps <= prevRecords.bestDayBeforeToday && newTodayReps > prevRecords.bestDayBeforeToday;
    const hitMaxSet = prevRecords.maxSet > 0 && num > prevRecords.maxSet;
    const milestones = getExMilestones(ex);
    const unlockedMilestone = milestones.find((m) => prevRecords.total < m && newTotal >= m);

    renderAll();

    const cardEl = document.querySelector(`.exercise-card[data-ex="${exerciseId}"]`);
    if (cardEl) {
      cardEl.classList.remove('pulse');
      void cardEl.offsetWidth;
      cardEl.classList.add('pulse');
    }

    if (unlockedMilestone) {
      vibrate([25, 45, 35]);
      triggerConfetti();
      showToast(`🏆 Meilenstein: ${formatUnit(ex, unlockedMilestone)} ${ex.name} gesamt!`, { celebrate: true, undoId: entry.id });
    } else if (hitGoal) {
      vibrate([20, 40, 30]);
      triggerConfetti();
      const goalWord = ex.goalType === 'weekly' ? 'Wochenziel' : 'Tagesziel';
      const valNow = ex.goalType === 'weekly' ? newWeekReps : newTodayReps;
      showToast(`🎉 ${goalWord} für ${ex.name} erreicht (${valNow}/${goal})!`, { celebrate: true, undoId: entry.id });
    } else if (hitDailyPR) {
      vibrate([20, 40, 30]);
      triggerConfetti();
      showToast(`🔥 Neuer Tagesrekord bei ${ex.name}: ${formatUnit(ex, newTodayReps)}!`, { celebrate: true, undoId: entry.id });
    } else if (hitMaxSet) {
      vibrate([20, 35, 20]);
      showToast(`💪 Neues bestes Einzel-Set: ${formatUnit(ex, num)} ${ex.name}!`, { celebrate: true, undoId: entry.id });
    } else {
      vibrate(15);
      showToast(`+${formatUnit(ex, num, true)} ${ex.name} gespeichert`, { undoId: entry.id });
    }
  }

  function deleteEntry(entryId) {
    const idx = state.entries.findIndex((e) => e.id === entryId);
    if (idx === -1) return;
    state.entries.splice(idx, 1);
    saveState();
    renderAll();
  }

  // --- Rendering ---
  function renderAll() {
    const dailyMap = getDailyMap();
    // Ensure historyFilter points to an existing exercise
    if (!getExerciseById(historyFilter)) {
      historyFilter = getVisibleExercises()[0]?.id || state.exercises[0]?.id || 'pushups';
    }
    renderHeader(dailyMap);
    renderTodayView(dailyMap);
    renderHistoryView(dailyMap);
    renderMilestonesView(dailyMap);
  }

  function renderHeader(dailyMap) {
    document.getElementById('header-date').textContent = formatHeaderDate(getEffectiveDate());
    const { activeThisWeek } = getWeeklyConsistency(dailyMap);
    const pill = document.getElementById('header-streak-pill');
    const flame = pill.querySelector('.streak-flame');
    const text = document.getElementById('header-streak-text');
    if (state.pauseMode) {
      pill.classList.add('is-paused');
      flame.textContent = '⏸️';
      text.textContent = 'Pausiert';
      pill.title = 'Urlaubs-/Krankheitsmodus aktiv – Wochen-Serie geschützt';
    } else {
      pill.classList.remove('is-paused');
      flame.textContent = '🔥';
      text.textContent = `${activeThisWeek}/${state.weeklyGoalDays} Woche`;
      pill.title = 'Aktive Tage diese Woche';
    }
  }

  function renderTodayView(dailyMap) {
    const todayKey = getTodayKey();
    const todayData = dailyMap[todayKey] || { total: 0 };

    // Pause Mode Banner
    const pauseContainer = document.getElementById('pause-banner-container');
    if (state.pauseMode) {
      pauseContainer.innerHTML = `
        <div class="pause-banner">
          <span>⏸️ <strong>Serie pausiert</strong> (Urlaub/Krankheit)</span>
          <button id="btn-end-pause" class="btn-secondary" style="padding: 6px 10px; font-size: 0.78rem;">Beenden</button>
        </div>
      `;
      document.getElementById('btn-end-pause').onclick = () => {
        state.pauseMode = false;
        saveState();
        renderAll();
        showToast('Pausenmodus beendet – weiter geht’s!');
      };
    } else {
      pauseContainer.innerHTML = '';
    }

    // Progression Suggestions
    const bannerContainer = document.getElementById('progression-banner-container');
    const suggestions = getLevelUpSuggestions(dailyMap);
    if (suggestions.length > 0) {
      const s = suggestions[0];
      bannerContainer.innerHTML = `
        <div class="progression-banner">
          <div class="progression-text">
            🚀 <strong>${s.label}</strong> dein ${escapeHtml(s.exercise.name)}-Ziel (${s.currentGoal}) geschafft! Bereit für <strong>${s.nextGoal} / ${s.periodLabel}</strong>?
          </div>
          <div class="progression-actions">
            <button class="btn-primary" id="btn-accept-levelup" style="padding: 8px 12px; font-size: 0.82rem;">Auf ${s.nextGoal} erhöhen</button>
            <button class="btn-secondary" id="btn-dismiss-levelup" style="padding: 8px 12px; font-size: 0.82rem;">Später</button>
          </div>
        </div>
      `;
      document.getElementById('btn-accept-levelup').onclick = () => {
        s.exercise.goal = s.nextGoal;
        delete state.dismissedLevelUps[s.exercise.id];
        saveState();
        renderAll();
        showToast(`Neues Ziel für ${s.exercise.name}: ${s.nextGoal} / ${s.periodLabel}!`, { celebrate: true });
      };
      document.getElementById('btn-dismiss-levelup').onclick = () => {
        state.dismissedLevelUps[s.exercise.id] = s.currentGoal;
        saveState();
        renderAll();
      };
    } else {
      bannerContainer.innerHTML = '';
    }

    // Exercise Cards
    const cardsContainer = document.getElementById('exercise-cards');
    const visibleExercises = getVisibleExercises();

    if (visibleExercises.length === 0) {
      cardsContainer.innerHTML = `<div class="empty-state">Alle Übungen sind ausgeblendet. Öffne oben rechts die Einstellungen (⚙️), um Übungen einzublenden oder neu anzulegen.</div>`;
    } else {
      cardsContainer.innerHTML = visibleExercises.map((ex) => {
        const colors = getExColors(ex);
        const todayVal = todayData[ex.id] || 0;
        const weekVal = getWeekTotal(dailyMap, ex.id);
        const goal = ex.goal;
        const isWeekly = ex.goalType === 'weekly';
        const progressVal = isWeekly ? weekVal : todayVal;
        const pct = Math.min(100, Math.round((progressVal / Math.max(goal, 1)) * 100));
        const activeAvg = getActiveDayAverage(dailyMap, ex.id);
        const records = getExerciseRecords(dailyMap, ex.id);
        const goalReached = progressVal >= goal;

        let metaText = '';
        if (todayVal > records.bestDayBeforeToday && records.bestDayBeforeToday > 0) {
          metaText = `🏆 <strong>Neuer Tagesrekord!</strong> (bisher ${formatUnit(ex, records.bestDayBeforeToday, true)})`;
        } else if (goalReached) {
          metaText = `✓ ${isWeekly ? 'Wochenziel' : 'Tagesziel'} erreicht` + (activeAvg > 0 ? ` · Ø ${formatUnit(ex, activeAvg, true)}/Tag` : '');
        } else {
          const remaining = goal - progressVal;
          metaText = `Noch <strong>${formatUnit(ex, remaining, true)}</strong> ${isWeekly ? 'diese Woche' : 'heute'}` + (activeAvg > 0 ? ` · Ø ${formatUnit(ex, activeAvg, true)}/Tag` : '');
        }

        const quickAddList = Array.isArray(ex.quickAdds) && ex.quickAdds.length ? ex.quickAdds : [5, 10, 15, 20];
        const quickBtns = quickAddList
          .map((val) => `<button class="quick-btn" data-ex="${ex.id}" data-reps="${val}">+${formatUnit(ex, val, true)}</button>`)
          .join('');

        const counterHtml = isWeekly
          ? `<div class="ex-current">${formatUnit(ex, todayVal, true)}</div><div class="ex-goal">heute</div>`
          : `<div class="ex-current">${formatUnit(ex, todayVal, true)}</div><div class="ex-goal">/ ${formatUnit(ex, goal, true)}</div>`;

        const progressRowHtml = isWeekly
          ? `<div class="ex-progress-row"><span>Woche: <strong>${formatUnit(ex, weekVal, true)}</strong> / ${formatUnit(ex, goal, true)}</span><span>${pct}%</span></div>`
          : '';

        const timerBtnHtml = ex.unit === 'sec'
          ? `<button type="button" class="ex-timer-btn" data-timer-ex="${ex.id}" title="Timer für ${escapeHtml(ex.name)} starten">⏱️ Timer</button>`
          : '';

        return `
          <article class="exercise-card ${goalReached ? 'goal-reached' : ''}" data-ex="${ex.id}" style="--ex-color: ${colors.color}; --ex-soft: ${colors.soft}; --ex-border: ${colors.border};">
            <div class="ex-top">
              <div class="ex-title-group">
                <div class="ex-icon-badge">${getExIcon(ex)}</div>
                <div>
                  <div class="ex-name">${escapeHtml(ex.name)}${timerBtnHtml}</div>
                  <div class="ex-meta">${metaText}</div>
                </div>
              </div>
              <div class="ex-counter">
                ${counterHtml}
              </div>
            </div>
            ${progressRowHtml}
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${pct}%; background: ${colors.color};"></div>
            </div>
            <div class="quick-add-row" style="grid-template-columns: repeat(${quickAddList.length + 1}, 1fr);">
              ${quickBtns}
              <button class="quick-btn quick-btn-custom" data-custom-ex="${ex.id}" title="Eigene Zahl eingeben" aria-label="Eigene Anzahl für ${escapeHtml(ex.name)}">…</button>
            </div>
          </article>
        `;
      }).join('');

      cardsContainer.querySelectorAll('[data-reps]').forEach((btn) => {
        btn.addEventListener('click', () => {
          logReps(btn.dataset.ex, btn.dataset.reps);
        });
      });

      cardsContainer.querySelectorAll('[data-custom-ex]').forEach((btn) => {
        btn.addEventListener('click', () => openCustomModal(btn.dataset.customEx));
      });

      cardsContainer.querySelectorAll('[data-timer-ex]').forEach((btn) => {
        btn.addEventListener('click', () => openTimerModal(btn.dataset.timerEx));
      });
    }

    // Today's Mini-Set Log
    const todayEntries = state.entries
      .filter((e) => e.date === todayKey)
      .sort((a, b) => b.ts - a.ts);

    document.getElementById('today-sets-count').textContent = `${todayEntries.length} ${todayEntries.length === 1 ? 'Set' : 'Sets'}`;

    const logList = document.getElementById('today-log-list');
    if (todayEntries.length === 0) {
      logList.innerHTML = `<div class="empty-state">Noch keine Mini-Sets heute erfasst. Tipp oben auf eine Zahl, um loszulegen!</div>`;
    } else {
      logList.innerHTML = todayEntries.map((entry) => {
        const ex = getExerciseById(entry.exercise) || { name: entry.exercise, colorKey: 'blue', unit: 'reps' };
        const colors = getExColors(ex);
        return `
          <div class="log-item">
            <div class="log-left">
              <span class="log-dot" style="background: ${colors.color};"></span>
              <div>
                <div class="log-name">${escapeHtml(ex.name)}</div>
                <div class="log-time">${formatTime(entry.ts)} Uhr</div>
              </div>
            </div>
            <div class="log-right">
              <span class="log-reps" style="color: ${colors.color};">+${formatUnit(ex, entry.reps, true)}</span>
              <button class="log-delete-btn" data-delete-id="${entry.id}" title="Eintrag löschen" aria-label="Eintrag löschen">✕</button>
            </div>
          </div>
        `;
      }).join('');

      logList.querySelectorAll('[data-delete-id]').forEach((btn) => {
        btn.addEventListener('click', () => deleteEntry(btn.dataset.deleteId));
      });
    }
  }

  function renderHistoryView(dailyMap) {
    // 1. Weekly Consistency
    const { days, activeThisWeek, streakWeeks } = getWeeklyConsistency(dailyMap);
    document.getElementById('week-consistency-subtitle').textContent = state.pauseMode
      ? `⏸️ Serie pausiert · ${activeThisWeek} von ${state.weeklyGoalDays} Tagen diese Woche`
      : `${activeThisWeek} von ${state.weeklyGoalDays} aktiven Tagen diese Woche`;
    document.getElementById('weeks-streak-count').textContent = streakWeeks;

    document.getElementById('week-days-row').innerHTML = days.map((d) => `
      <div class="week-day-pill ${d.active ? 'is-active' : ''} ${d.isToday ? 'is-today' : ''}">
        <span>${d.label}</span>
        <div class="week-day-dot">${d.active ? '✓' : ''}</div>
      </div>
    `).join('');

    // 2. Dynamic Filter Pills (visible exercises + archived exercises with entries)
    const historyExercises = state.exercises.filter((ex) => {
      if (!ex.archived) return true;
      return state.entries.some((e) => e.exercise === ex.id);
    });
    if (!historyExercises.some((e) => e.id === historyFilter) && historyExercises.length > 0) {
      historyFilter = historyExercises[0].id;
    }

    const pillsContainer = document.getElementById('history-filter-pills');
    pillsContainer.innerHTML = historyExercises.map((ex) => {
      const c = getExColors(ex);
      return `
        <button class="filter-pill ${ex.id === historyFilter ? 'active' : ''}" data-filter="${ex.id}" style="--pill-color: ${c.color}; --pill-soft: ${c.soft}; --pill-border: ${c.border};">${escapeHtml(ex.name)}</button>
      `;
    }).join('');

    pillsContainer.querySelectorAll('.filter-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        historyFilter = pill.dataset.filter;
        renderHistoryView(getDailyMap());
      });
    });

    // 3. 14-Day Bar Chart
    const today = getEffectiveDate();
    const filterEx = getExerciseById(historyFilter) || historyExercises[0];
    if (!filterEx) return;
    const colors = getExColors(filterEx);
    const activeAvg = getActiveDayAverage(dailyMap, filterEx.id);

    document.getElementById('chart-avg-subtitle').textContent =
      `Ø pro Trainingstag: ${formatUnit(filterEx, activeAvg)}`;

    const bars = [];
    let maxVal = Math.max(activeAvg, 1);
    for (let i = 13; i >= 0; i--) {
      const d = addDays(today, -i);
      const key = toDateKey(d);
      const val = dailyMap[key]?.[filterEx.id] || 0;
      if (val > maxVal) maxVal = val;
      bars.push({
        key,
        dayNum: d.getDate(),
        val,
        isToday: i === 0
      });
    }

    const chartContainer = document.getElementById('bar-chart-container');
    const trackHeightPx = 118;
    const avgPx = Math.round((activeAvg / maxVal) * trackHeightPx);
    const avgLineHtml = activeAvg > 0
      ? `<div class="chart-avg-line" style="bottom: ${22 + avgPx}px;"></div>`
      : '';

    chartContainer.innerHTML = avgLineHtml + bars.map((b) => {
      const barPx = b.val > 0 ? Math.max(4, Math.round((b.val / maxVal) * trackHeightPx)) : 3;
      return `
        <div class="bar-col" title="${formatShortDate(b.key)}: ${formatUnit(filterEx, b.val)}">
          <span class="bar-value-tip">${b.val > 0 ? b.val : ''}</span>
          <div class="bar-track">
            <div class="bar-fill" style="height: ${barPx}px; background: ${b.val > 0 ? colors.color : 'var(--surface-elevated)'}; opacity: ${b.isToday ? 1 : 0.82};"></div>
          </div>
          <span class="bar-label" style="${b.isToday ? 'color: var(--text); font-weight: 700;' : ''}">${b.dayNum}</span>
        </div>
      `;
    }).join('');

    // 4. 12-Week Activity Heatmap
    const heatmapContainer = document.getElementById('heatmap-container');
    heatmapContainer.style.setProperty('--hm-color', colors.color);

    const currentMonday = getMondayOfWeek(today);
    const startMonday = addDays(currentMonday, -7 * 11);
    const todayKey = getTodayKey();
    // Reference daily benchmark for heatmap intensity
    const dailyBenchmark = filterEx.goalType === 'weekly'
      ? Math.max(1, Math.round(filterEx.goal / Math.max(state.weeklyGoalDays, 3)))
      : Math.max(1, filterEx.goal);

    let weeksHtml = '';
    for (let w = 0; w < 12; w++) {
      let cellsHtml = '';
      for (let d = 0; d < 7; d++) {
        const cellDate = addDays(startMonday, w * 7 + d);
        const key = toDateKey(cellDate);
        if (key > todayKey) {
          cellsHtml += `<span class="hm-cell hm-future"></span>`;
          continue;
        }
        const val = dailyMap[key]?.[filterEx.id] || 0;
        let level = 0;
        if (val > 0) {
          const ratio = val / dailyBenchmark;
          if (ratio >= 1) level = 4;
          else if (ratio >= 0.65) level = 3;
          else if (ratio >= 0.3) level = 2;
          else level = 1;
        }
        cellsHtml += `<button class="hm-cell hm-l${level}" data-hm-date="${key}" data-hm-val="${val}" aria-label="${formatShortDate(key)}: ${formatUnit(filterEx, val)}"></button>`;
      }
      weeksHtml += `<div class="hm-week-col">${cellsHtml}</div>`;
    }
    heatmapContainer.innerHTML = weeksHtml;

    heatmapContainer.querySelectorAll('[data-hm-date]').forEach((cell) => {
      cell.addEventListener('click', () => {
        document.getElementById('heatmap-tooltip').textContent =
          `${formatShortDate(cell.dataset.hmDate)} · ${filterEx.name}: ${formatUnit(filterEx, cell.dataset.hmVal)}`;
      });
    });

    // 5. Personal Records
    const recordsGrid = document.getElementById('records-grid');
    recordsGrid.innerHTML = historyExercises.map((ex) => {
      const c = getExColors(ex);
      const rec = getExerciseRecords(dailyMap, ex.id);
      const avg = getActiveDayAverage(dailyMap, ex.id);
      return `
        <div class="record-row">
          <div class="record-ex" style="color: ${c.color};">${escapeHtml(ex.name)}</div>
          <div class="record-stat">
            <span class="record-val">${formatUnit(ex, rec.bestDay, true)}</span>
            <span class="record-lbl">Tages-PR</span>
          </div>
          <div class="record-stat">
            <span class="record-val">${formatUnit(ex, rec.maxSet, true)}</span>
            <span class="record-lbl">Max-Set</span>
          </div>
          <div class="record-stat">
            <span class="record-val">${formatUnit(ex, avg, true)}</span>
            <span class="record-lbl">Ø Tag</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderMilestonesView(dailyMap) {
    const totals = {};
    for (const ex of state.exercises) {
      totals[ex.id] = getExerciseRecords(dailyMap, ex.id).total;
    }

    // Tangible Comparisons for built-in exercises (if visible or has entries)
    const comparisonsEl = document.getElementById('comparisons-list');
    const compExercises = state.exercises.filter((ex) => COMPARISONS[ex.id] && (!ex.archived || totals[ex.id] > 0));

    comparisonsEl.innerHTML = compExercises.map((ex) => {
      const cfg = COMPARISONS[ex.id];
      const colors = getExColors(ex);
      const currentVal = +(totals[ex.id] * cfg.factor).toFixed(1);
      const lastLandmark = cfg.landmarks[cfg.landmarks.length - 1];
      const nextLandmark = cfg.landmarks.find((l) => currentVal < l.value) || lastLandmark;
      const reachedLandmarks = cfg.landmarks.filter((l) => l.value <= currentVal);
      const prevVal = reachedLandmarks.length ? reachedLandmarks[reachedLandmarks.length - 1].value : 0;

      const pct = currentVal >= lastLandmark.value
        ? 100
        : Math.min(100, Math.round(((currentVal - prevVal) / (nextLandmark.value - prevVal)) * 100));

      const remaining = +(nextLandmark.value - currentVal).toFixed(1);
      const nextText = currentVal >= lastLandmark.value
        ? cfg.maxReachedText
        : `Nächstes Ziel: <strong>${nextLandmark.name}</strong> (${cfg.formatValue(nextLandmark.value)}) · noch ${cfg.formatValue(remaining)}`;

      return `
        <div class="card" style="--ex-color: ${colors.color}; --ex-soft: ${colors.soft}; --ex-border: ${colors.border}; background: ${colors.soft}; border: 1.5px solid ${colors.border}; border-left: 5px solid ${colors.color};">
          <div class="card-header-row">
            <div>
              <h2 class="card-title">${cfg.emoji} ${cfg.title}</h2>
              <p class="card-subtitle">${cfg.subtitle}</p>
            </div>
            <span class="altitude-value" style="color: ${colors.color};">${cfg.formatValue(currentVal)}</span>
          </div>
          <div class="progress-bar-bg" style="margin-top: 10px;">
            <div class="progress-bar-fill" style="width: ${pct}%; background: ${colors.color};"></div>
          </div>
          <div class="altitude-next">${nextText}</div>
        </div>
      `;
    }).join('');

    // Milestones per Exercise
    const milestoneExercises = state.exercises.filter((ex) => !ex.archived || totals[ex.id] > 0);
    const list = document.getElementById('milestones-list');
    list.innerHTML = milestoneExercises.map((ex) => {
      const colors = getExColors(ex);
      const total = totals[ex.id] || 0;
      const tiers = getExMilestones(ex);
      const nextMs = tiers.find((m) => total < m) || tiers[tiers.length - 1];
      const pct = Math.min(100, Math.round((total / nextMs) * 100));

      const badgesHtml = tiers.map((m) => `
        <span class="ms-badge ${total >= m ? 'unlocked' : ''}">${total >= m ? '✓ ' : ''}${formatUnit(ex, m, true)}</span>
      `).join('');

      return `
        <div class="card" style="--ex-color: ${colors.color}; --ex-soft: ${colors.soft}; --ex-border: ${colors.border}; border-left: 4px solid ${colors.color};">
          <div class="milestone-card-header">
            <div class="ex-title-group">
              <div class="ex-icon-badge" style="width: 34px; height: 34px;">${getExIcon(ex)}</div>
              <div>
                <div class="card-title">${escapeHtml(ex.name)}</div>
                <div class="card-subtitle">${formatNumber(total)} / ${formatNumber(nextMs)} ${unitLabel(ex)} (${pct}%)</div>
              </div>
            </div>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${pct}%; background: ${colors.color};"></div>
          </div>
          <div class="milestone-badges">${badgesHtml}</div>
        </div>
      `;
    }).join('');
  }

  // --- Settings & Exercise Manager ---
  function renderSettingsExercisesList() {
    const container = document.getElementById('settings-exercises-list');
    container.innerHTML = state.exercises.map((ex) => {
      const colors = getExColors(ex);
      const goalPeriod = ex.goalType === 'weekly' ? 'Woche' : 'Tag';
      return `
        <div class="settings-ex-item ${ex.archived ? 'is-archived' : ''}">
          <div class="settings-ex-left">
            <span class="settings-ex-dot" style="background: ${colors.color};"></span>
            <div style="min-width: 0;">
              <div class="settings-ex-name">${escapeHtml(ex.name)} ${ex.archived ? '(ausgeblendet)' : ''}</div>
              <div class="settings-ex-sub">${formatUnit(ex, ex.goal)} / ${goalPeriod} · [${ex.quickAdds.join(', ')}]</div>
            </div>
          </div>
          <div class="settings-ex-actions">
            <button type="button" class="btn-chip" data-edit-ex="${ex.id}">Bearbeiten</button>
            <button type="button" class="btn-chip" data-archive-ex="${ex.id}">${ex.archived ? 'Einblenden' : 'Ausblenden'}</button>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('[data-edit-ex]').forEach((btn) => {
      btn.addEventListener('click', () => openExerciseModal(btn.dataset.editEx));
    });

    container.querySelectorAll('[data-archive-ex]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ex = getExerciseById(btn.dataset.archiveEx);
        if (!ex) return;
        ex.archived = !ex.archived;
        saveState();
        renderSettingsExercisesList();
        renderAll();
        showToast(ex.archived ? `${ex.name} ausgeblendet (Daten bleiben erhalten)` : `${ex.name} wieder eingeblendet`);
      });
    });
  }

  function renderColorPicker() {
    const picker = document.getElementById('ex-color-picker');
    picker.innerHTML = Object.entries(COLOR_PALETTE).map(([key, cfg]) => {
      const hex = state.theme === 'dark' ? cfg.dark.color : cfg.light.color;
      return `<button type="button" class="color-swatch ${key === selectedColorKey ? 'selected' : ''}" data-color-key="${key}" style="background: ${hex};" aria-label="${cfg.name}" title="${cfg.name}"></button>`;
    }).join('');

    picker.querySelectorAll('[data-color-key]').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedColorKey = btn.dataset.colorKey;
        renderColorPicker();
      });
    });
  }

  function updateExerciseGoalLabel() {
    const type = document.getElementById('ex-edit-goal-type').value;
    const unit = document.getElementById('ex-edit-unit').value;
    const unitTxt = unit === 'sec' ? 'Sek.' : 'Wdh.';
    document.getElementById('ex-edit-goal-label').textContent =
      `${type === 'weekly' ? 'Wochenziel' : 'Tagesziel'} (${unitTxt})`;
  }

  function openExerciseModal(exerciseId = null) {
    editingExerciseId = exerciseId;
    const ex = exerciseId ? getExerciseById(exerciseId) : null;

    document.getElementById('exercise-modal-title').textContent = ex ? `${ex.name} bearbeiten` : 'Neue Übung hinzufügen';
    document.getElementById('ex-edit-name').value = ex ? ex.name : '';
    document.getElementById('ex-edit-unit').value = ex ? ex.unit : 'reps';
    document.getElementById('ex-edit-goal-type').value = ex ? ex.goalType : 'weekly';
    document.getElementById('ex-edit-goal').value = ex ? ex.goal : 100;
    document.getElementById('ex-edit-quickadds').value = ex ? ex.quickAdds.join(', ') : '5, 10, 15, 20';

    // Pick a nice unused color for new exercises
    if (ex) {
      selectedColorKey = ex.colorKey || 'blue';
    } else {
      const used = new Set(state.exercises.map((e) => e.colorKey));
      const free = Object.keys(COLOR_PALETTE).find((k) => !used.has(k));
      selectedColorKey = free || 'blue';
    }

    renderColorPicker();
    updateExerciseGoalLabel();
    document.getElementById('exercise-modal').classList.remove('hidden');
    if (!ex) {
      setTimeout(() => document.getElementById('ex-edit-name').focus(), 60);
    }
  }

  // --- Modals & Navigation ---
  function switchTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.tab-view').forEach((el) => el.classList.remove('active'));
    document.getElementById(`view-${tab}`).classList.add('active');
    document.querySelectorAll('.nav-item').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function openCustomModal(exerciseId) {
    customModalExerciseId = exerciseId;
    const ex = getExerciseById(exerciseId);
    if (!ex) return;
    document.getElementById('custom-modal-title').textContent = `${ex.name} hinzufügen`;
    const labelEl = document.querySelector('label[for="custom-reps-input"]');
    if (labelEl) {
      labelEl.textContent = ex.unit === 'sec'
        ? 'Wie viele Sekunden hast du geschafft?'
        : 'Wie viele Wiederholungen hast du geschafft?';
    }
    const input = document.getElementById('custom-reps-input');
    input.value = '';
    document.getElementById('custom-modal').classList.remove('hidden');
    setTimeout(() => input.focus(), 60);
  }

  function updateLevelUpDaysRow() {
    const enabled = document.getElementById('toggle-auto-levelup').checked;
    document.getElementById('row-levelup-days').classList.toggle('is-disabled', !enabled);
  }

  function openSettingsModal() {
    renderSettingsExercisesList();
    document.getElementById('goal-weekly-days').value = state.weeklyGoalDays;
    document.getElementById('toggle-auto-levelup').checked = Boolean(state.autoLevelUp);
    document.getElementById('input-levelup-days').value = state.levelUpDays || 5;
    updateLevelUpDaysRow();

    document.getElementById('select-day-cutoff').value = String(state.dayCutoffHour || 0);
    document.getElementById('toggle-pause-mode').checked = Boolean(state.pauseMode);
    document.getElementById('toggle-vibration').checked = Boolean(state.vibration);

    updateThemeButton();
    document.getElementById('settings-modal').classList.remove('hidden');
  }

  function closeModal(id) {
    if (id === 'timer-modal') {
      stopTimerCompletely();
    }
    document.getElementById(id).classList.add('hidden');
  }

  // --- Hold Timer (Stopwatch & Countdown + 3s Prep + Audio + Wake Lock) ---
  const TIMER_RING_CIRCUMFERENCE = 2 * Math.PI * 78;
  const timerState = {
    mode: 'stopwatch', // 'stopwatch' | 'countdown'
    targetSec: 60,
    elapsedMs: 0,
    status: 'idle', // 'idle' | 'prep' | 'running' | 'paused' | 'done'
    prepRemaining: 0,
    startedAt: 0,
    intervalId: null,
    prepTimeoutId: null,
    exerciseId: null,
    audioCtx: null,
    wakeLock: null
  };

  function formatTimerClock(totalSec) {
    const s = Math.max(0, Math.floor(totalSec));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function playBeep(freq = 660, durationMs = 110, volume = 0.16) {
    const soundOn = document.getElementById('timer-sound-toggle')?.checked;
    if (!soundOn) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!timerState.audioCtx) {
        timerState.audioCtx = new AudioCtx();
      }
      if (timerState.audioCtx.state === 'suspended') {
        timerState.audioCtx.resume();
      }
      const osc = timerState.audioCtx.createOscillator();
      const gain = timerState.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(volume, timerState.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, timerState.audioCtx.currentTime + durationMs / 1000);
      osc.connect(gain);
      gain.connect(timerState.audioCtx.destination);
      osc.start();
      osc.stop(timerState.audioCtx.currentTime + durationMs / 1000);
    } catch {}
  }

  async function requestWakeLock() {
    try {
      if ('wakeLock' in navigator && !timerState.wakeLock) {
        timerState.wakeLock = await navigator.wakeLock.request('screen');
      }
    } catch {}
  }

  function releaseWakeLock() {
    try {
      if (timerState.wakeLock) {
        timerState.wakeLock.release();
        timerState.wakeLock = null;
      }
    } catch {}
  }

  function setTimerRing(ratio, colorOverride = null) {
    const ring = document.getElementById('timer-ring-fill');
    if (!ring) return;
    const clamped = Math.min(Math.max(ratio, 0), 1);
    ring.style.strokeDasharray = `${TIMER_RING_CIRCUMFERENCE}`;
    ring.style.strokeDashoffset = `${TIMER_RING_CIRCUMFERENCE * (1 - clamped)}`;
    ring.style.stroke = colorOverride || 'var(--accent)';
  }

  function getTimerElapsedSeconds() {
    let ms = timerState.elapsedMs;
    if (timerState.status === 'running') {
      ms += Date.now() - timerState.startedAt;
    }
    return Math.floor(ms / 1000);
  }

  function renderTimerUI() {
    const displayEl = document.getElementById('timer-display');
    const statusEl = document.getElementById('timer-status-text');
    const startBtn = document.getElementById('btn-timer-start');
    const presetsWrap = document.getElementById('timer-presets-wrap');
    const logBox = document.getElementById('timer-log-box');

    // Mode buttons & presets visibility
    document.querySelectorAll('[data-timer-mode]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.timerMode === timerState.mode);
    });
    presetsWrap.classList.toggle('hidden', timerState.mode !== 'countdown');

    const activeEx = timerState.exerciseId ? getExerciseById(timerState.exerciseId) : null;
    const accentColor = activeEx ? getExColors(activeEx).color : 'var(--accent)';

    const elapsedSec = getTimerElapsedSeconds();

    if (timerState.status === 'prep') {
      displayEl.textContent = String(timerState.prepRemaining);
      statusEl.textContent = 'Mach dich bereit…';
      startBtn.textContent = 'Abbrechen';
      setTimerRing((3 - timerState.prepRemaining + 1) / 3, '#f59e0b');
    } else if (timerState.mode === 'stopwatch') {
      displayEl.textContent = formatTimerClock(elapsedSec);
      const cycleRatio = elapsedSec === 0 ? 0 : ((elapsedSec % 60) || 60) / 60;
      setTimerRing(cycleRatio, accentColor);
      if (timerState.status === 'running') {
        statusEl.textContent = 'Läuft…';
        startBtn.textContent = 'Pause';
      } else if (timerState.status === 'paused') {
        statusEl.textContent = 'Pausiert';
        startBtn.textContent = 'Weiter';
      } else {
        statusEl.textContent = 'Bereit';
        startBtn.textContent = 'Start';
      }
    } else {
      // Countdown mode
      const remainingSec = Math.max(0, timerState.targetSec - elapsedSec);
      displayEl.textContent = formatTimerClock(remainingSec);
      const ratio = timerState.targetSec > 0 ? remainingSec / timerState.targetSec : 0;
      setTimerRing(ratio, timerState.status === 'done' ? 'var(--success)' : accentColor);
      if (timerState.status === 'running') {
        statusEl.textContent = 'Halten…';
        startBtn.textContent = 'Pause';
      } else if (timerState.status === 'paused') {
        statusEl.textContent = 'Pausiert';
        startBtn.textContent = 'Weiter';
      } else if (timerState.status === 'done') {
        statusEl.textContent = 'Geschafft! 🎉';
        startBtn.textContent = 'Nochmal';
      } else {
        statusEl.textContent = 'Bereit';
        startBtn.textContent = 'Start';
      }
    }

    // Direct 1-tap log box when stopped/paused/done with >= 1 sec elapsed
    const secExercises = getVisibleExercises().filter((e) => e.unit === 'sec');
    const canLog = elapsedSec >= 1 && (timerState.status === 'paused' || timerState.status === 'done');

    if (canLog && secExercises.length > 0) {
      if (!timerState.exerciseId || !secExercises.some((e) => e.id === timerState.exerciseId)) {
        timerState.exerciseId = secExercises[0].id;
      }
      const chosen = getExerciseById(timerState.exerciseId) || secExercises[0];
      const selectHtml = secExercises.length > 1
        ? `<select id="timer-log-select" class="select-setting-input" style="flex: 1;">${secExercises.map((e) => `<option value="${e.id}" ${e.id === chosen.id ? 'selected' : ''}>${escapeHtml(e.name)}</option>`).join('')}</select>`
        : '';

      logBox.innerHTML = `
        ${selectHtml ? `<div class="timer-log-row">${selectHtml}</div>` : ''}
        <button type="button" id="btn-timer-log-save" class="btn-primary" style="width: 100%; background: ${getExColors(chosen).color};">+${elapsedSec}s bei ${escapeHtml(chosen.name)} eintragen</button>
      `;
      logBox.classList.remove('hidden');

      const sel = document.getElementById('timer-log-select');
      if (sel) {
        sel.onchange = () => {
          timerState.exerciseId = sel.value;
          renderTimerUI();
        };
      }
      document.getElementById('btn-timer-log-save').onclick = () => {
        logReps(chosen.id, elapsedSec);
        closeModal('timer-modal');
      };
    } else if (canLog && secExercises.length === 0) {
      logBox.innerHTML = `<div class="setting-hint" style="text-align: center;">Gemessen: <strong>${elapsedSec} Sek.</strong> · Tipp: Lege unter ⚙️ eine Sekunden-Übung (z. B. Plank) an, um Zeiten direkt zu speichern.</div>`;
      logBox.classList.remove('hidden');
    } else {
      logBox.classList.add('hidden');
    }
  }

  function clearTimerHandles() {
    if (timerState.intervalId) {
      clearInterval(timerState.intervalId);
      timerState.intervalId = null;
    }
    if (timerState.prepTimeoutId) {
      clearTimeout(timerState.prepTimeoutId);
      timerState.prepTimeoutId = null;
    }
  }

  function stopTimerCompletely() {
    clearTimerHandles();
    releaseWakeLock();
    if (timerState.status === 'running') {
      timerState.elapsedMs += Date.now() - timerState.startedAt;
      timerState.status = 'paused';
    } else if (timerState.status === 'prep') {
      timerState.status = 'idle';
    }
  }

  function resetTimer() {
    clearTimerHandles();
    releaseWakeLock();
    timerState.elapsedMs = 0;
    timerState.status = 'idle';
    timerState.prepRemaining = 0;
    renderTimerUI();
  }

  function beginRunningTimer() {
    timerState.status = 'running';
    timerState.startedAt = Date.now();
    playBeep(880, 180, 0.2);
    vibrate(35);
    requestWakeLock();
    renderTimerUI();

    clearTimerHandles();
    timerState.intervalId = setInterval(() => {
      const elapsedSec = getTimerElapsedSeconds();
      if (timerState.mode === 'countdown' && elapsedSec >= timerState.targetSec) {
        timerState.elapsedMs = timerState.targetSec * 1000;
        timerState.status = 'done';
        clearTimerHandles();
        releaseWakeLock();
        playBeep(880, 150, 0.22);
        setTimeout(() => playBeep(1175, 240, 0.22), 180);
        vibrate([40, 60, 40, 60, 80]);
        renderTimerUI();
        return;
      }
      renderTimerUI();
    }, 200);
  }

  function startOrPauseTimer() {
    if (timerState.status === 'running') {
      timerState.elapsedMs += Date.now() - timerState.startedAt;
      timerState.status = 'paused';
      clearTimerHandles();
      releaseWakeLock();
      vibrate(15);
      renderTimerUI();
      return;
    }

    if (timerState.status === 'prep') {
      resetTimer();
      return;
    }

    if (timerState.status === 'done') {
      timerState.elapsedMs = 0;
      timerState.status = 'idle';
    }

    const usePrep = timerState.status === 'idle' && document.getElementById('timer-prep-toggle')?.checked;
    if (usePrep) {
      timerState.status = 'prep';
      timerState.prepRemaining = 3;
      playBeep(520, 90, 0.14);
      vibrate(15);
      renderTimerUI();

      const stepPrep = () => {
        timerState.prepRemaining--;
        if (timerState.prepRemaining > 0) {
          playBeep(520, 90, 0.14);
          vibrate(15);
          renderTimerUI();
          timerState.prepTimeoutId = setTimeout(stepPrep, 1000);
        } else {
          beginRunningTimer();
        }
      };
      timerState.prepTimeoutId = setTimeout(stepPrep, 1000);
    } else {
      beginRunningTimer();
    }
  }

  function openTimerModal(exerciseId = null) {
    resetTimer();
    timerState.exerciseId = exerciseId;
    const ex = exerciseId ? getExerciseById(exerciseId) : null;
    document.getElementById('timer-modal-title').textContent = ex ? `⏱️ ${ex.name}-Timer` : '⏱️ Halte-Timer';
    renderTimerUI();
    document.getElementById('timer-modal').classList.remove('hidden');
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', state.theme === 'dark' ? '#0b0f17' : '#ffffff');
    }
    updateThemeButton();
  }

  function updateThemeButton() {
    const btn = document.getElementById('btn-toggle-theme');
    if (btn) {
      btn.textContent = state.theme === 'dark' ? 'Dunkel 🌙' : 'Hell ☀️';
    }
  }

  // --- Toasts ---
  function showToast(message, { celebrate = false, undoId = null } = {}) {
    const container = document.getElementById('toast-container');
    container.innerHTML = '';
    const toast = document.createElement('div');
    toast.className = `toast ${celebrate ? 'toast-celebrate' : ''}`;
    toast.innerHTML = `<span>${message}</span>`;

    if (undoId) {
      const undoBtn = document.createElement('button');
      undoBtn.className = 'toast-undo-btn';
      undoBtn.textContent = 'Rückgängig';
      undoBtn.onclick = () => {
        deleteEntry(undoId);
        toast.remove();
      };
      toast.appendChild(undoBtn);
    }

    container.appendChild(toast);
    setTimeout(() => {
      if (toast.isConnected) toast.remove();
    }, celebrate ? 4500 : 3200);
  }

  // --- Lightweight Confetti ---
  function triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#ea580c', '#0d9488', '#7c3aed', '#2563eb', '#facc15', '#10b981'];
    const particles = Array.from({ length: 55 }, () => ({
      x: canvas.width * (0.2 + Math.random() * 0.6),
      y: canvas.height * 0.25,
      vx: (Math.random() - 0.5) * 9,
      vy: -Math.random() * 9 - 2,
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * 360,
      vrot: (Math.random() - 0.5) * 12,
      alpha: 1
    }));

    let frames = 0;
    function tick() {
      frames++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.28;
        p.rot += p.vrot;
        p.alpha -= 0.015;
        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rot * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      }
      if (alive && frames < 95) {
        requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    requestAnimationFrame(tick);
  }

  // --- Backup & Demo Data ---
  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repflow-backup-${getTodayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup heruntergeladen ✓');
  }

  function importData(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!Array.isArray(parsed.entries)) throw new Error('Invalid format');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        state = loadState();
        saveState();
        applyTheme();
        renderAll();
        closeModal('settings-modal');
        showToast('Backup erfolgreich importiert ✓', { celebrate: true });
      } catch {
        showToast('Ungültige Backup-Datei.');
      }
    };
    reader.readAsText(file);
  }

  function loadDemoData() {
    const today = getEffectiveDate();
    const demoEntries = [];
    for (let i = 35; i >= 1; i--) {
      if (i > 5 && Math.random() < 0.28) continue;
      const d = addDays(today, -i);
      const dateKey = toDateKey(d);
      const baseTs = d.getTime() + 9 * 3600 * 1000;

      // Realistic rotating muscle groups
      const doPush = i % 2 === 0 || i <= 5;
      const doPull = i % 2 === 1 || i <= 5;
      const doSquat = i % 3 !== 0 || i <= 5;

      if (doPush) {
        [10, 12, 12].forEach((reps, idx) => demoEntries.push({
          id: `demo-pu-${i}-${idx}`, date: dateKey, ts: baseTs + idx * 7200 * 1000, exercise: 'pushups', reps
        }));
      }
      if (doPull) {
        [3, 4, 4].forEach((reps, idx) => demoEntries.push({
          id: `demo-pl-${i}-${idx}`, date: dateKey, ts: baseTs + (idx + 0.5) * 7200 * 1000, exercise: 'pullups', reps
        }));
      }
      if (doSquat) {
        [15, 15, 20].forEach((reps, idx) => demoEntries.push({
          id: `demo-sq-${i}-${idx}`, date: dateKey, ts: baseTs + (idx + 0.8) * 7200 * 1000, exercise: 'squats', reps
        }));
      }
    }

    state.entries = demoEntries;
    state.dismissedLevelUps = {};
    saveState();
    renderAll();
    closeModal('settings-modal');
    showToast('Demo-Verlauf geladen (35 Tage) ✓');
  }

  // --- Event Listeners ---
  function initEvents() {
    document.querySelectorAll('.nav-item').forEach((btn) => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Custom Reps Modal
    document.getElementById('custom-reps-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const val = document.getElementById('custom-reps-input').value;
      if (customModalExerciseId && val) {
        logReps(customModalExerciseId, val);
        closeModal('custom-modal');
      }
    });

    // Exercise Editor Modal
    document.getElementById('btn-add-exercise').addEventListener('click', () => openExerciseModal(null));
    document.getElementById('ex-edit-goal-type').addEventListener('change', updateExerciseGoalLabel);
    document.getElementById('ex-edit-unit').addEventListener('change', updateExerciseGoalLabel);

    document.getElementById('exercise-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('ex-edit-name').value.trim();
      if (!name) return;
      const unit = document.getElementById('ex-edit-unit').value === 'sec' ? 'sec' : 'reps';
      const goalType = document.getElementById('ex-edit-goal-type').value === 'daily' ? 'daily' : 'weekly';
      const goal = Math.max(1, parseInt(document.getElementById('ex-edit-goal').value, 10) || 100);
      const quickAdds = parseQuickAdds(document.getElementById('ex-edit-quickadds').value, unit === 'sec' ? [15, 30, 45, 60] : [5, 10, 15, 20]);

      if (editingExerciseId) {
        const ex = getExerciseById(editingExerciseId);
        if (ex) {
          ex.name = name;
          ex.colorKey = selectedColorKey;
          ex.unit = unit;
          ex.goalType = goalType;
          ex.goal = goal;
          ex.quickAdds = quickAdds;
        }
        showToast(`${name} aktualisiert ✓`);
      } else {
        const newEx = {
          id: `ex_${Date.now().toString(36)}`,
          name,
          colorKey: selectedColorKey,
          unit,
          goalType,
          goal,
          quickAdds,
          archived: false
        };
        state.exercises.push(newEx);
        showToast(`${name} hinzugefügt ✓`, { celebrate: true });
      }

      saveState();
      renderSettingsExercisesList();
      renderAll();
      closeModal('exercise-modal');
    });

    // Timer Modal Events
    document.getElementById('btn-open-timer').addEventListener('click', () => openTimerModal(null));
    document.getElementById('btn-timer-start').addEventListener('click', startOrPauseTimer);
    document.getElementById('btn-timer-reset').addEventListener('click', resetTimer);

    document.querySelectorAll('[data-timer-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (timerState.mode === btn.dataset.timerMode) return;
        timerState.mode = btn.dataset.timerMode;
        resetTimer();
      });
    });

    document.querySelectorAll('[data-preset-sec]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sec = parseInt(btn.dataset.presetSec, 10) || 60;
        timerState.targetSec = sec;
        document.getElementById('timer-custom-sec').value = sec;
        document.querySelectorAll('[data-preset-sec]').forEach((p) => p.classList.toggle('active', p === btn));
        resetTimer();
      });
    });

    document.getElementById('timer-custom-sec').addEventListener('change', (e) => {
      const sec = Math.min(3600, Math.max(5, parseInt(e.target.value, 10) || 60));
      e.target.value = sec;
      timerState.targetSec = sec;
      document.querySelectorAll('[data-preset-sec]').forEach((p) => {
        p.classList.toggle('active', parseInt(p.dataset.presetSec, 10) === sec);
      });
      resetTimer();
    });

    // Settings Modal
    document.getElementById('btn-open-settings').addEventListener('click', openSettingsModal);
    document.getElementById('toggle-auto-levelup').addEventListener('change', updateLevelUpDaysRow);

    document.getElementById('btn-save-settings').addEventListener('click', () => {
      state.weeklyGoalDays = Math.min(7, Math.max(1, parseInt(document.getElementById('goal-weekly-days').value, 10) || 5));
      state.autoLevelUp = document.getElementById('toggle-auto-levelup').checked;
      state.levelUpDays = Math.min(30, Math.max(2, parseInt(document.getElementById('input-levelup-days').value, 10) || 5));
      state.dayCutoffHour = parseInt(document.getElementById('select-day-cutoff').value, 10) || 0;
      state.pauseMode = document.getElementById('toggle-pause-mode').checked;
      state.vibration = document.getElementById('toggle-vibration').checked;

      if (state.pauseMode) {
        ensureCurrentWeekPausedIfNeeded();
      }

      saveState();
      renderAll();
      closeModal('settings-modal');
      showToast('Einstellungen gespeichert ✓');
    });

    document.getElementById('btn-toggle-theme').addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      saveState();
      applyTheme();
      renderSettingsExercisesList();
      renderAll();
    });

    document.getElementById('btn-export-data').addEventListener('click', exportData);
    document.getElementById('input-import-data').addEventListener('change', (e) => {
      if (e.target.files?.[0]) {
        importData(e.target.files[0]);
        e.target.value = '';
      }
    });

    document.getElementById('btn-load-demo').addEventListener('click', loadDemoData);

    document.getElementById('btn-reset-data').addEventListener('click', () => {
      if (confirm('Wirklich alle gespeicherten Wiederholungen und eigenen Übungen löschen?')) {
        state = structuredClone(DEFAULT_STATE);
        saveState();
        applyTheme();
        renderAll();
        closeModal('settings-modal');
        showToast('Alle Daten zurückgesetzt.');
      }
    });

    document.querySelectorAll('.modal-close').forEach((btn) => {
      btn.addEventListener('click', () => closeModal(btn.dataset.close));
    });
    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeModal(backdrop.id);
      });
    });
  }

  // --- Register PWA Service Worker ---
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }

  // --- Boot ---
  ensureCurrentWeekPausedIfNeeded();
  applyTheme();
  initEvents();
  renderAll();
})();
