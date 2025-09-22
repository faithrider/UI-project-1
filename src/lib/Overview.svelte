<script>
  import { workoutStore, entries, weeklyGoal, userGoals } from './stores.js';
  
  let { compact = false } = $props();
  
  // Current week progress for the main stats
  const currentWeekSessions = $derived.by(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Sunday start
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    return $entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= weekStart && entryDate <= weekEnd;
    }).length;
  });
  
  // Chart data for the last 8 weeks
  const weeklySessionsData = $derived.by(() => {
    const weeks = [];
    const now = new Date();
    
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const sessionsCount = $entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= weekStart && entryDate <= weekEnd;
      }).length;
      
      weeks.push({
        week: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sessions: sessionsCount
      });
    }
    
    return weeks;
  });
  
  // Data for the exercise type pie chart
  const exerciseTypeDistribution = $derived.by(() => {
    const counts = { strength: 0, cardio: 0, other: 0 };
    
    $entries.forEach(entry => {
      if (entry.exercises && entry.exercises.length > 0) {
        entry.exercises.forEach(exercise => {
          const type = exercise.type || 'strength';
          counts[type]++;
        });
      }
    });
    
    const total = counts.strength + counts.cardio + counts.other;
    if (total === 0) return { strength: 0, cardio: 0, other: 0, total: 0 };
    
    return {
      strength: Math.round((counts.strength / total) * 100),
      cardio: Math.round((counts.cardio / total) * 100), 
      other: Math.round((counts.other / total) * 100),
      total: total,
      counts: counts
    };
  });
  
  const totalSessions = $derived.by(() => $entries.length);
  const averageWeeklySessions = $derived.by(() => {
    const nonZeroWeeks = weeklySessionsData.filter(w => w.sessions > 0);
    return nonZeroWeeks.length > 0 
      ? (nonZeroWeeks.reduce((sum, w) => sum + w.sessions, 0) / nonZeroWeeks.length).toFixed(1)
      : 0;
  });
  
  // Update weekly goal
  function updateWeeklyGoal(event) {
    const newGoal = parseInt(event.target.value);
    if (newGoal > 0) {
      workoutStore.setWeeklyGoal(newGoal);
    }
  }
</script>

<div class="overview card" class:compact>
  <h2>{compact ? 'Quick Stats' : 'Overview & Goals'}</h2>
  
  <div class="stats-grid">
    <div class="stat-item">
      <div class="stat-value">{currentWeekSessions}</div>
      <div class="stat-label">This Week</div>
    </div>
    
    <div class="stat-item">
      <div class="stat-value">{totalSessions}</div>
      <div class="stat-label">Total Sessions</div>
    </div>
    
    {#if !compact}
      <div class="stat-item">
        <div class="stat-value">{averageWeeklySessions}</div>
        <div class="stat-label">Avg/Week</div>
      </div>
    {/if}
  </div>
  
  <div class="goal-section">
    <div class="goal-header">
      <label for="weeklyGoal">Weekly Goal:</label>
      <input 
        type="number" 
        id="weeklyGoal" 
        value={$weeklyGoal}
        min="1" 
        max="14"
        onchange={updateWeeklyGoal}
        class="goal-input"
      />
      <span>sessions</span>
    </div>
    
    <div class="progress-bar">
      <div 
        class="progress-fill" 
        style="width: {Math.min((currentWeekSessions / $weeklyGoal) * 100, 100)}%"
      ></div>
    </div>
    
    <div class="progress-text">
      {currentWeekSessions} of {$weeklyGoal} sessions completed
      {#if currentWeekSessions >= $weeklyGoal}
        🎉 Goal achieved!
      {/if}
  </div>
  
  <!-- Exercise Type Distribution Pie Chart -->
  {#if exerciseTypeDistribution.total > 0}
    <div class="stat-section">
      <h3>Exercise Type Distribution</h3>
      <div class="chart-container">
        <svg width="200" height="200" class="pie-chart">
          {#each [
            { type: 'strength', percent: exerciseTypeDistribution.strength, color: 'var(--strength-color)', offset: 0 },
            { type: 'cardio', percent: exerciseTypeDistribution.cardio, color: 'var(--cardio-color)', offset: exerciseTypeDistribution.strength },
            { type: 'other', percent: exerciseTypeDistribution.other, color: 'var(--other-color)', offset: exerciseTypeDistribution.strength + exerciseTypeDistribution.cardio }
          ] as segment, i}
            {#if segment.percent > 0}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke={segment.color}
                stroke-width="40"
                stroke-dasharray="{(segment.percent / 100) * 502.65} 502.65"
                stroke-dashoffset="{-((segment.offset / 100) * 502.65)}"
                transform="rotate(-90 100 100)"
                class="pie-segment"
              />
            {/if}
          {/each}
        </svg>
        
        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-color" style="background-color: var(--strength-color)"></span>
            <span>Strength ({exerciseTypeDistribution.counts.strength})</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background-color: var(--cardio-color)"></span>
            <span>Cardio ({exerciseTypeDistribution.counts.cardio})</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background-color: var(--other-color)"></span>
            <span>Other ({exerciseTypeDistribution.counts.other})</span>
          </div>
        </div>
      </div>
    </div>
  {/if}
  
  <!-- Individual Goals Section -->
  {#if !compact}
    <div class="goals-section">
      <h3>Personal Goals</h3>
      <div class="goals-grid">
        <div class="goal-item">
          <label for="weightGoal">Target Weight (lbs):</label>
          <input 
            type="number" 
            id="weightGoal" 
            value={$userGoals.weightGoal || ''}
            placeholder="e.g. 180"
            onchange={(e) => workoutStore.setUserGoal('weightGoal', e.target.value ? Number(e.target.value) : null)}
            class="goal-input"
          />
        </div>
        
        <div class="goal-item">
          <label for="monthlyDistanceGoal">Monthly Distance Goal (miles):</label>
          <input 
            type="number" 
            id="monthlyDistanceGoal" 
            value={$userGoals.monthlyDistanceGoal || ''}
            placeholder="e.g. 50"
            onchange={(e) => workoutStore.setUserGoal('monthlyDistanceGoal', e.target.value ? Number(e.target.value) : null)}
            class="goal-input"
          />
        </div>
        
        <div class="goal-item">
          <label for="consistencyGoal">Weekly Consistency Goal (%):</label>
          <input 
            type="number" 
            id="consistencyGoal" 
            value={$userGoals.consistencyGoal || 80}
            min="1" 
            max="100"
            onchange={(e) => workoutStore.setUserGoal('consistencyGoal', Number(e.target.value))}
            class="goal-input"
          />
        </div>
        
        <div class="goal-item">
          <label for="strengthPRGoal">Strength PR Goal (lbs):</label>
          <input 
            type="number" 
            id="strengthPRGoal" 
            value={$userGoals.strengthPRGoal || ''}
            placeholder="e.g. 300"
            onchange={(e) => workoutStore.setUserGoal('strengthPRGoal', e.target.value ? Number(e.target.value) : null)}
            class="goal-input"
          />
        </div>
        
        <div class="goal-item">
          <label for="cardioTimeGoal">Weekly Cardio Time Goal (minutes):</label>
          <input 
            type="number" 
            id="cardioTimeGoal" 
            value={$userGoals.cardioTimeGoal || ''}
            placeholder="e.g. 150"
            onchange={(e) => workoutStore.setUserGoal('cardioTimeGoal', e.target.value ? Number(e.target.value) : null)}
            class="goal-input"
          />
        </div>
      </div>
    </div>
  {/if}
</div>  {#if !compact}
    <div class="chart-section">
      <h3>Weekly Sessions (Last 8 Weeks)</h3>
      <div class="simple-chart">
        {#each weeklySessionsData as week}
          <div class="chart-bar">
            <div 
              class="bar-fill" 
              style="height: {week.sessions > 0 ? (week.sessions / Math.max(...weeklySessionsData.map(w => w.sessions))) * 100 : 0}%"
            ></div>
            <div class="bar-label">{week.week}</div>
            <div class="bar-value">{week.sessions}</div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .overview.compact {
    padding: 1rem;
  }
  
  .overview h2 {
    color: var(--primary-color);
    margin-top: 0;
    font-size: 1.3rem;
  }
  
  .stats-grid {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .stat-item {
    flex: 1;
    text-align: center;
    background: var(--bg-tertiary);
    padding: 1rem;
    border-radius: 8px;
  }
  
  .stat-value {
    font-size: 2rem;
    font-weight: bold;
    color: var(--primary-color);
    line-height: 1;
  }
  
  .stat-label {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-top: 0.25rem;
  }
  
  .goal-section {
    margin-bottom: 1.5rem;
  }
  
  .goal-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
  
  .goal-input {
    width: 60px;
    padding: 0.25rem;
    text-align: center;
  }
  
  .progress-bar {
    background: var(--bg-tertiary);
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }
  
  .progress-fill {
    background: var(--primary-color);
    height: 100%;
    transition: width 0.3s ease;
  }
  
  .progress-text {
    font-size: 0.9rem;
    color: var(--text-secondary);
  }
  
  .chart-section h3 {
    color: var(--text-primary);
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }
  
  .simple-chart {
    display: flex;
    gap: 0.5rem;
    align-items: end;
    height: 120px;
    padding: 1rem;
    background: var(--bg-tertiary);
    border-radius: 8px;
  }
  
  .chart-bar {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
  }
  
  .bar-fill {
    background: var(--primary-color);
    width: 100%;
    min-height: 2px;
    border-radius: 2px 2px 0 0;
    margin-bottom: auto;
  }
  
  .bar-label {
    font-size: 0.7rem;
    color: var(--text-muted);
    margin-top: 0.25rem;
  }
  
  .bar-value {
    font-size: 0.8rem;
    color: var(--text-primary);
    font-weight: 600;
  }
  
  /* Pie Chart Styles */
  .chart-container {
    display: flex;
    align-items: center;
    gap: 2rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .pie-chart {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }
  
  .pie-segment {
    transition: stroke-width 0.3s ease;
  }
  
  .pie-segment:hover {
    stroke-width: 45;
  }
  
  .chart-legend {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
  }
  
  .legend-color {
    width: 16px;
    height: 16px;
    border-radius: 3px;
    flex-shrink: 0;
  }
  
  /* Goals Section Styles */
  .goals-section {
    margin-top: 2rem;
    padding: 1.5rem;
    background: var(--bg-tertiary);
    border-radius: 8px;
  }
  
  .goals-section h3 {
    color: var(--text-primary);
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }
  
  .goals-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
  }
  
  .goal-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .goal-item label {
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 600;
  }
  
  .goals-section .goal-input {
    width: 100%;
    padding: 0.5rem;
    background: var(--input-bg);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    color: var(--text-primary);
  }
  
  .goals-section .goal-input:focus {
    border-color: var(--primary-color);
    outline: none;
  }
  
  .goals-section .goal-input::placeholder {
    color: var(--text-muted);
    font-style: italic;
  }
</style>
