<script>
  import { settingsStore, theme, enabledFeatures, workoutStore, modalService } from './stores.js';
  
  let { compact = false } = $props();
  
  const themes = [
    { id: 'tundra', name: 'Tundra' },
    { id: 'cocoa', name: 'Cocoa' },
    { id: 'sunset', name: 'Sunset' }
  ];
  
  const features = [
    { id: 'notes', name: 'Notes', description: 'Add workout notes' },
    { id: 'warmup', name: 'Warmup Tracking', description: 'Track warmup completion' },
    { id: 'photo', name: 'Photo Upload', description: 'Attach photos to workouts' }
  ];
  
  function changeTheme(themeId) {
    settingsStore.setTheme(themeId);
  }
  
  function toggleFeature(featureId) {
    settingsStore.toggleFeature(featureId);
  }
  
    async function resetToDefaultData() {
    const confirmed = await modalService.confirm(
      'Reset Data', 
      'This will clear all your workout data and restore the default sample workouts. Are you sure?'
    );
    if (confirmed) {
      workoutStore.clearAllData();
      await modalService.alert('Success', 'Data has been reset to defaults!');
    }
  }
</script>

<div class="settings card" class:compact>
  <h2>{compact ? 'Settings' : 'Customization'}</h2>
  
  <div class="settings-section">
    <h3>Theme</h3>
    <div class="theme-options">
      {#each themes as themeOption}
        <button 
          class="theme-option"
          class:active={$theme === themeOption.id}
          onclick={() => changeTheme(themeOption.id)}
        >
          <div class="theme-name">{themeOption.name}</div>
        </button>
      {/each}
    </div>
  </div>
  
  {#if !compact}
    <div class="settings-section">
      <h3>Features</h3>
      <div class="feature-toggles">
        {#each features as feature}
          <label class="feature-toggle">
            <input 
              type="checkbox" 
              checked={$enabledFeatures[feature.id]}
              onchange={(event) => { event.preventDefault(); toggleFeature(feature.id); }}
            />
            <div class="feature-info">
              <div class="feature-name">{feature.name}</div>
              <div class="feature-description">{feature.description}</div>
            </div>
          </label>
        {/each}
      </div>
    </div>
    
    <div class="settings-section">
      <h3>Data Management</h3>
      <button class="reset-button" onclick={resetToDefaultData}>
        Reset to Default Data
      </button>
      <p class="reset-description">
        Clear all your workout data and restore the sample workouts
      </p>
    </div>
  {/if}
</div>

<style>
  .settings.compact {
    padding: 1rem;
  }
  
  .settings h2 {
    color: var(--primary-color);
    margin-top: 0;
    font-size: 1.3rem;
  }
  
  .settings-section {
    margin-bottom: 2rem;
  }
  
  .settings-section:last-child {
    margin-bottom: 0;
  }
  
  .settings-section h3 {
    color: var(--text-primary);
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }
  
  .theme-options {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .theme-option {
    background: var(--button-bg);
    border: 2px solid var(--border-color);
    color: var(--text-primary);
    padding: 0.75rem 1rem;
    border-radius: 8px;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .theme-option:hover {
    background: var(--button-hover-bg);
    border-color: var(--primary-color);
  }
  
  .theme-option.active {
    background: var(--primary-color);
    color: var(--primary-text);
    border-color: var(--primary-color);
  }
  
  .theme-name {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  
  .feature-toggles {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .feature-toggle {
    display: flex !important;
    align-items: center;
    gap: 1rem;
    cursor: pointer;
    padding: 1rem;
    background: var(--bg-tertiary);
    border-radius: 8px;
    transition: background-color 0.2s ease;
  }
  
  .feature-toggle:hover {
    background: var(--button-hover-bg);
  }
  
  .feature-toggle input[type="checkbox"] {
    margin: 0;
    transform: scale(1.2);
  }
  
  .feature-info {
    flex: 1;
  }
  
  .feature-name {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
  }
  
  .feature-description {
    font-size: 0.9rem;
    color: var(--text-secondary);
  }
  
  .reset-button {
    background: var(--error-color);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s ease;
    margin-bottom: 0.5rem;
  }
  
  .reset-button:hover {
    opacity: 0.9;
  }
  
  .reset-description {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin: 0;
  }
</style>
