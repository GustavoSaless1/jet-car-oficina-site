(() => {
  'use strict';
  const form = document.querySelector('#quote-form');
  const formView = document.querySelector('#form-view');
  const resultView = document.querySelector('#result-view');
  const messagePreview = document.querySelector('#message-preview');
  const copyStatus = document.querySelector('#copy-status');
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('#mobile-nav');
  const contactPanel = document.querySelector('.contact-panel');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function closeMenu() {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menu');
    mobileNav.hidden = true;
  }
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Abrir menu' : 'Fechar menu');
    mobileNav.hidden = isOpen;
  });
  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 800) closeMenu(); });
  function focusForm() {
    formView.hidden = false;
    resultView.hidden = true;
    contactPanel.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
    form.elements.name.focus({ preventScroll: true });
  }
  document.querySelectorAll('[data-quote]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      closeMenu();
      if (trigger.dataset.quote) form.elements.service.value = trigger.dataset.quote;
      focusForm();
    });
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const values = new FormData(form);
    const name = String(values.get('name') || '').trim();
    const car = String(values.get('car') || '').trim();
    const service = String(values.get('service') || '').trim();
    const details = String(values.get('details') || '').trim();
    if (!name || !car || !service) {
      const field = !name ? form.elements.name : !car ? form.elements.car : form.elements.service;
      field.setCustomValidity('Preencha este campo para preparar sua mensagem.');
      field.reportValidity();
      field.addEventListener('input', () => field.setCustomValidity(''), { once: true });
      return;
    }
    messagePreview.value = `Olá, Jet Car! Meu nome é ${name}.\n\nMeu carro: ${car}\nServiço: ${service}${details ? `\nO que está acontecendo: ${details}` : ''}\n\nGostaria de consultar um orçamento e a disponibilidade para avaliação. Podem me orientar?`;
    document.querySelector('#send-whatsapp').href = 'https://wa.me/5511978020587?text=' + encodeURIComponent(messagePreview.value);
    formView.hidden = true;
    resultView.hidden = false;
    copyStatus.textContent = 'A solicitação ainda não foi enviada.';
    contactPanel.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
    document.querySelector('#result-title').focus({ preventScroll: true });
  });
  document.querySelector('#copy-message').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(messagePreview.value);
      copyStatus.textContent = 'Mensagem copiada! Você também pode continuar diretamente pelo botão do WhatsApp.';
    } catch {
      messagePreview.focus();
      messagePreview.select();
      copyStatus.textContent = 'Selecionei a mensagem. Use a opção Copiar do seu dispositivo e envie no WhatsApp.';
    }
  });
  document.querySelector('#edit-message').addEventListener('click', focusForm);
  const galleryDialog = document.querySelector('#gallery-dialog');
  const galleryButtons = Array.from(document.querySelectorAll('[data-gallery]'));
  const galleryStage = document.querySelector('.gallery-stage');
  if (galleryButtons.length === 1) {
    ['#gallery-prev', '#gallery-next', '#gallery-counter'].forEach(selector => document.querySelector(selector).hidden = true);
  }
  document.querySelectorAll('video').forEach(video => {
    video.addEventListener('play', () => document.querySelectorAll('video').forEach(other => { if (other !== video) other.pause(); }));
  });
  let galleryIndex = 0;
  let galleryTrigger;
  let previousOverflow = '';
  let touchStartX = null;
  function showPhoto(index) {
    galleryIndex = (index + galleryButtons.length) % galleryButtons.length;
    const button = galleryButtons[galleryIndex];
    const photo = button.querySelector('.real-photo');
    galleryStage.className = 'gallery-stage ' + Array.from(photo.classList).filter(item => item !== 'real-photo').join(' ');
    galleryStage.setAttribute('aria-label', photo.getAttribute('aria-label'));
    document.querySelector('#gallery-caption').textContent = button.closest('figure').querySelector('figcaption strong').textContent;
    document.querySelector('#gallery-counter').textContent = `${galleryIndex + 1} / ${galleryButtons.length}`;
  }
  galleryButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      galleryTrigger = button;
      showPhoto(index);
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      galleryDialog.showModal();
    });
  });
  document.querySelector('.gallery-close').addEventListener('click', () => galleryDialog.close());
  document.querySelector('#gallery-prev').addEventListener('click', () => showPhoto(galleryIndex - 1));
  document.querySelector('#gallery-next').addEventListener('click', () => showPhoto(galleryIndex + 1));
  galleryDialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(galleryIndex - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(galleryIndex + 1); }
  });
  galleryDialog.addEventListener('click', event => {
    const bounds = galleryDialog.getBoundingClientRect();
    if (event.target === galleryDialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) galleryDialog.close();
  });
  galleryDialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    touchStartX = null;
    galleryTrigger?.focus({ preventScroll: true });
  });
  galleryStage.addEventListener('touchstart', event => { touchStartX = event.touches.length === 1 ? event.touches[0].clientX : null; }, { passive: true });
  galleryStage.addEventListener('touchend', event => {
    if (touchStartX === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(delta) > 45) showPhoto(galleryIndex + (delta > 0 ? -1 : 1));
  }, { passive: true });
  galleryStage.addEventListener('touchcancel', () => { touchStartX = null; }, { passive: true });
  document.querySelector('#load-map').addEventListener('click', () => {
    const map = document.querySelector('#location-map');
    const address = 'Tv. Somos Todos Iguais, 1034, Jardim da Conquista, São Paulo, SP, 08343-000';
    map.src = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=16&output=embed`;
    map.hidden = false;
    document.querySelector('#map-placeholder').hidden = true;
  });
  document.querySelector('#year').textContent = new Intl.DateTimeFormat('pt-BR', { year: 'numeric', timeZone: 'America/Sao_Paulo' }).format(new Date());
})();
