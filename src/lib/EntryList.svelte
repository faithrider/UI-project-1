<script>
  import { workoutStore, modalService } from './stores.js';
  
  // Same list as EntryForm to keep consistent
  const workoutTypes = [
    'Push (Chest, Shoulders, Triceps)',
    'Pull (Back, Biceps)',
    'Legs (Quads, Hamstrings, Glutes)',
    'Upper Body',
    'Lower Body',
    'Full Body',
    'Cardio',
    'Other'
  ];
  
  let selectedWeek = $state(null);
  let editingEntry = $state(null);
  let editForm = $state({});
  
  const { entries } = workoutStore;
  
  // Group workouts by week for the accordion view
  let entriesByWeek = $derived.by(() => {
    if (!$entries || $entries.length === 0) return {};
    
    const weeks = {};
    $entries.forEach((entry) => {
      const date = new Date(entry.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Sunday start
      const weekKey = weekStart.toISOString().split("T")[0];

      if (!weeks[weekKey]) {
        weeks[weekKey] = [];
      }
      weeks[weekKey].push(entry);
    });
    return weeks;
  });

  // Sort weeks newest first
  let sortedWeeks = $derived.by(() => {
    return Object.keys(entriesByWeek).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  });
  
  function formatWeekRange(weekStart) {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    // Handle year boundaries
    const startYear = start.getFullYear();
    const endYear = end.getFullYear();
    
    if (startYear !== endYear) {
      // Show year on both dates when crossing years
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      // Show year only on end date for same-year weeks
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
  }
  
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  function startEdit(entry) {
    editingEntry = entry.id;
    editForm = { 
      ...entry,
      exercises: entry.exercises ? entry.exercises.map(ex => ({
        ...ex,
        type: ex.type || 'strength' // Default to strength for legacy entries
      })) : [{ name: entry.exercise || '', type: 'strength', sets: entry.sets || '', reps: entry.reps || '', weight: entry.weight || '' }]
    };
  }
  
  function cancelEdit() {
    editingEntry = null;
    editForm = {};
  }
  
  function saveEdit() {
    workoutStore.updateEntry(editingEntry, editForm);
    editingEntry = null;
    editForm = {};
  }
  
  async function deleteEntry(id) {
    const confirmed = await modalService.confirm(
      'Delete Entry', 
      'Are you sure you want to delete this entry? This action cannot be undone.'
    );
    if (confirmed) {
      workoutStore.deleteEntry(id);
      await modalService.alert('Success', 'Workout entry has been deleted successfully!');
    }
  }
  
  function addExerciseToEdit() {
    editForm.exercises = [...editForm.exercises, { name: '', type: 'strength', sets: '', reps: '', weight: '' }];
  }
  
  function removeExerciseFromEdit(index) {
    if (editForm.exercises.length > 1) {
      editForm.exercises = editForm.exercises.filter((_, i) => i !== index);
    }
  }
</script>

<div class="entry-list">
  <h2>Workout History</h2>
  
  <div class="week-selector">
    <h3>Select Week</h3>
    <div class="week-buttons">
      {#each sortedWeeks as week}
        <button 
          class="week-btn"
          class:active={selectedWeek === week}
          onclick={() => selectedWeek = week}
        >
          {formatWeekRange(week)}
          <span class="entry-count">({entriesByWeek[week]?.length || 0} workouts)</span>
        </button>
      {/each}
    </div>
  </div>
  
  {#if selectedWeek && entriesByWeek[selectedWeek] && entriesByWeek[selectedWeek].length > 0}
    <div class="week-entries">
      <h3>Week of {formatWeekRange(selectedWeek)}</h3>
      
      {#each entriesByWeek[selectedWeek].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) as entry}
        <div class="entry-card card">
          {#if editingEntry === entry.id}
            <!-- Edit Mode -->
            <div class="edit-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="date">Date</label>
                  <input type="date" bind:value={editForm.date} id="date" />
                </div>
                <div class="form-group">
                  <label for="workoutType">Workout Type</label>
                  <select id="workoutType" bind:value={editForm.workoutType}>
                    <option value="">Select workout type...</option>
                    {#each workoutTypes as type}
                      <option value={type}>{type}</option>
                    {/each}
                  </select>
                </div>
              </div>
              
              <!-- Multiple exercises editing -->
              <div class="exercises-edit">
                <div class="exercises-header">
                  <h4>Exercises</h4>
                  <button type="button" class="add-exercise-btn" onclick={addExerciseToEdit}>
                    + Add Exercise
                  </button>
                </div>
                
                {#each editForm.exercises as exercise, index}
                  <div class="exercise-edit-group">
                    <div class="exercise-edit-header">
                      <span>Exercise {index + 1}</span>
                      {#if editForm.exercises.length > 1}
                        <button type="button" class="remove-btn" onclick={() => removeExerciseFromEdit(index)}>
                          Remove
                        </button>
                      {/if}
                    </div>
                    
                    <div class="form-row">
                      <div class="form-group">
                        <label for="exercise-type-{index}">Exercise Type</label>
                        <select id="exercise-type-{index}" bind:value={exercise.type}>
                          <option value="strength">Strength Training</option>
                          <option value="cardio">Cardio</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    
                    <div class="form-row">
                      {#if exercise.type === 'cardio'}
                        <div class="form-group">
                          <label for="exercise-{index}">Activity Name</label>
                          <input type="text" bind:value={exercise.name} id="exercise-{index}" />
                        </div>
                        <div class="form-group">
                          <label for="duration-{index}">Duration</label>
                          <input type="text" bind:value={exercise.duration} id="duration-{index}" />
                        </div>
                        <div class="form-group">
                          <label for="intensity-{index}">Intensity</label>
                          <select id="intensity-{index}" bind:value={exercise.intensity}>
                            <option value="">Select intensity...</option>
                            <option value="Low">Low</option>
                            <option value="Moderate">Moderate</option>
                            <option value="High">High</option>
                            <option value="Max">Max</option>
                          </select>
                        </div>
                      {:else if exercise.type === 'other'}
                        <div class="form-group full-width">
                          <label for="description-{index}">Description</label>
                          <textarea bind:value={exercise.description} id="description-{index}" rows="3"></textarea>
                        </div>
                      {:else}
                        <div class="form-group">
                          <label for="exercise-{index}">Exercise Name</label>
                          <input type="text" bind:value={exercise.name} id="exercise-{index}" />
                        </div>
                        <div class="form-group">
                          <label for="sets-{index}">Sets</label>
                          <input type="number" bind:value={exercise.sets} id="sets-{index}" />
                        </div>
                        <div class="form-group">
                          <label for="reps-{index}">Reps</label>
                          <input type="number" bind:value={exercise.reps} id="reps-{index}" />
                        </div>
                        <div class="form-group">
                          <label for="weight-{index}">Weight</label>
                          <input type="number" bind:value={exercise.weight} step="0.5" id="weight-{index}" />
                        </div>
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
              
              <div class="form-group">
                <div class="warmup-toggle-container">
                  <span class="warmup-toggle-label">Warmup Status:</span>
                  <button 
                    type="button" 
                    class="warmup-toggle-badge {editForm.warmupCompleted ? 'active' : ''}"
                    onclick={() => editForm.warmupCompleted = !editForm.warmupCompleted}
                  >
                    {editForm.warmupCompleted ? '✓ Completed' : '○ Not Completed'}
                  </button>
                </div>
              </div>
              
              <div class="form-group">
                <label for="notes">Notes</label>
                <textarea bind:value={editForm.notes} rows="2" id="notes"></textarea>
              </div>
              
              <div class="edit-actions">
                <button class="save-btn" onclick={saveEdit}>Save</button>
                <button class="cancel-btn" onclick={cancelEdit}>Cancel</button>
              </div>
            </div>
          {:else}
            <!-- View Mode -->
            <div class="entry-header">
              <div class="entry-date">{formatDate(entry.date)}</div>
              <div class="entry-actions">
                <button class="edit-btn" onclick={() => startEdit(entry)}>Edit</button>
                <button class="delete-btn" onclick={() => deleteEntry(entry.id)}>Delete</button>
              </div>
            </div>
            
            <div class="entry-details">
              <div class="workout-type">{entry.workoutType}</div>
              
              <!-- Workout type summary badges -->
              {#if entry.exercises && entry.exercises.length > 0}
                {@const exerciseTypes = [...new Set(entry.exercises.map(ex => ex.type || 'strength'))]}
                {#if exerciseTypes.length > 1}
                  <div class="mixed-workout-badge">
                    Mixed: {exerciseTypes.map(type => type === 'strength' ? 'Strength' : type === 'cardio' ? 'Cardio' : 'Other').join(' + ')}
                  </div>
                {:else if exerciseTypes.length === 1}
                  <div class="pure-workout-badge pure-workout-badge-{exerciseTypes[0]}">
                    {#if exerciseTypes[0] === 'strength'}
                      Pure Strength
                    {:else if exerciseTypes[0] === 'cardio'}
                      Pure Cardio
                    {:else}
                      Pure Other
                    {/if}
                  </div>
                {/if}
              {/if}
              
              <!-- Display multiple exercises or fallback to single exercise -->
              {#if entry.exercises && entry.exercises.length > 0}
                <div class="exercises-container">
                  {#each entry.exercises as exercise}
                    <div class="exercise-box exercise-box-{exercise.type || 'strength'}">
                      <div class="exercise-type-badge">
                        {#if exercise.type === 'cardio'}
                          🏃 Cardio
                        {:else if exercise.type === 'other'}
                          🧘 Other
                        {:else}
                          💪 Strength
                        {/if}
                      </div>
                      
                      {#if exercise.description}
                        <!-- Other/Free-form format -->
                        <div class="exercise-description">{exercise.description}</div>
                      {:else if exercise.duration}
                        <!-- Cardio format -->
                        <div class="exercise-name">{exercise.name}</div>
                        <div class="workout-stats">
                          Duration: {exercise.duration}
                          {#if exercise.intensity}
                            • Intensity: {exercise.intensity}
                          {/if}
                        </div>
                      {:else}
                        <!-- Strength format -->
                        <div class="exercise-name">{exercise.name}</div>
                        <div class="workout-stats">
                          {exercise.sets} sets × {exercise.reps} reps @ {exercise.weight} lbs
                        </div>
                      {/if}
                    </div>
                  {/each}
                </div>
              {:else if entry.exercise}
                <!-- Fallback for old single exercise format -->
                <div class="exercise-item">
                  <div class="exercise-name">{entry.exercise}</div>
                  <div class="workout-stats">
                    {entry.sets} sets × {entry.reps} reps @ {entry.weight} lbs
                  </div>
                </div>
              {/if}
              
              <!-- Warmup status badge -->
              <div class="warmup-status-badge {entry.warmupCompleted ? 'completed' : 'not-completed'}">
                {entry.warmupCompleted ? '✓ Warmup Completed' : '○ Warmup Not Completed'}
              </div>
              
              {#if entry.notes}
                <div class="notes">{entry.notes}</div>
              {/if}
              {#if entry.photo}
                <div class="photo-indicator">📷 Photo attached</div>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {:else if selectedWeek && (!entriesByWeek[selectedWeek] || entriesByWeek[selectedWeek].length === 0)}
    <div class="no-selection">
      <p>No workout entries for the selected week</p>
    </div>
  {:else}
    <div class="no-selection">
      <p>Select a week to view your workout entries</p>
    </div>
  {/if}
</div>

<style>
  .entry-list h2 {
    color: var(--primary-color);
    margin-bottom: 2rem;
  }
  
  .week-selector h3 {
    margin-bottom: 1rem;
    color: var(--text-primary);
  }
  
  .week-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 2rem;
  }
  
  .week-btn {
    background: var(--button-bg);
    border: 2px solid var(--border-color);
    color: var(--text-primary);
    padding: 1rem;
    border-radius: 8px;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .week-btn:hover {
    background: var(--button-hover-bg);
    border-color: var(--primary-color);
  }
  
  .week-btn.active {
    background: var(--primary-color);
    color: var(--primary-text);
    border-color: var(--primary-color);
  }
  
  .entry-count {
    font-size: 0.9rem;
    opacity: 0.8;
  }
  
  .week-entries h3 {
    color: var(--text-primary);
    margin-bottom: 1.5rem;
  }
  
  .entry-card {
    margin-bottom: 1rem;
  }
  
  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .entry-date {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 1.1rem;
  }
  
  .entry-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .edit-btn, .delete-btn {
    padding: 0.5rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
  }
  
  .edit-btn {
    background: var(--button-bg);
    color: var(--text-primary);
  }
  
  .delete-btn {
    background: var(--error-color);
    color: white;
    border-color: var(--error-color);
  }
  
  .workout-type {
    display: inline-block;
    background: var(--primary-color);
    color: var(--primary-text);
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .mixed-workout-badge {
    background: linear-gradient(90deg, var(--strength-color), var(--cardio-color), var(--other-color));
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    margin-left: 0.5rem;
    display: inline-block;
    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  }
  
  .pure-workout-badge {
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    margin-left: 0.5rem;
    display: inline-block;
    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  }
  
  .pure-workout-badge-strength {
    background: var(--strength-color);
  }
  
  .pure-workout-badge-cardio {
    background: var(--cardio-color);
  }
  
  .pure-workout-badge-other {
    background: var(--other-color);
  }
  
  .exercise-name {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }
  
  .exercise-description {
    font-size: 1.1rem;
    color: var(--text-primary);
    line-height: 1.4;
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    background: var(--bg-tertiary);
    border-radius: 4px;
    border-left: 4px solid var(--primary-color);
  }
  
  .workout-stats {
    font-size: 1rem;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }
  
  .warmup-badge {
    display: inline-block;
    background: var(--success-color);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
  }
  
  /* Warmup status badge for view mode */
  .warmup-status-badge {
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    border: 2px solid;
  }
  
  .warmup-status-badge.completed {
    background: var(--success-color);
    border-color: var(--success-color);
    color: white;
  }
  
  .warmup-status-badge.not-completed {
    background: var(--bg-secondary);
    border-color: var(--border-color);
    color: var(--text-secondary);
  }
  
  /* Warmup toggle for edit form */
  .warmup-toggle-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .warmup-toggle-label {
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 500;
  }
  
  .warmup-toggle-badge {
    background: var(--bg-secondary);
    border: 2px solid var(--border-color);
    color: var(--text-secondary);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .warmup-toggle-badge:hover {
    border-color: var(--primary-color);
    transform: translateY(-1px);
  }
  
  .warmup-toggle-badge.active {
    background: var(--success-color);
    border-color: var(--success-color);
    color: white;
  }
  
  .notes {
    background: var(--bg-tertiary);
    padding: 0.75rem;
    border-radius: 6px;
    font-style: italic;
    color: var(--text-secondary);
    margin-top: 0.5rem;
  }
  
  .photo-indicator {
    color: var(--text-muted);
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }
  
  .no-selection {
    text-align: center;
    color: var(--text-muted);
    padding: 3rem;
  }
  
  .edit-form .form-row {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .edit-form .form-group {
    flex: 1;
    margin-bottom: 0;
  }
  
  .edit-form .form-group.full-width {
    flex: 1 1 100%;
  }
  
  .edit-form label {
    display: block;
    margin-bottom: 0.25rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
  }
  
  .edit-form input,
  .edit-form textarea {
    width: 100%;
    padding: 0.5rem;
    font-size: 0.9rem;
  }
  
  .edit-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }
  
  .save-btn {
    background: var(--success-color);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .cancel-btn {
    background: var(--button-bg);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
  }
  
  /* New styles for multiple exercises */
  .exercises-edit {
    margin: 1rem 0;
  }
  
  .exercises-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .exercises-header h4 {
    margin: 0;
    color: var(--primary-color);
  }
  
  .add-exercise-btn {
    background: var(--primary-color);
    color: var(--primary-text);
    border: none;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-size: 0.8rem;
  }
  
  .exercise-edit-group {
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 1rem;
    margin-bottom: 1rem;
  }
  
  .exercise-edit-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .remove-btn {
    background: var(--error-color);
    color: white;
    border: none;
    padding: 0.25rem 0.5rem;
    border-radius: 3px;
    font-size: 0.7rem;
  }
  
  .exercise-item {
    margin-bottom: 1rem;
  }
  
  .exercise-item:last-child {
    margin-bottom: 0.5rem;
  }
  
  /* New exercise box styles */
  .exercises-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1rem;
  }
  
  .exercise-box {
    padding: 1rem;
    border-radius: 8px;
    border: 2px solid;
    position: relative;
    background: var(--card-bg);
  }
  
  .exercise-type-badge {
    position: absolute;
    top: -8px;
    left: 12px;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    background: var(--card-bg);
    border: 2px solid;
  }
  
  /* Strength exercise styling */
  .exercise-box-strength {
    border-color: var(--strength-color);
    background: var(--strength-bg);
  }
  
  .exercise-box-strength .exercise-type-badge {
    border-color: var(--strength-color);
    color: var(--strength-color);
  }
  
  /* Cardio exercise styling */
  .exercise-box-cardio {
    border-color: var(--cardio-color);
    background: var(--cardio-bg);
  }
  
  .exercise-box-cardio .exercise-type-badge {
    border-color: var(--cardio-color);
    color: var(--cardio-color);
  }
  
  /* Other exercise styling */
  .exercise-box-other {
    border-color: var(--other-color);
    background: var(--other-bg);
  }
  
  .exercise-box-other .exercise-type-badge {
    border-color: var(--other-color);
    color: var(--other-color);
  }
  
  .exercise-box .exercise-name {
    font-weight: 600;
    color: var(--text-primary);
    margin-top: 0.5rem;
    margin-bottom: 0.25rem;
  }
  
  .exercise-box .exercise-description {
    color: var(--other-color);
    margin-top: 0.5rem;
    font-style: italic;
    font-weight: 500;
  }
  
  .exercise-box .workout-stats {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
</style>
