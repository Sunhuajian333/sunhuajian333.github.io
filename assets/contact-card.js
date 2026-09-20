const dialog = document.querySelector('#contactDialog');
const openButton = document.querySelector('#contactCardOpen');
const closeButton = document.querySelector('#contactDialogClose');
const status = document.querySelector('#contactDialogStatus');

if (dialog && openButton && closeButton) {
  openButton.addEventListener('click', () => dialog.showModal());
  closeButton.addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', (event) => {
    const rect = dialog.getBoundingClientRect();
    const inside = event.clientX >= rect.left && event.clientX <= rect.right
      && event.clientY >= rect.top && event.clientY <= rect.bottom;
    if (!inside) dialog.close();
  });

  dialog.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const value = button.dataset.copy;
      try {
        await navigator.clipboard.writeText(value);
        status.textContent = `已复制：${value}`;
        button.textContent = '已复制';
        window.setTimeout(() => {
          button.textContent = '复制';
          status.textContent = '';
        }, 1800);
      } catch {
        status.textContent = `请手动复制：${value}`;
      }
    });
  });
}
