document.addEventListener('DOMContentLoaded', () => {
  // Auto-dismiss alerts after 5 seconds
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(alert => {
    setTimeout(() => {
      alert.style.opacity = '0';
      alert.style.transition = 'opacity 0.5s ease';
      setTimeout(() => alert.remove(), 500);
    }, 5000);
  });

  // Handle component type field toggling in create/edit component view
  const componentTypeSelect = document.getElementById('component-type-select');
  if (componentTypeSelect) {
    const handleComponentFields = (selectedType) => {
      // Hide all dynamic field containers
      const containers = document.querySelectorAll('.component-fields');
      containers.forEach(c => c.style.display = 'none');

      // Disable all inputs inside these containers to avoid submitting unselected fields
      const inputs = document.querySelectorAll('.component-fields input, .component-fields select');
      inputs.forEach(i => i.disabled = true);

      // Show and enable fields for selected type
      const targetContainer = document.getElementById(`fields-${selectedType}`);
      if (targetContainer) {
        targetContainer.style.display = 'block';
        const targetInputs = targetContainer.querySelectorAll('input, select');
        targetInputs.forEach(i => i.disabled = false);
      }
    };

    componentTypeSelect.addEventListener('change', (e) => {
      handleComponentFields(e.target.value);
    });

    // Run on initial load
    handleComponentFields(componentTypeSelect.value);
  }
});

// Delete confirmation dialog
function confirmDelete(message = '¿Está seguro de que desea eliminar este registro?') {
  return confirm(message);
}
