(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', init);

    // Keep this in sync with --transition-slide in site.css.
    var ANIMATION_MS = 650;
    var AUTO_PLAY_MS = 3200;

    function init() {
        createFanCarousel({
            stageId: 'fanStage',
            prevId: 'prevBtn',
            nextId: 'nextBtn',
            playId: 'playBtn',
            pillId: 'nowPlayingPill',
            metaSelector: '#playerBar .player-bar__meta',
            trackId: 'trackTitle',
            artistId: 'trackArtist',
            roles: ['left', 'center', 'right'],
            roleClassPrefix: 'fan-card--',
            slides: window.tmvSlides || []
        });

        createFanCarousel({
            stageId: 'desktopStage',
            prevId: 'prevBtnDesktop',
            nextId: 'nextBtnDesktop',
            playId: 'playBtnDesktop',
            pillId: 'nowPlayingPillDesktop',
            metaSelector: '#playerBarDesktop .player-bar__meta',
            trackId: 'trackTitleDesktop',
            artistId: 'trackArtistDesktop',
            roles: ['outer-left', 'inner-left', 'center', 'inner-right', 'outer-right'],
            roleClassPrefix: 'pos-',
            slides: window.tmvDesktopSlides || []
        });
    }

    // One rotation engine shared by every breakpoint's carousel. `roles` is
    // an ordered list of position names (outer-to-outer, center in the
    // middle); each card gets a `<roleClassPrefix><role>` class that CSS
    // gives its own transform, so "rotating" is just relabeling elements —
    // the browser animates the resulting transform change on its own.
    function createFanCarousel(opts) {
        var stage = document.getElementById(opts.stageId);
        var prevBtn = document.getElementById(opts.prevId);
        var nextBtn = document.getElementById(opts.nextId);
        var playBtn = document.getElementById(opts.playId);
        var pill = document.getElementById(opts.pillId);
        var meta = opts.metaSelector ? document.querySelector(opts.metaSelector) : null;
        var trackTitleEl = document.getElementById(opts.trackId);
        var trackArtistEl = document.getElementById(opts.artistId);

        if (!stage || !prevBtn || !nextBtn) {
            return;
        }

        var roles = opts.roles;
        var prefix = opts.roleClassPrefix;
        var slides = opts.slides || [];
        var centerRoleIndex = Math.floor(roles.length / 2);

        var cards = Array.prototype.slice.call(stage.querySelectorAll('.fan-card'));
        if (cards.length < roles.length) {
            return;
        }

        // order[i] = index (into `cards`) currently occupying roles[i].
        // Markup order maps 1:1 onto the role list to start with.
        var order = cards.map(function (_, i) { return i; }).slice(0, roles.length);
        var isAnimating = false;
        var isAutoPlaying = false;
        var autoPlayTimer = null;

        applyRoles(order);
        updateMeta(order[centerRoleIndex], false);

        nextBtn.addEventListener('click', function () { stopAutoPlay(); rotate(1); });
        prevBtn.addEventListener('click', function () { stopAutoPlay(); rotate(-1); });

        cards.forEach(function (card) {
            card.addEventListener('click', function () { activateCard(card); });
            card.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    activateCard(card);
                }
            });
        });

        stage.addEventListener('keydown', function (e) {
            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
            stopAutoPlay();
            rotate(e.key === 'ArrowRight' ? 1 : -1);
        });

        enableSwipe(stage, function (direction) { stopAutoPlay(); rotate(direction); });

        if (playBtn) {
            playBtn.addEventListener('click', toggleAutoPlay);
        }

        function activateCard(card) {
            if (isAnimating) return;
            var roleIndex = roles.indexOf(card.dataset.role);
            if (roleIndex === centerRoleIndex) return;
            stopAutoPlay();
            rotate(roleIndex > centerRoleIndex ? 1 : -1);
        }

        function rotate(direction) {
            if (isAnimating) return;
            isAnimating = true;
            [prevBtn, nextBtn].forEach(function (b) { b.disabled = true; });

            // Rotating "next" walks every card one role toward the outer-left
            // edge (the old center lands in the role just left of center);
            // "prev" walks the other way. Works for any role-list length.
            order = direction > 0
                ? order.slice(1).concat(order.slice(0, 1))
                : order.slice(-1).concat(order.slice(0, -1));

            applyRoles(order);
            updateMeta(order[centerRoleIndex], true);

            window.setTimeout(function () {
                isAnimating = false;
                [prevBtn, nextBtn].forEach(function (b) { b.disabled = false; });
            }, ANIMATION_MS);
        }

        function applyRoles(newOrder) {
            newOrder.forEach(function (cardIndex, roleIndex) {
                var card = cards[cardIndex];
                var role = roles[roleIndex];
                roles.forEach(function (r) { card.classList.remove(prefix + r); });
                card.classList.add(prefix + role);
                card.dataset.role = role;
                card.setAttribute('aria-current', roleIndex === centerRoleIndex ? 'true' : 'false');
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
