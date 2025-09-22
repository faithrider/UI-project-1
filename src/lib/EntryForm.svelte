<script>
  import { workoutStore, settingsStore, enabledFeatures, modalService } from './stores.js';
  
  let formData = $state({
    date: new Date().toISOString().split('T')[0],
    workoutType: '',
    exercises: [{ type: 'strength', name: '', sets: '', reps: '', weight: '' }],
    warmupCompleted: false,
    notes: '',
    photo: null
  });
  
  let showSuccess = $state(false);
  let photoInput = $state();
  
  // Common workout splits
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
  
  // Add exercise
  function addExercise() {
    formData.exercises = [...formData.exercises, { type: 'strength', name: '', sets: '', reps: '', weight: '' }];
  }
  
  // Remove exercise
  function removeExercise(index) {
    if (formData.exercises.length > 1) {
      formData.exercises = formData.exercises.filter((_, i) => i !== index);
    }
  }
  
  // Submit workout log info
  async function handleSubmit(event) {
    event.preventDefault();
    
    if (!formData.workoutType || !formData.date) {
      await modalService.alert('Missing Information', 'Please fill in workout type and date');
      return;
    }
    
    // Different validation based on exercise type
    const validExercises = formData.exercises.filter(ex => {
      if (ex.type === 'cardio') {
        return ex.name && ex.duration;
      } else if (ex.type === 'other') {
        return ex.description;
      } else {
        return ex.name && ex.sets && ex.reps && ex.weight;
      }
    });
    
    if (validExercises.length === 0) {
      await modalService.alert('Missing Exercises', 'Please add at least one complete exercise');
      return;
    }
    
    const entry = {
      date: formData.date,
      workoutType: formData.workoutType,
      exercises: validExercises.map(ex => {
        if (ex.type === 'cardio') {
          return {
            type: 'cardio',
            name: ex.name,
            duration: ex.duration,
            intensity: ex.intensity || ''
          };
        } else if (ex.type === 'other') {
          return {
            type: 'other',
            description: ex.description
          };
        } else {
          return {
            type: 'strength',
            name: ex.name,
            sets: parseInt(ex.sets),
            reps: parseInt(ex.reps),
            weight: parseFloat(ex.weight)
          };
        }
      }),
      warmupCompleted: formData.warmupCompleted,
      notes: formData.notes,
      photo: formData.photo
    };
    
    workoutStore.addEntry(entry);
    
    // Reset form after successful submit
    formData = {
      date: new Date().toISOString().split('T')[0],
      workoutType: '',
      exercises: [{ name: '', type: 'strength', sets: '', reps: '', weight: '' }],
      warmupCompleted: false,
      notes: '',
      photo: null
    };
    
    if (photoInput) photoInput.value = '';
    
    showSuccess = true;
    setTimeout(() => showSuccess = false, 3000);
  }

  // Handle photo upload
  async function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
      // Simulate file upload
      const reader = new FileReader();
      reader.onload = async (e) => {
        formData.photo = e.target.result;
        await modalService.alert('Success', 'Photo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  }
</script>

<div class="entry-form card">
  <h2>Log Today's Workout</h2>
  
  {#if showSuccess}
    <div class="success-message">
      Workout logged successfully! 💪
    </div>
  {/if}
  
  <form onsubmit={handleSubmit}>
    <div class="form-row">
      <div class="form-group">
        <label for="date">Date *</label>
        <input 
          type="date" 
          id="date" 
          bind:value={formData.date}
          required
        />
      </div>
      
      <div class="form-group">
        <label for="workoutType">Main Workout Type / Muscle Group *</label>
        <select id="workoutType" bind:value={formData.workoutType} required>
          <option value="">Select workout type...</option>
          {#each workoutTypes as type}
            <option value={type}>{type}</option>
          {/each}
        </select>
      </div>
    </div>
    
    <div class="exercises-section">
      <div class="exercises-header">
        <h3>Exercises</h3>
        <button type="button" class="add-exercise-btn" onclick={addExercise}>
          + Add Exercise
        </button>
      </div>
      
      {#each formData.exercises as exercise, index}
        <div class="exercise-group">
          <div class="exercise-header">
            <span class="exercise-number">Exercise {index + 1}</span>
            {#if formData.exercises.length > 1}
              <button type="button" class="remove-btn" onclick={() => removeExercise(index)}>
                Remove
              </button>
            {/if}
          </div>
          
          <div class="form-group">
            <label for="exercise-type-{index}">Exercise Type *</label>
            <select id="exercise-type-{index}" bind:value={exercise.type} required>
              <option value="strength">Strength Training</option>
              <option value="cardio">Cardio</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div class="form-group">
            {#if exercise.type === 'cardio'}
              <label for="exercise-{index}">Activity Name *</label>
              <input 
                type="text" 
                id="exercise-{index}" 
                bind:value={exercise.name}
                placeholder="e.g., Running, Cycling, Swimming"
                required
              />
            {:else if exercise.type === 'other'}
              <label for="exercise-{index}">Description *</label>
              <textarea 
                id="exercise-{index}" 
                bind:value={exercise.description}
                placeholder="Describe your activity (e.g., Yoga session, stretching, meditation)"
                rows="3"
                required
              ></textarea>
            {:else}
              <label for="exercise-{index}">Exercise Name *</label>
              <input 
                type="text" 
                id="exercise-{index}" 
                bind:value={exercise.name}
                placeholder="e.g., Bench Press, Squats, Deadlift"
                required
              />
            {/if}
          </div>
          
          {#if exercise.type === 'cardio'}
            <div class="form-row">
              <div class="form-group">
                <label for="duration-{index}">Duration *</label>
                <input 
                  type="text" 
                  id="duration-{index}" 
                  bind:value={exercise.duration}
                  placeholder="e.g., 30 minutes, 5 miles"
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="intensity-{index}">Intensity (optional)</label>
                <select id="intensity-{index}" bind:value={exercise.intensity}>
                  <option value="">Select intensity...</option>
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                  <option value="Max">Max</option>
                </select>
              </div>
            </div>
          {:else if exercise.type === 'strength'}
            <div class="form-row">
              <div class="form-group">
                <label for="sets-{index}">Sets *</label>
                <input 
                  type="number" 
                  id="sets-{index}" 
                  bind:value={exercise.sets}
                  min="1"
                  max="20"
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="reps-{index}">Reps *</label>
                <input 
                  type="number" 
                  id="reps-{index}" 
                  bind:value={exercise.reps}
                  min="1"
                  max="100"
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="weight-{index}">Weight (lbs) *</label>
                <input 
                  type="number" 
                  id="weight-{index}" 
                  bind:value={exercise.weight}
                  min="0"
                  step="0.5"
                  required
                />
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
    
    {#if $enabledFeatures.warmup}
      <div class="form-group">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            bind:checked={formData.warmupCompleted}
          />
          Warmup completed
        </label>
      </div>
    {/if}
    
    {#if $enabledFeatures.notes}
      <div class="form-group">
        <label for="notes">Notes</label>
        <textarea 
          id="notes" 
          bind:value={formData.notes}
          placeholder="How did it feel? Any observations?"
          rows="3"
        ></textarea>
      </div>
    {/if}
    
    {#if $enabledFeatures.photo}
      <div class="form-group">
        <label for="photo">Photo Upload</label>
        <input 
          type="file" 
          id="photo" 
          accept="image/*"
          bind:this={photoInput}
          onchange={handlePhotoUpload}
        />
      </div>
    {/if}
    
    <button type="submit" class="submit-btn">
      Log Workout
    </button>
  </form>
</div>

<style>
  .entry-form {
    max-width: 600px;
  }
  
  .entry-form h2 {
    margin-top: 0;
    color: var(--primary-color);
    font-size: 1.5rem;
  }
  
  .checkbox-label {
    display: flex !important;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-weight: normal !important;
  }
  
  .checkbox-label input[type="checkbox"] {
    margin: 0;
  }
  
  .submit-btn {
    background: var(--primary-color);
    color: var(--primary-text);
    border: none;
    padding: 1rem 2rem;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    width: 100%;
    margin-top: 1rem;
  }
  
  .submit-btn:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  
  textarea {
    resize: vertical;
    min-height: 80px;
  }
  
  input[type="file"] {
    padding: 0.5rem;
  }
  
  .exercises-section {
    margin: 1.5rem 0;
  }
  
  .exercises-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .exercises-header h3 {
    margin: 0;
    color: var(--primary-color);
    font-size: 1.2rem;
  }
  
  .add-exercise-btn {
    background: var(--primary-color);
    color: var(--primary-text);
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
  }
  
  .add-exercise-btn:hover {
    opacity: 0.9;
  }
  
  .exercise-group {
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
  }
  
  .exercise-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .exercise-number {
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .remove-btn {
    background: var(--error-color, #dc3545);
    color: white;
    border: none;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-size: 0.8rem;
    cursor: pointer;
  }
  
  .remove-btn:hover {
    opacity: 0.9;
  }
</style>
