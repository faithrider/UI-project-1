<script>
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let { 
    title,
    message,
    showConfirm = false,
    confirmText = 'Yes',
    cancelText = 'Cancel'
  } = $props();
  
  function handleConfirm() {
    dispatch('confirm');
  }
  
  function handleCancel() {
    dispatch('cancel');
  }
  
  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      handleCancel();
    }
  }
</script>

<div 
  class="modal-backdrop" 
  onclick={handleBackdropClick}
  onkeydown={(e) => e.key === 'Escape' && handleCancel()}
  role="dialog"
  aria-modal="true"
  tabindex="-1"
>
  <div class="modal">
    <div class="modal-header">
      <h3>{title}</h3>
    </div>
    
    <div class="modal-content">
      <p>{message}</p>
    </div>
    
    <div class="modal-actions">
      {#if showConfirm}
        <button class="btn btn-secondary" onclick={handleCancel}>
          {cancelText}
        </button>
        <button class="btn btn-primary" onclick={handleConfirm}>
          {confirmText}
        </button>
      {:else}
        <button class="btn btn-primary" onclick={handleCancel}>
          OK
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease;
  }
  
  .modal {
    background: var(--bg-secondary);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    min-width: 400px;
    max-width: 500px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    animation: slideIn 0.3s ease;
  }
  
  .modal-header {
    padding: 1.5rem 1.5rem 1rem 1.5rem;
    border-bottom: 1px solid var(--border-color);
  }
  
  .modal-header h3 {
    margin: 0;
    color: var(--text-primary);
    font-size: 1.25rem;
  }
  
  .modal-content {
    padding: 1.5rem;
  }
  
  .modal-content p {
    margin: 0;
    color: var(--text-secondary);
    line-height: 1.5;
  }
  
  .modal-actions {
    padding: 1rem 1.5rem 1.5rem 1.5rem;
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }
  
  .btn {
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    border: none;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }
  
  .btn-primary {
    background: var(--primary-color);
    color: var(--primary-text);
  }
  
  .btn-primary:hover {
    filter: brightness(1.1);
  }
  
  .btn-secondary {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
  }
  
  .btn-secondary:hover {
    background: var(--button-hover-bg);
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideIn {
    from { 
      opacity: 0;
      transform: scale(0.9) translateY(-20px);
    }
    to { 
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
</style>