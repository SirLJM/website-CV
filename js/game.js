class Game {
    constructor() {
        this.state = Persistence.load();
        this.lastClickTime = 0;
        this.comboCount = 0;
        this.autoClickAccumulator = 0;

        this.elements = {
            totalClicks: document.getElementById('total-clicks'),
            cps: document.getElementById('clicks-per-second'),
            nextUnlockName: document.getElementById('next-unlock-name'),
            nextUnlockAt: document.getElementById('next-unlock-at'),
            progressFill: document.getElementById('progress-fill'),
            clickArea: document.getElementById('click-area'),
            clickCircle: document.querySelector('.click-circle'),
            floatingNumbers: document.getElementById('floating-numbers'),
            storeMenu: document.getElementById('store-menu'),
            upgradesList: document.getElementById('upgrades-list'),
            themesList: document.getElementById('themes-list'),
            cvPanel: document.getElementById('cv-panel'),
            cvToggle: document.getElementById('cv-toggle'),
            langToggle: document.getElementById('lang-toggle'),
            soundToggle: document.getElementById('sound-toggle'),
            achievementToast: document.getElementById('achievement-toast'),
            resetBtn: document.getElementById('reset-btn')
        };

        this.bindEvents();
        this.updateDisplay();
    }

    bindEvents() {
        this.elements.clickArea.addEventListener('click', (e) => this.handleClick(e));
        this.elements.clickArea.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleClick(e.touches[0]);
        }, { passive: false });

        this.elements.cvToggle.addEventListener('click', () => {
            this.elements.cvPanel.classList.toggle('collapsed');
        });

        this.elements.langToggle.addEventListener('click', () => this.toggleLanguage());

        this.elements.soundToggle.addEventListener('click', () => this.toggleSound());

        this.elements.resetBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.resetProgress();
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.save();
            }
        });

        window.addEventListener('beforeunload', () => this.save());
    }

    handleClick(e) {
        if (e.target.closest('#store-menu') || e.target.closest('#cv-toggle')) {
            return;
        }

        const now = Date.now();
        let clickValue = this.state.clickPower * this.state.multiplier;
        let isCrit = false;

        if (this.state.critChance > 0 && Math.random() < this.state.critChance) {
            clickValue *= 3;
            isCrit = true;
        }

        if (this.state.comboEnabled) {
            const timeSinceLastClick = now - this.lastClickTime;
            if (timeSinceLastClick < 300) {
                this.comboCount = Math.min(this.comboCount + 1, 10);
                clickValue *= (1 + this.comboCount * 0.1);
            } else {
                this.comboCount = 0;
            }
        }

        clickValue = Math.floor(clickValue);
        const oldClicks = this.state.totalClicks;
        this.state.totalClicks += clickValue;
        this.lastClickTime = now;

        this.createFloatingNumber(e.clientX, e.clientY, clickValue, isCrit);
        this.createRipple(e.clientX, e.clientY);
        this.animateClickTarget();

        if (isCrit) {
            Audio.playCrit();
        } else {
            Audio.playClick();
        }

        this.checkUnlocks(oldClicks, this.state.totalClicks);
        this.checkStoreUnlock();
        this.updateDisplay();
    }

    createFloatingNumber(x, y, value, isCrit) {
        const num = document.createElement('div');
        num.className = `floating-number ${isCrit ? 'crit' : ''}`;
        num.textContent = `+${value}`;
        num.style.left = `${x}px`;
        num.style.top = `${y}px`;
        this.elements.floatingNumbers.appendChild(num);

        setTimeout(() => num.remove(), 1000);
    }

    createRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.left = `${x - 100}px`;
        ripple.style.top = `${y - 100}px`;
        this.elements.clickArea.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    }

    animateClickTarget() {
        this.elements.clickCircle.classList.add('clicked');
        this.elements.totalClicks.classList.add('bump');

        setTimeout(() => {
            this.elements.clickCircle.classList.remove('clicked');
            this.elements.totalClicks.classList.remove('bump');
        }, 100);
    }

    checkUnlocks(oldClicks, newClicks) {
        const unlocks = CVRenderer.getNewUnlocks(oldClicks, newClicks);

        for (const unlock of unlocks) {
            this.state.unlockedSections.push(unlock.section);
            CVRenderer.renderSection(unlock.section);
            this.showAchievement(`Unlocked: ${unlock.name}`);
            this.flashScreen();
            Audio.playUnlock();

            if (unlock.section === 'header') {
                this.elements.langToggle.classList.remove('hidden');
            }

            if (this.elements.cvPanel.classList.contains('collapsed')) {
                this.elements.cvPanel.classList.remove('collapsed');
            }
        }
    }

    checkStoreUnlock() {
        if (this.state.totalClicks >= Store.UNLOCK_THRESHOLD) {
            this.elements.storeMenu.classList.remove('hidden');
        }
    }

    showAchievement(text) {
        this.elements.achievementToast.textContent = text;
        this.elements.achievementToast.classList.remove('hidden');
        this.elements.achievementToast.classList.add('visible', 'achievement-unlock');

        setTimeout(() => {
            this.elements.achievementToast.classList.remove('visible', 'achievement-unlock');
            setTimeout(() => {
                this.elements.achievementToast.classList.add('hidden');
            }, 300);
        }, 2000);
    }

    flashScreen() {
        const flash = document.createElement('div');
        flash.className = 'screen-flash';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 300);
    }

    purchaseItem(type, id, cost) {
        if (this.state.totalClicks < cost) return false;

        this.state.totalClicks -= cost;

        if (type === 'upgrade') {
            Store.applyUpgrade(this.state, id);
        } else if (type === 'theme') {
            this.state.purchasedThemes.push(id);
            this.state.ownedTheme = id;
            Store.applyTheme(id);
        }

        Audio.playPurchase();
        this.createPurchaseParticles();
        this.updateDisplay();
        this.save();

        return true;
    }

    applyTheme(themeId) {
        this.state.ownedTheme = themeId;
        Store.applyTheme(themeId);
        this.updateDisplay();
        this.save();
    }

    createPurchaseParticles() {
        const colors = ['#FF6B35', '#4ECDC4', '#F7DC6F', '#45B7D1'];
        const container = document.createElement('div');
        container.className = 'purchase-particles';
        container.style.left = '50%';
        container.style.top = '50%';
        document.body.appendChild(container);

        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            const angle = (i / 12) * Math.PI * 2;
            const distance = 50 + Math.random() * 50;
            particle.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
            particle.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
            container.appendChild(particle);
        }

        setTimeout(() => container.remove(), 800);
    }

    toggleLanguage() {
        this.state.language = this.state.language === 'en' ? 'pl' : 'en';
        CVRenderer.setLanguage(this.state.language);
        this.elements.langToggle.textContent = this.state.language.toUpperCase();

        CVRenderer.renderAllUnlocked(this.state.unlockedSections);
        this.save();
    }

    toggleSound() {
        this.state.soundEnabled = !this.state.soundEnabled;
        Audio.setEnabled(this.state.soundEnabled);
        this.updateSoundIcons();
        this.save();
    }

    updateSoundIcons() {
        const soundOn = this.elements.soundToggle.querySelector('.sound-on');
        const soundOff = this.elements.soundToggle.querySelector('.sound-off');
        soundOn.classList.toggle('hidden', !this.state.soundEnabled);
        soundOff.classList.toggle('hidden', this.state.soundEnabled);
    }

    resetProgress() {
        if (!confirm('Reset all progress? This cannot be undone.')) return;

        Persistence.clear();
        this.state = { ...Persistence.defaultState };

        Store.applyTheme(null);

        document.querySelectorAll('.cv-section').forEach(section => {
            if (section.id !== 'cv-welcome') {
                section.classList.add('locked');
                section.innerHTML = '';
            }
        });

        this.elements.storeMenu.classList.add('hidden');
        this.elements.langToggle.classList.add('hidden');
        this.elements.cvPanel.classList.add('collapsed');

        this.updateSoundIcons();
        this.updateDisplay();
    }

    updateDisplay() {
        this.elements.totalClicks.textContent = this.formatNumber(this.state.totalClicks);

        const cps = Store.getAutoClickRate(this.state);
        this.elements.cps.textContent = cps.toFixed(1);

        const nextUnlock = CVRenderer.getNextUnlock(this.state.totalClicks);
        if (nextUnlock) {
            this.elements.nextUnlockName.textContent = nextUnlock.name;
            this.elements.nextUnlockAt.textContent = `${nextUnlock.clicks} clicks`;
        } else {
            this.elements.nextUnlockName.textContent = 'All unlocked!';
            this.elements.nextUnlockAt.textContent = '';
        }

        const progress = CVRenderer.getProgress(this.state.totalClicks);
        this.elements.progressFill.style.width = `${progress * 100}%`;

        Store.renderUpgrades(
            this.elements.upgradesList,
            this.state,
            (type, id, cost) => this.purchaseItem(type, id, cost)
        );

        Store.renderThemes(
            this.elements.themesList,
            this.state,
            (type, id, cost) => this.purchaseItem(type, id, cost),
            (id) => this.applyTheme(id)
        );
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    tick(deltaTime) {
        const autoClickRate = Store.getAutoClickRate(this.state);
        if (autoClickRate > 0) {
            this.autoClickAccumulator += autoClickRate * deltaTime;
            if (this.autoClickAccumulator >= 1) {
                const clicks = Math.floor(this.autoClickAccumulator);
                const oldClicks = this.state.totalClicks;
                this.state.totalClicks += clicks;
                this.autoClickAccumulator -= clicks;

                this.checkUnlocks(oldClicks, this.state.totalClicks);
                this.updateDisplay();
            }
        }
    }

    save() {
        this.state.lastSave = Date.now();
        Persistence.save(this.state);
    }

    async init() {
        await CVRenderer.loadData();
        CVRenderer.setLanguage(this.state.language);

        Audio.init();
        Audio.setEnabled(this.state.soundEnabled);
        this.updateSoundIcons();

        this.elements.langToggle.textContent = this.state.language.toUpperCase();

        if (this.state.unlockedSections.length > 0) {
            this.elements.langToggle.classList.remove('hidden');
            CVRenderer.renderAllUnlocked(this.state.unlockedSections);
        }

        if (this.state.ownedTheme) {
            Store.applyTheme(this.state.ownedTheme);
        }

        this.checkStoreUnlock();
        this.updateDisplay();

        setInterval(() => this.save(), 30000);
    }
}
