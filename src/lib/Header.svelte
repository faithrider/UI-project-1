<script>
  import { entries } from './stores.js';
  
  /** @type {string} */
  export let currentView;
  
  // Hardcoded for demo
  const userName = 'Alex';
  const startDate = new Date('2024-07-07');
  const today = new Date();
  
  const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  $: daysActive = $entries.length;
  
  $: currentDateTime = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
</script>



<header class="header">
  <div class="header-content">
    <div class="user-info">
      <h1>My Strength Tracker</h1>
      <div class="user-details">
        <span class="user-name">Welcome back, {userName}</span>
        <span class="date">{currentDateTime}</span>
        <div class="stats">
          <span>Day {daysSinceStart} • {daysActive} workouts logged</span>
        </div>
      </div>
    </div>
    
    <nav class="navigation">
      <button 
        class="nav-btn" 
        class:active={currentView === 'entry'}
        on:click={() => currentView = 'entry'}
      >
        New Entry
      </button>
      <button 
        class="nav-btn" 
        class:active={currentView === 'history'}
        on:click={() => currentView = 'history'}
      >
        History
      </button>
      <button 
        class="nav-btn" 
        class:active={currentView === 'overview'}
        on:click={() => currentView = 'overview'}
      >
        Overview
      </button>
      <button 
        class="nav-btn" 
        class:active={currentView === 'settings'}
        on:click={() => currentView = 'settings'}
      >
        Settings
      </button>
    </nav>
  </div>
</header>

<style>
  .header {
    border-bottom: 2px solid var(--border-color);
    background: var(--header-bg);
    width: 100%;
  }
  
  .header-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1.5rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .user-info {
    display: flex;
    flex-direction: column;
  }

  .user-info h1 {
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
    color: var(--primary-color);
  }

  .user-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .user-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .date {
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  .stats {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .navigation {
    display: flex;
    gap: 1rem;
  }

  .nav-btn {
    padding: 0.75rem 1.5rem;
    border: 2px solid var(--border-color);
    background: var(--button-bg);
    color: var(--text-primary);
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .nav-btn:hover {
    background: var(--button-hover-bg);
    border-color: var(--primary-color);
  }

  .nav-btn.active {
    background: var(--primary-color);
    color: var(--primary-text);
    border-color: var(--primary-color);
  }
</style>
