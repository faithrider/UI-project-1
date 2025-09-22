<script>
  import Header from '../lib/Header.svelte';
  import EntryForm from '../lib/EntryForm.svelte';
  import EntryList from '../lib/EntryList.svelte';
  import Overview from '../lib/Overview.svelte';
  import Settings from '../lib/Settings.svelte';
  import Modal from '../lib/Modal.svelte';
  import { workoutStore, settingsStore, theme, modal, initStores } from '../lib/stores.js';
  import { onMount } from 'svelte';

  let currentView = 'entry';

  onMount(() => {
    initStores();
    document.body.className = `theme-${$theme}`;
  });

  // Keep theme in sync with store changes
  $: if (typeof document !== 'undefined') {
    document.body.className = `theme-${$theme}`;
  }
</script>

<div class="app">
  <Header bind:currentView />
  
  <main class="main-content">
    <div class="content-area">
      {#if currentView === 'entry'}
        <EntryForm />
      {:else if currentView === 'history'}
        <EntryList />
      {:else if currentView === 'overview'}
        <Overview />
      {:else if currentView === 'settings'}
        <Settings />
      {/if}
    </div>
    
    <aside class="sidebar">
      {#if currentView === 'entry'}
        <Overview compact={true} />
      {/if}
      <Settings compact={true} />
    </aside>
  </main>
</div>

{#if $modal}
  <Modal 
    title={$modal.title}
    message={$modal.message}
    showConfirm={$modal.showConfirm}
    confirmText={$modal.confirmText}
    cancelText={$modal.cancelText}
    on:confirm={$modal.onConfirm}
    on:cancel={$modal.onCancel}
  />
{/if}

<style>
  .app {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .main-content {
    display: flex;
    flex: 1;
    gap: 2rem;
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  .content-area {
    flex: 2;
  }

  .sidebar {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
</style>
