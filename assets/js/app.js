const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const loader = $('#loader');
const siteHeader = $('#siteHeader');
const navToggle = $('#navToggle');
const navMenu = $('#navMenu');
const navLinks = $$('.nav a');

window.addEventListener('load', () => {
  setTimeout(() => loader.classList.add('hidden'), 900);
});

navToggle.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

window.addEventListener('scroll', () => {
  siteHeader.classList.toggle('scrolled', window.scrollY > 24);

  const heroAside = document.querySelector('.hero__aside');
  if (heroAside && window.scrollY < window.innerHeight) {
    heroAside.style.transform = `translateY(${window.scrollY * 0.05}px)`;
  }

  const fromTop = window.scrollY + 120;
  navLinks.forEach(link => {
    const section = document.querySelector(link.hash);
    if (!section) return;
    const active = section.offsetTop <= fromTop && section.offsetTop + section.offsetHeight > fromTop;
    link.classList.toggle('active', active);
  });
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

function observeReveals() {
  $$('.reveal').forEach(el => revealObserver.observe(el));
}

function createMediaItem(item, index, staggerIndex) {
  const button = document.createElement('button');
  button.className = 'media-item';
  button.type = 'button';
  button.dataset.category = item.category;
  button.style.setProperty('--i', staggerIndex);
  button.innerHTML = `
    <img src="${item.src}" alt="${item.title}" loading="lazy" />
    <span>${item.category}</span>
  `;
  button.addEventListener('click', () => openLightbox(index, MEDIA_ITEMS));
  return button;
}

function setupMediaWallMotion() {
  const items = $$('.media-item');
  if (!items.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  items.forEach(item => {
    revealObserver.observe(item);
    if (reduceMotion) {
      item.classList.add('in-view');
      return;
    }

    item.addEventListener('pointermove', event => {
      const rect = item.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      item.style.setProperty('--mx', `${x * 100}%`);
      item.style.setProperty('--my', `${y * 100}%`);
      item.style.setProperty('--ry', `${((x - .5) * 8).toFixed(2)}deg`);
      item.style.setProperty('--rx', `${((.5 - y) * 8).toFixed(2)}deg`);
    });

    item.addEventListener('pointerleave', () => {
      item.style.setProperty('--mx', '50%');
      item.style.setProperty('--my', '50%');
      item.style.setProperty('--rx', '0deg');
      item.style.setProperty('--ry', '0deg');
    });
  });
}

function renderMedia(filter = 'all') {
  const grid = $('#mediaGrid');
  grid.innerHTML = '';
  let staggerIndex = 0;
  MEDIA_ITEMS.forEach((item, index) => {
    if (filter !== 'all' && item.category !== filter) return;
    grid.appendChild(createMediaItem(item, index, staggerIndex));
    staggerIndex += 1;
  });
  setupMediaWallMotion();
}

function renderPlayers() {
  const grid = $('#playersGrid');
  grid.innerHTML = PLAYERS.map((player, index) => `
    <article class="player-card reveal delay-${index % 3}" data-number="${player.number}">
      <img src="${player.image}" alt="${player.name}" loading="lazy" />
      <div class="player-card__body">
        <h3>#${player.number} ${player.name}</h3>
        ${player.nickname ? `<p><strong>Nickname:</strong> ${player.nickname}</p>` : ''}
        <p><strong>Height:</strong> ${player.height}</p>
        <p><strong>Position:</strong> ${player.position}</p>
        <p><strong>College:</strong> ${player.college}</p>
        ${player.note ? `<span class="player-note">${player.note}</span>` : ''}
      </div>
    </article>
  `).join('');

  $$('.player-card', grid).forEach((card, index) => {
    card.addEventListener('click', () => openLightbox(index, PLAYERS.map(p => ({ src: p.image, title: `${p.name} • #${p.number}` }))));
  });
}

function renderTournaments() {
  const timeline = $('#tournamentTimeline');
  timeline.innerHTML = TOURNAMENTS.map((tournament, index) => `
    <article class="tournament-card reveal delay-${index % 3}">
      <img class="cover" src="${tournament.cover}" alt="${tournament.title}" loading="lazy" />
      <div>
        <p class="eyebrow">${tournament.kicker}</p>
        <h3>${tournament.title}</h3>
        <p class="meta">${tournament.meta}</p>
        <span class="result-pill">${tournament.result}</span>
        <p>${tournament.story}</p>
        <ul class="roster">
          ${tournament.roster.map(name => `<li>${name}</li>`).join('')}
        </ul>
        <div class="mini-gallery" aria-label="${tournament.title} media">
          ${tournament.gallery.map((img, imgIndex) => `
            <img src="assets/images/${img}" alt="${tournament.title} image ${imgIndex + 1}" loading="lazy" data-tournament="${index}" data-image-index="${imgIndex}" />
          `).join('')}
        </div>
      </div>
    </article>
  `).join('');

  $$('.mini-gallery img', timeline).forEach(img => {
    img.addEventListener('click', () => {
      const tournament = TOURNAMENTS[Number(img.dataset.tournament)];
      const list = tournament.gallery.map(file => ({ src: `assets/images/${file}`, title: tournament.title }));
      openLightbox(Number(img.dataset.imageIndex), list);
    });
  });
}

function renderAchievements() {
  const grid = $('#achievementGrid');
  grid.innerHTML = ACHIEVEMENTS.map((achievement, index) => `
    <article class="achievement-card reveal delay-${index % 3}">
      <img src="${achievement.image}" alt="${achievement.title}" loading="lazy" />
      <div class="achievement-card__body">
        <div class="achievement-value">${achievement.value}</div>
        <h3>${achievement.title}</h3>
        <p>${achievement.text}</p>
      </div>
    </article>
  `).join('');

  $$('.achievement-card', grid).forEach((card, index) => {
    card.addEventListener('click', () => openLightbox(index, ACHIEVEMENTS.map(a => ({ src: a.image, title: `${a.title} • ${a.value}` }))));
  });
}

$('#filterBar').addEventListener('click', (event) => {
  const button = event.target.closest('.filter');
  if (!button) return;
  $$('.filter').forEach(btn => btn.classList.remove('active'));
  button.classList.add('active');
  renderMedia(button.dataset.filter);
});

let lightboxList = [];
let lightboxIndex = 0;
const lightbox = $('#lightbox');
const lightboxImage = $('#lightboxImage');
const lightboxCaption = $('#lightboxCaption');

function openLightbox(index, list) {
  lightboxList = list;
  lightboxIndex = index;
  updateLightbox();
  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function updateLightbox() {
  const item = lightboxList[lightboxIndex];
  lightboxImage.src = item.src;
  lightboxCaption.textContent = item.title || 'Elkordy Brothers media';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function nextImage(direction) {
  lightboxIndex = (lightboxIndex + direction + lightboxList.length) % lightboxList.length;
  updateLightbox();
}

$('#lightboxClose').addEventListener('click', closeLightbox);
$('#lightboxPrev').addEventListener('click', () => nextImage(-1));
$('#lightboxNext').addEventListener('click', () => nextImage(1));
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});
window.addEventListener('keydown', (event) => {
  if (!lightbox.classList.contains('active')) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') nextImage(-1);
  if (event.key === 'ArrowRight') nextImage(1);
});

function animateCounters() {
  const counters = $$('[data-count]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const end = Number(el.dataset.count);
      const duration = 1600;
      const startTime = performance.now();
      const formatter = new Intl.NumberFormat('en-US');
      function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = formatter.format(Math.floor(end * eased));
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: .8 });
  counters.forEach(counter => observer.observe(counter));
}

function setupTiltCards() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  $$('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', event => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = ((x / rect.width) - .5) * 4;
      const rotateX = ((y / rect.height) - .5) * -4;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

renderMedia();
renderPlayers();
renderTournaments();
renderAchievements();
observeReveals();
animateCounters();
setupTiltCards();
siteHeader.classList.toggle('scrolled', window.scrollY > 24);
