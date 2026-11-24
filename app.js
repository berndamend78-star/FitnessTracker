(() => {
  'use strict';

  const STORAGE_KEY = 'repflow_data_v1';

  const EXERCISES = [
    {
      id: 'pushups',
      name: 'Liegestütze',
      color: 'var(--color-pushups)',
      hex: '#ea580c',
      soft: 'var(--color-pushups-soft)',
      border: 'var(--color-pushups-border)',
      quickAdds: [8, 10, 12, 15],
      defaultGoal: 30,
      levelUpStep: 5,
      milestones: [50, 100, 250, 500, 1000, 2500, 5000, 10000],
      icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18h20"/><path d="M5 18l3-7h8l3 7"/><circle cx="17" cy="7" r="2"/></svg>`
    },
    {
      id: 'pullups',
      name: 'Klimmzüge',
      color: 'var(--color-pullups)',
      hex: '#0d9488',
      soft: 'var(--color-pullups-soft)',
      border: 'var(--color-pullups-border)',
      quickAdds: [1, 2, 3, 5],
      defaultGoal: 10,
      levelUpStep: 2,
      milestones: [25, 50, 100, 250, 500, 1000, 2500, 5000],
      icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h18"/><path d="M8 5v5l4 2 4-2V5"/><path d="M12 12v8"/><circle cx="12" cy="8.5" r="1.8"/></svg>`
    },
    {
      id: 'squats',
      name: 'Kniebeugen',
      color: 'var(--color-squats)',
      hex: '#7c3aed',
      soft: 'var(--color-squats-soft)',
      border: 'var(--color-squats-border)',
      quickAdds: [5, 10, 15, 20],
      defaultGoal: 40,
      levelUpStep: 5,
      milestones: [100, 250, 500, 1000, 2500, 5000, 10000, 25000],
      icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"/><path d="M12 7v5l-4 3 1 5"/><path d="M12 12l4 3-1 5"/><path d="M7 10h10"/></svg>`
    }
  ];

  const ALTITUDE_LANDMARKS = [
    { name: 'Brandenburger Tor', meters: 26 },
    { name: 'Freiheitsstatue', meters: 93 },
    { name: 'Kölner Dom', meters: 157 },
    { name: 'Eiffelturm', meters: 330 },
    { name: 'Burj Khalifa', meters: 828 },
    { name: 'Zugspitze', meters: 2962 },
    { name: 'Mount Everest', meters: 8849 }
  ];

  const DEFAULT_STATE = {
    entries: [], // { id, date: 'YYYY-MM-DD', ts: number, exercise: 'pushups'|'pullups'|'squats', reps: number }
    goals: {
      pushups: 30,
      pullups: 10,
      squats: 40
    },
    quickAdds: {
      pushups: [8, 10, 12, 15],
      pullups: [1, 2, 3, 5],
      squats: [5, 10, 15, 20]
    },
    weeklyGoalDays: 5,
    autoLevelUp: true,
    levelUpDays: 5,
    dayCutoffHour: 0,
    pauseMode: false,
    pausedWeeks: [],
    vibration: true,
    theme: 'light',
    themeMigratedToLight: true,
    dismissedLevelUps: {} // { pushups: 30 } -> dismissed suggestion at goal 30
  };

  let state = loadState();
  let activeTab = 'today';
  let historyFilter = 'pushups';
  let customModalExerciseId = null;

  // --- Date Helpers (Local Timezone + Night-Owl Cutoff) ---
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

  function getMondayOfWeek(date = new Date()) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = d.getDay(); // 0=Sun, 1=Mon
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
  }

  function formatNumber(n) {
    return Number(n).toLocaleString('de-DE');
  }

  function vibrate(pattern) {
    if (!state.vibration) return;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore on unsupported browsers
      }
    }
  }

  function parseQuickAdds(rawStr, fallback) {
    const nums = String(rawStr || '')
      .split(/[,;\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n) && n >= 1 && n <= 500);
    const unique = [...new Set(nums)].slice(0, 6);
    return unique.length > 0 ? unique : [...fallback];
  }

  function ensureCurrentWeekPausedIfNeeded() {
    if (!state.pauseMode) return;
    const mondayKey = toDateKey(getMondayOfWeek(getEffectiveDate()));
    if (!state.pausedWeeks.includes(mondayKey)) {
      state.pausedWeeks.push(mondayKey);
      saveState();
    }
  }

  // --- State Persistence ---
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(DEFAULT_STATE);
      const parsed = JSON.parse(raw);
      const merged = {
        ...structuredClone(DEFAULT_STATE),
        ...parsed,
        goals: { ...DEFAULT_STATE.goals, ...(parsed.goals || {}) },
        quickAdds: {
          pushups: Array.isArray(parsed.quickAdds?.pushups) ? parsed.quickAdds.pushups : [...DEFAULT_STATE.quickAdds.pushups],
          pullups: Array.isArray(parsed.quickAdds?.pullups) ? parsed.quickAdds.pullups : [...DEFAULT_STATE.quickAdds.pullups],
          squats: Array.isArray(parsed.quickAdds?.squats) ? parsed.quickAdds.squats : [...DEFAULT_STATE.quickAdds.squats]
        },
        pausedWeeks: Array.isArray(parsed.pausedWeeks) ? parsed.pausedWeeks : [],
        dismissedLevelUps: { ...(parsed.dismissedLevelUps || {}) },
        entries: Array.isArray(parsed.entries) ? parsed.entries : []
      };
      if (!parsed.themeMigratedToLight) {
        merged.theme = 'light';
        merged.themeMigratedToLight = true;
      }
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
    // Returns { 'YYYY-MM-DD': { pushups: n, pullups: n, squats: n, total: n } }
    const map = {};
    for (const e of state.entries) {
      if (!map[e.date]) {
        map[e.date] = { pushups: 0, pullups: 0, squats: 0, total: 0 };
      }
      map[e.date][e.exercise] = (map[e.date][e.exercise] || 0) + e.reps;
      map[e.date].total += e.reps;
    }
    return map;
  }

  function getTodayKey() {
    return toDateKey(getEffectiveDate());
  }

  function getSevenDayAverage(dailyMap, exerciseId = 'all') {
    const today = getEffectiveDate();
    let sum = 0;
    for (let i = 1; i <= 7; i++) {
      const key = toDateKey(addDays(today, -i));
      const day = dailyMap[key];
      const val = day ? (exerciseId === 'all' ? day.total : day[exerciseId] || 0) : 0;
      sum += val;
    }
    if (sum === 0) return 0;
    return Math.round(sum / 7);
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

    // Count consecutive weeks meeting weeklyGoalDays (skipping paused weeks without breaking streak)
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
        // Paused week protects the streak without adding to it
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

    for (const ex of EXERCISES) {
      const goal = state.goals[ex.id];
      if (state.dismissedLevelUps[ex.id] === goal) continue;

      let consecutive = 0;
      const startOffset = (dailyMap[toDateKey(today)]?.[ex.id] || 0) >= goal ? 0 : 1;
      for (let i = startOffset; i < startOffset + requiredDays; i++) {
        const key = toDateKey(addDays(today, -i));
        if ((dailyMap[key]?.[ex.id] || 0) >= goal) {
          consecutive++;
        } else {
          break;
        }
      }

      if (consecutive >= requiredDays) {
        suggestions.push({
          exercise: ex,
          currentGoal: goal,
          nextGoal: goal + ex.levelUpStep,
          requiredDays
        });
      }
    }
    return suggestions;
  }

  // --- Core Action: Log a Mini-Set ---
  function logReps(exerciseId, reps) {
    const num = parseInt(reps, 10);
    if (!num || num <= 0) return;

    const ex = EXERCISES.find((x) => x.id === exerciseId);
    const todayKey = getTodayKey();
    const dailyMapBefore = getDailyMap();
    const prevTodayReps = dailyMapBefore[todayKey]?.[exerciseId] || 0;
    const prevRecords = getExerciseRecords(dailyMapBefore, exerciseId);
    const goal = state.goals[exerciseId];

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
    const newTotal = prevRecords.total + num;

    // Check celebrations
    const hitGoal = prevTodayReps < goal && newTodayReps >= goal;
    const hitDailyPR = prevRecords.bestDayBeforeToday > 0 && prevTodayReps <= prevRecords.bestDayBeforeToday && newTodayReps > prevRecords.bestDayBeforeToday;
    const hitMaxSet = prevRecords.maxSet > 0 && num > prevRecords.maxSet;
    const unlockedMilestone = ex.milestones.find((m) => prevRecords.total < m && newTotal >= m);

    renderAll();

    // Subtle card pulse
    const cardEl = document.querySelector(`.exercise-card[data-ex="${exerciseId}"]`);
    if (cardEl) {
      cardEl.classList.remove('pulse');
      void cardEl.offsetWidth;
      cardEl.classList.add('pulse');
    }

    if (unlockedMilestone) {
      vibrate([25, 45, 35]);
      triggerConfetti();
      showToast(`🏆 Meilenstein: ${formatNumber(unlockedMilestone)} ${ex.name} gesamt!`, { celebrate: true, undoId: entry.id });
    } else if (hitGoal) {
      vibrate([20, 40, 30]);
      triggerConfetti();
      showToast(`🎉 Tagesziel für ${ex.name} erreicht (${newTodayReps}/${goal})!`, { celebrate: true, undoId: entry.id });
    } else if (hitDailyPR) {
      vibrate([20, 40, 30]);
      triggerConfetti();
      showToast(`🔥 Neuer Tagesrekord bei ${ex.name}: ${newTodayReps} Wdh.!`, { celebrate: true, undoId: entry.id });
    } else if (hitMaxSet) {
      vibrate([20, 35, 20]);
      showToast(`💪 Neues bestes Einzel-Set: ${num} ${ex.name}!`, { celebrate: true, undoId: entry.id });
    } else {
      vibrate(15);
      showToast(`+${num} ${ex.name} gespeichert`, { undoId: entry.id });
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
    const todayData = dailyMap[todayKey] || { pushups: 0, pullups: 0, squats: 0, total: 0 };

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
            🚀 <strong>${s.requiredDays} Tage in Folge</strong> dein ${s.exercise.name}-Ziel (${s.currentGoal}) geschafft! Bereit für <strong>${s.nextGoal} / Tag</strong>?
          </div>
          <div class="progression-actions">
            <button class="btn-primary" id="btn-accept-levelup" style="padding: 8px 12px; font-size: 0.82rem;">Auf ${s.nextGoal} erhöhen</button>
            <button class="btn-secondary" id="btn-dismiss-levelup" style="padding: 8px 12px; font-size: 0.82rem;">Später</button>
          </div>
        </div>
      `;
      document.getElementById('btn-accept-levelup').onclick = () => {
        state.goals[s.exercise.id] = s.nextGoal;
        delete state.dismissedLevelUps[s.exercise.id];
        saveState();
        renderAll();
        showToast(`Neues Ziel für ${s.exercise.name}: ${s.nextGoal} / Tag!`, { celebrate: true });
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
    cardsContainer.innerHTML = EXERCISES.map((ex) => {
      const current = todayData[ex.id] || 0;
      const goal = state.goals[ex.id];
      const pct = Math.min(100, Math.round((current / goal) * 100));
      const avg7 = getSevenDayAverage(dailyMap, ex.id);
      const records = getExerciseRecords(dailyMap, ex.id);

      let metaText = '';
      if (current > records.bestDayBeforeToday && records.bestDayBeforeToday > 0) {
        metaText = `🏆 <strong>Neuer Tagesrekord!</strong> (bisher ${records.bestDayBeforeToday})`;
      } else if (current >= goal) {
        metaText = `✓ Tagesziel erreicht` + (avg7 > 0 ? ` · 7T-Schnitt: ${avg7}` : '');
      } else {
        const remaining = goal - current;
        metaText = `Noch <strong>${remaining}</strong> bis Ziel` + (avg7 > 0 ? ` · 7T-Schnitt: ${avg7}` : '');
      }

      const quickAddList = state.quickAdds?.[ex.id]?.length ? state.quickAdds[ex.id] : ex.quickAdds;
      const quickBtns = quickAddList
        .map((val) => `<button class="quick-btn" data-ex="${ex.id}" data-reps="${val}">+${val}</button>`)
        .join('');

      return `
        <article class="exercise-card ${current >= goal ? 'goal-reached' : ''}" data-ex="${ex.id}" style="--ex-color: ${ex.color}; --ex-soft: ${ex.soft}; --ex-border: ${ex.border};">
          <div class="ex-top">
            <div class="ex-title-group">
              <div class="ex-icon-badge">${ex.icon}</div>
              <div>
                <div class="ex-name">${ex.name}</div>
                <div class="ex-meta">${metaText}</div>
              </div>
            </div>
            <div class="ex-counter">
              <div class="ex-current">${current}</div>
              <div class="ex-goal">/ ${goal}</div>
            </div>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${pct}%; background: ${ex.color};"></div>
          </div>
          <div class="quick-add-row" style="grid-template-columns: repeat(${quickAddList.length + 1}, 1fr);">
            ${quickBtns}
            <button class="quick-btn quick-btn-custom" data-custom-ex="${ex.id}" title="Eigene Zahl eingeben" aria-label="Eigene Anzahl für ${ex.name}">…</button>
          </div>
        </article>
      `;
    }).join('');

    // Bind quick add buttons
    cardsContainer.querySelectorAll('[data-reps]').forEach((btn) => {
      btn.addEventListener('click', () => {
        logReps(btn.dataset.ex, btn.dataset.reps);
      });
    });

    cardsContainer.querySelectorAll('[data-custom-ex]').forEach((btn) => {
      btn.addEventListener('click', () => openCustomModal(btn.dataset.customEx));
    });

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
        const ex = EXERCISES.find((x) => x.id === entry.exercise);
        return `
          <div class="log-item">
            <div class="log-left">
              <span class="log-dot" style="background: ${ex.color};"></span>
              <div>
                <div class="log-name">${ex.name}</div>
                <div class="log-time">${formatTime(entry.ts)} Uhr</div>
              </div>
            </div>
            <div class="log-right">
              <span class="log-reps" style="color: ${ex.color};">+${entry.reps}</span>
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

    // 2. 14-Day Bar Chart
    const today = getEffectiveDate();
    const filterEx = EXERCISES.find((x) => x.id === historyFilter);
    const barColor = filterEx ? filterEx.color : 'var(--accent)';
    const avg7 = getSevenDayAverage(dailyMap, historyFilter);

    document.getElementById('chart-avg-subtitle').textContent = `7-Tage-Schnitt: ${formatNumber(avg7)} Wdh./Tag`;

    const bars = [];
    let maxVal = Math.max(avg7, 1);
    for (let i = 13; i >= 0; i--) {
      const d = addDays(today, -i);
      const key = toDateKey(d);
      const day = dailyMap[key];
      const val = day ? (historyFilter === 'all' ? day.total : day[historyFilter] || 0) : 0;
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
    const avgPx = Math.round((avg7 / maxVal) * trackHeightPx);
    const avgLineHtml = avg7 > 0
      ? `<div class="chart-avg-line" style="bottom: ${22 + avgPx}px;"></div>`
      : '';

    chartContainer.innerHTML = avgLineHtml + bars.map((b) => {
      const barPx = b.val > 0 ? Math.max(4, Math.round((b.val / maxVal) * trackHeightPx)) : 3;
      return `
        <div class="bar-col" title="${formatShortDate(b.key)}: ${b.val} Wdh.">
          <span class="bar-value-tip">${b.val > 0 ? b.val : ''}</span>
          <div class="bar-track">
            <div class="bar-fill" style="height: ${barPx}px; background: ${b.val > 0 ? barColor : 'var(--surface-elevated)'}; opacity: ${b.isToday ? 1 : 0.82};"></div>
          </div>
          <span class="bar-label" style="${b.isToday ? 'color: var(--text); font-weight: 700;' : ''}">${b.dayNum}</span>
        </div>
      `;
    }).join('');

    // 3. 12-Week Activity Heatmap
    const heatmapContainer = document.getElementById('heatmap-container');
    const hmColor = filterEx ? filterEx.hex : '#34d399';
    heatmapContainer.style.setProperty('--hm-color', hmColor);

    const currentMonday = getMondayOfWeek(today);
    const startMonday = addDays(currentMonday, -7 * 11);
    const todayKey = getTodayKey();
    const totalGoal = state.goals.pushups + state.goals.pullups + state.goals.squats;
    const targetForFilter = filterEx ? state.goals[filterEx.id] : totalGoal;

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
        const dayData = dailyMap[key];
        const val = dayData ? (historyFilter === 'all' ? dayData.total : dayData[historyFilter] || 0) : 0;
        let level = 0;
        if (val > 0) {
          const ratio = val / Math.max(targetForFilter, 1);
          if (ratio >= 1) level = 4;
          else if (ratio >= 0.65) level = 3;
          else if (ratio >= 0.3) level = 2;
          else level = 1;
        }
        cellsHtml += `<button class="hm-cell hm-l${level}" data-hm-date="${key}" data-hm-val="${val}" aria-label="${formatShortDate(key)}: ${val} Wiederholungen"></button>`;
      }
      weeksHtml += `<div class="hm-week-col">${cellsHtml}</div>`;
    }
    heatmapContainer.innerHTML = weeksHtml;

    heatmapContainer.querySelectorAll('[data-hm-date]').forEach((cell) => {
      cell.addEventListener('click', () => {
        const label = filterEx ? filterEx.name : 'Gesamt';
        document.getElementById('heatmap-tooltip').textContent =
          `${formatShortDate(cell.dataset.hmDate)} · ${label}: ${cell.dataset.hmVal} Wdh.`;
      });
    });

    // 4. Personal Records
    const recordsGrid = document.getElementById('records-grid');
    recordsGrid.innerHTML = EXERCISES.map((ex) => {
      const rec = getExerciseRecords(dailyMap, ex.id);
      const avg = getSevenDayAverage(dailyMap, ex.id);
      return `
        <div class="record-row">
          <div class="record-ex" style="color: ${ex.color};">${ex.name}</div>
          <div class="record-stat">
            <span class="record-val">${rec.bestDay}</span>
            <span class="record-lbl">Tages-PR</span>
          </div>
          <div class="record-stat">
            <span class="record-val">${rec.maxSet}</span>
            <span class="record-lbl">Max-Set</span>
          </div>
          <div class="record-stat">
            <span class="record-val">${avg}</span>
            <span class="record-lbl">7T-Schnitt</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderMilestonesView(dailyMap) {
    const totals = {};
    for (const ex of EXERCISES) {
      const rec = getExerciseRecords(dailyMap, ex.id);
      totals[ex.id] = rec.total;
    }

    document.getElementById('lifetime-breakdown').innerHTML = EXERCISES.map((ex) => `
      <div class="lb-item" style="background: ${ex.soft}; border: 1px solid ${ex.border};">
        <div class="lb-num" style="color: ${ex.color}; font-size: 1.35rem;">${formatNumber(totals[ex.id])}</div>
        <div class="lb-name">${ex.name}</div>
      </div>
    `).join('');

    // Pull-up Altitude
    const meters = +(totals.pullups * 0.5).toFixed(1);
    document.getElementById('altitude-meters').textContent = `${meters.toLocaleString('de-DE')} m`;
    const nextLandmark = ALTITUDE_LANDMARKS.find((l) => meters < l.meters) || ALTITUDE_LANDMARKS[ALTITUDE_LANDMARKS.length - 1];
    const prevLandmarkMeters = ALTITUDE_LANDMARKS.filter((l) => l.meters <= meters).pop()?.meters || 0;
    const altPct = meters >= nextLandmark.meters
      ? 100
      : Math.min(100, Math.round(((meters - prevLandmarkMeters) / (nextLandmark.meters - prevLandmarkMeters)) * 100));

    document.getElementById('altitude-bar').style.width = `${altPct}%`;
    document.getElementById('altitude-next').textContent =
      meters >= ALTITUDE_LANDMARKS[ALTITUDE_LANDMARKS.length - 1].meters
        ? '🏆 Du hast den Mount Everest erklommen!'
        : `Nächstes Ziel: ${nextLandmark.name} (${formatNumber(nextLandmark.meters)} m) · noch ${(nextLandmark.meters - meters).toFixed(1).replace('.', ',')} m`;

    // Milestones per Exercise
    const list = document.getElementById('milestones-list');
    list.innerHTML = EXERCISES.map((ex) => {
      const total = totals[ex.id];
      const nextMs = ex.milestones.find((m) => total < m) || ex.milestones[ex.milestones.length - 1];
      const pct = Math.min(100, Math.round((total / nextMs) * 100));

      const badgesHtml = ex.milestones.map((m) => `
        <span class="ms-badge ${total >= m ? 'unlocked' : ''}">${total >= m ? '✓ ' : ''}${formatNumber(m)}</span>
      `).join('');

      return `
        <div class="card" style="--ex-color: ${ex.color}; --ex-soft: ${ex.soft}; --ex-border: ${ex.border}; border-left: 4px solid ${ex.color};">
          <div class="milestone-card-header">
            <div class="ex-title-group">
              <div class="ex-icon-badge" style="width: 34px; height: 34px;">${ex.icon}</div>
              <div>
                <div class="card-title">${ex.name}</div>
                <div class="card-subtitle">${formatNumber(total)} / ${formatNumber(nextMs)} Wdh. (${pct}%)</div>
              </div>
            </div>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${pct}%; background: ${ex.color};"></div>
          </div>
          <div class="milestone-badges">${badgesHtml}</div>
        </div>
      `;
    }).join('');
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
    const ex = EXERCISES.find((x) => x.id === exerciseId);
    document.getElementById('custom-modal-title').textContent = `${ex.name} hinzufügen`;
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
    document.getElementById('goal-pushups').value = state.goals.pushups;
    document.getElementById('goal-pullups').value = state.goals.pullups;
    document.getElementById('goal-squats').value = state.goals.squats;
    document.getElementById('goal-weekly-days').value = state.weeklyGoalDays;

    document.getElementById('qa-pushups').value = (state.quickAdds.pushups || DEFAULT_STATE.quickAdds.pushups).join(', ');
    document.getElementById('qa-pullups').value = (state.quickAdds.pullups || DEFAULT_STATE.quickAdds.pullups).join(', ');
    document.getElementById('qa-squats').value = (state.quickAdds.squats || DEFAULT_STATE.quickAdds.squats).join(', ');

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
    document.getElementById(id).classList.add('hidden');
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
    container.innerHTML = ''; // Keep it clean (latest toast)
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

    const colors = ['#ff6b4a', '#2dd4bf', '#a78bfa', '#38bdf8', '#facc15', '#34d399'];
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
        state = {
          ...structuredClone(DEFAULT_STATE),
          ...parsed,
          goals: { ...DEFAULT_STATE.goals, ...(parsed.goals || {}) }
        };
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
      // Skip ~25% of days for realistic pattern, keep last 5 days active
      if (i > 5 && Math.random() < 0.28) continue;
      const d = addDays(today, -i);
      const dateKey = toDateKey(d);
      const baseTs = d.getTime() + 9 * 3600 * 1000;

      const pushSets = i <= 5 ? [10, 10, 12] : [8, 8, 10].slice(0, 1 + Math.floor(Math.random() * 3));
      const pullSets = i <= 5 ? [3, 4, 3] : [2, 3, 3].slice(0, 1 + Math.floor(Math.random() * 3));
      const squatSets = i <= 5 ? [15, 15, 15] : [10, 15, 15].slice(0, 1 + Math.floor(Math.random() * 3));

      pushSets.forEach((reps, idx) => demoEntries.push({
        id: `demo-pu-${i}-${idx}`,
        date: dateKey,
        ts: baseTs + idx * 7200 * 1000,
        exercise: 'pushups',
        reps
      }));
      pullSets.forEach((reps, idx) => demoEntries.push({
        id: `demo-pl-${i}-${idx}`,
        date: dateKey,
        ts: baseTs + (idx + 0.5) * 7200 * 1000,
        exercise: 'pullups',
        reps
      }));
      squatSets.forEach((reps, idx) => demoEntries.push({
        id: `demo-sq-${i}-${idx}`,
        date: dateKey,
        ts: baseTs + (idx + 0.8) * 7200 * 1000,
        exercise: 'squats',
        reps
      }));
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
    // Bottom nav
    document.querySelectorAll('.nav-item').forEach((btn) => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // History filter pills
    document.querySelectorAll('#history-filter-pills .filter-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        historyFilter = pill.dataset.filter;
        document.querySelectorAll('#history-filter-pills .filter-pill').forEach((p) => {
          p.classList.toggle('active', p === pill);
        });
        renderHistoryView(getDailyMap());
      });
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

    // Settings Modal
    document.getElementById('btn-open-settings').addEventListener('click', openSettingsModal);
    document.getElementById('toggle-auto-levelup').addEventListener('change', updateLevelUpDaysRow);

    document.getElementById('btn-save-settings').addEventListener('click', () => {
      const pu = Math.max(1, parseInt(document.getElementById('goal-pushups').value, 10) || 30);
      const pl = Math.max(1, parseInt(document.getElementById('goal-pullups').value, 10) || 10);
      const sq = Math.max(1, parseInt(document.getElementById('goal-squats').value, 10) || 40);
      const wd = Math.min(7, Math.max(1, parseInt(document.getElementById('goal-weekly-days').value, 10) || 5));

      state.goals = { pushups: pu, pullups: pl, squats: sq };
      state.weeklyGoalDays = wd;

      state.quickAdds = {
        pushups: parseQuickAdds(document.getElementById('qa-pushups').value, DEFAULT_STATE.quickAdds.pushups),
        pullups: parseQuickAdds(document.getElementById('qa-pullups').value, DEFAULT_STATE.quickAdds.pullups),
        squats: parseQuickAdds(document.getElementById('qa-squats').value, DEFAULT_STATE.quickAdds.squats)
      };

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
      if (confirm('Wirklich alle gespeicherten Wiederholungen löschen?')) {
        state = structuredClone(DEFAULT_STATE);
        saveState();
        applyTheme();
        renderAll();
        closeModal('settings-modal');
        showToast('Alle Daten zurückgesetzt.');
      }
    });

    // Modal close buttons & backdrop clicks
    document.querySelectorAll('.modal-close').forEach((btn) => {
      btn.addEventListener('click', () => closeModal(btn.dataset.close));
    });
    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) backdrop.classList.add('hidden');
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
