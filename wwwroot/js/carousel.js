(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', init);

    // Keep this in sync with --transition-slide in site.css.
    var ANIMATION_MS = 650;
    var AUTO_PLAY_MS = 3200;
    var ROLES = ['left', 'center', 'right'];

    function init() {
        var stage = document.getElementById('fanStage');
        var prevBtn = document.getElementById('prevBtn');
        var nextBtn = document.getElementById('nextBtn');
        var playBtn = document.getElementById('playBtn');
        var pill = document.getElementById('nowPlayingPill');
        var meta = document.querySelector('.player-bar__meta');
        var trackTitleEl = document.getElementById('trackTitle');
        var trackArtistEl = document.getElementById('trackArtist');

        if (!stage || !prevBtn || !nextBtn) {
            return;
        }

        var cards = Array.prototype.slice.call(stage.querySelectorAll('.fan-card'));
        var slides = window.tmvSlides || [];

        if (!cards.length) {
            return;
        }

        // order[i] = index (into `cards`) currently occupying ROLES[i].
        // Markup order maps 1:1 onto left / center / right to start with.
        var order = cards.map(function (_, i) { return i; }).slice(0, ROLES.length);
        var isAnimating = false;
        var isAutoPlaying = false;
        var autoPlayTimer = null;

        applyRoles(order);
        updateMeta(order[1], false);

        nextBtn.addEventListener('click', function () { stopAutoPlay(); rotate(1); });
        prevBtn.addEventListener('click', function () { stopAutoPlay(); rotate(-1); });

        cards.forEach(function (card, index) {
            card.addEventListener('click', function () {
                if (isAnimating) return;
                stopAutoPlay();
                var role = card.dataset.role;
                if (role === 'right') rotate(1);
                if (role === 'left') rotate(-1);
            });
        });

        document.addEventListener('keydown', function (e) {
            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
            stopAutoPlay();
            rotate(e.key === 'ArrowRight' ? 1 : -1);
        });

        enableSwipe(stage, function (direction) { stopAutoPlay(); rotate(direction); });

        if (playBtn) {
            playBtn.addEventListener('click', toggleAutoPlay);
        }

        function rotate(direction) {
            if (isAnimating || cards.length < ROLES.length) return;
            isAnimating = true;
            [prevBtn, nextBtn].forEach(function (b) { b.disabled = true; });

            order = direction > 0
                ? [order[1], order[2], order[0]]
                : [order[2], order[0], order[1]];

            applyRoles(order);
            updateMeta(order[1], true);

            window.setTimeout(function () {
                isAnimating = false;
                [prevBtn, nextBtn].forEach(function (b) { b.disabled = false; });
            }, ANIMATION_MS);
        }

        function applyRoles(newOrder) {
            newOrder.forEach(function (cardIndex, roleIndex) {
                var card = cards[cardIndex];
                var role = ROLES[roleIndex];
                card.classList.remove('fan-card--left', 'fan-card--center', 'fan-card--right');
                card.classList.add('fan-card--' + role);
                card.dataset.role = role;
                card.setAttribute('aria-current', role === 'center' ? 'true' : 'false');
            });
        }

        function updateMeta(cardIndex, animate) {
            var slide = slides[cardIndex];
            if (!slide || !trackTitleEl || !trackArtistEl) return;

            var apply = function () {
                trackTitleEl.textContent = slide.Track || slide.track || '';
                trackArtistEl.textContent = 'by ' + (slide.Artist || slide.artist || '');
                if (meta) meta.classList.remove('is-updating');
            };

            if (!animate || !meta) {
                apply();
                return;
            }

            meta.classList.add('is-updating');
            window.setTimeout(apply, 180);
        }

        function toggleAutoPlay() {
            if (isAutoPlaying) {
                stopAutoPlay();
            } else {
                startAutoPlay();
            }
        }

        function startAutoPlay() {
            isAutoPlaying = true;
            playBtn.classList.add('is-playing');
            playBtn.setAttribute('aria-pressed', 'true');
            playBtn.setAttribute('aria-label', 'Pause animation');
            if (pill) pill.classList.add('is-playing');

            autoPlayTimer = window.setInterval(function () { rotate(1); }, AUTO_PLAY_MS);
        }

        function stopAutoPlay() {
            if (!isAutoPlaying) return;
            isAutoPlaying = false;
            playBtn.classList.remove('is-playing');
            playBtn.setAttribute('aria-pressed', 'false');
            playBtn.setAttribute('aria-label', 'Play animation');
            if (pill) pill.classList.remove('is-playing');

            window.clearInterval(autoPlayTimer);
            autoPlayTimer = null;
        }

        function enableSwipe(target, onSwipe) {
            var startX = 0;
            var startY = 0;
            var tracking = false;
            var THRESHOLD = 40;

            target.addEventListener('pointerdown', function (e) {
                tracking = true;
                startX = e.clientX;
                startY = e.clientY;
            });

            target.addEventListener('pointerup', function (e) {
                if (!tracking) return;
                tracking = false;
                var dx = e.clientX - startX;
                var dy = e.clientY - startY;
                if (Math.abs(dx) > THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
                    onSwipe(dx < 0 ? 1 : -1);
                }
            });

            target.addEventListener('pointercancel', function () { tracking = false; });
        }
    }
})();
