class Game {
    constructor() {
        this.state = Persistence.load();
        this.lastClickTime = 0;
        this.comboCount = 0;
        this.autoClickAccumulator = 0;

        this.quizData = {
            questions: [
                {
                    text: {
                        en: 'What challenge does your team face most?',
                        pl: 'Z jakim wyzwaniem Twój zespół mierzy się najczęściej?'
                    },
                    options: [
                        { text: { en: 'Technical debt and system reliability', pl: 'Dług techniczny i niezawodność systemów' }, profile: 'it' },
                        { text: { en: 'Missed deadlines and resource coordination', pl: 'Przekraczane terminy i koordynacja zasobów' }, profile: 'pm' },
                        { text: { en: 'Unclear requirements and stakeholder misalignment', pl: 'Niejasne wymagania i rozbieżności interesariuszy' }, profile: 'ba' }
                    ]
                },
                {
                    text: {
                        en: 'What would the ideal candidate focus on first?',
                        pl: 'Na czym idealny kandydat skupiłby się najpierw?'
                    },
                    options: [
                        { text: { en: 'Reviewing the codebase and architecture', pl: 'Przegląd kodu i architektury' }, profile: 'it' },
                        { text: { en: 'Understanding ongoing initiatives and blockers', pl: 'Zrozumienie bieżących inicjatyw i blokerów' }, profile: 'pm' },
                        { text: { en: 'Mapping current processes and pain points', pl: 'Mapowanie procesów i problemów' }, profile: 'ba' }
                    ]
                },
                {
                    text: {
                        en: 'What does your team need most right now?',
                        pl: 'Czego Twój zespół najbardziej potrzebuje teraz?'
                    },
                    options: [
                        { text: { en: 'Someone who can architect and build solutions', pl: 'Kogoś, kto zaprojektuje i zbuduje rozwiązania' }, profile: 'it' },
                        { text: { en: 'Someone who can drive delivery and keep things on track', pl: 'Kogoś, kto poprowadzi dostawy i utrzyma tempo' }, profile: 'pm' },
                        { text: { en: 'Someone who bridges business needs and technical teams', pl: 'Kogoś, kto połączy potrzeby biznesu z zespołami technicznymi' }, profile: 'ba' }
                    ]
                }
            ],
            profiles: {
                it: { name: { en: 'IT Developer', pl: 'Programista IT' } },
                pm: { name: { en: 'Project Manager', pl: 'Kierownik Projektu' } },
                ba: { name: { en: 'Business Analyst', pl: 'Analityk Biznesowy' } }
            }
        };
        this.quizState = { currentQuestion: 0, scores: { it: 0, pm: 0, ba: 0 } };

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
            resetBtn: document.getElementById('reset-btn'),
            achievementsBtn: document.getElementById('achievements-btn'),
            achievementsModal: document.getElementById('achievements-modal'),
            achievementsClose: document.getElementById('achievements-close'),
            achievementsList: document.getElementById('achievements-list'),
            quizModal: document.getElementById('cv-quiz-modal'),
            quizClose: document.getElementById('quiz-close'),
            quizContent: document.getElementById('quiz-content'),
            quizResult: document.getElementById('quiz-result')
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

        this.elements.achievementsBtn.addEventListener('click', () => this.openAchievements());
        this.elements.achievementsClose.addEventListener('click', () => this.closeAchievements());
        this.elements.achievementsModal.addEventListener('click', (e) => {
            if (e.target === this.elements.achievementsModal) this.closeAchievements();
        });

        this.elements.quizClose.addEventListener('click', () => this.closeQuiz());
        this.elements.quizModal.addEventListener('click', (e) => {
            if (e.target === this.elements.quizModal) this.closeQuiz();
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
        this.checkAchievements();
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

            if (unlock.section === 'contact' && !this.state.quizCompleted) {
                setTimeout(() => this.showCvQuiz(), 1500);
            }

            if (this.elements.cvPanel.classList.contains('collapsed')) {
                this.elements.cvPanel.classList.remove('collapsed');
            }
        }
    }

    checkStoreUnlock() {
        if (this.state.totalClicks >= Store.UNLOCK_THRESHOLD) {
            const wasHidden = this.elements.storeMenu.classList.contains('hidden');
            this.elements.storeMenu.classList.remove('hidden');
            if (wasHidden) {
                this.showAchievement('🛍️ Store Unlocked!');
                Audio.playUnlock();
            }
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
        this.checkAchievements();
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

    openAchievements() {
        Achievements.render(this.elements.achievementsList, this.state);
        this.elements.achievementsModal.classList.remove('hidden');
    }

    closeAchievements() {
        this.elements.achievementsModal.classList.add('hidden');
    }

    showCvQuiz() {
        this.quizState = { currentQuestion: 0, scores: { it: 0, pm: 0, ba: 0 } };
        this.elements.quizResult.classList.add('hidden');
        this.elements.quizContent.classList.remove('hidden');
        this.renderQuizQuestion();
        this.elements.quizModal.classList.remove('hidden');
    }

    renderQuizQuestion() {
        const q = this.quizData.questions[this.quizState.currentQuestion];
        const lang = this.state.language;
        const total = this.quizData.questions.length;
        const current = this.quizState.currentQuestion + 1;

        let html = `
            <div class="quiz-progress">${current} / ${total}</div>
            <div class="quiz-question">${q.text[lang]}</div>
            <div class="quiz-options">
        `;

        const shuffled = [...q.options].sort(() => Math.random() - 0.5);
        for (const opt of shuffled) {
            html += `<button class="quiz-option" data-profile="${opt.profile}">${opt.text[lang]}</button>`;
        }

        html += '</div>';
        this.elements.quizContent.innerHTML = html;

        this.elements.quizContent.querySelectorAll('.quiz-option').forEach(btn => {
            btn.addEventListener('click', () => this.handleQuizAnswer(btn.dataset.profile));
        });
    }

    handleQuizAnswer(profile) {
        this.quizState.scores[profile]++;

        if (this.quizState.currentQuestion < this.quizData.questions.length - 1) {
            this.quizState.currentQuestion++;
            this.renderQuizQuestion();
        } else {
            this.showQuizResult();
        }
    }

    showQuizResult() {
        const scores = this.quizState.scores;
        const lang = this.state.language;

        let result = 'it';
        if (scores.pm > scores[result]) result = 'pm';
        if (scores.ba > scores[result]) result = 'ba';

        this.state.cvType = result;
        this.state.quizCompleted = true;
        this.save();

        const profileName = this.quizData.profiles[result].name[lang];
        const downloadUrl = `https://github.com/SirLJM/CV/releases/latest/download/Lukasz.Wisniewski.CV.${result.toUpperCase()}.${lang}.pdf`;

        const labels = {
            en: {
                match: 'Your best match:',
                desc: 'Based on your answers, the CV version that best fits your needs is:',
                download: 'Download CV'
            },
            pl: {
                match: 'Najlepsze dopasowanie:',
                desc: 'Na podstawie Twoich odpowiedzi, wersja CV najlepiej pasująca do Twoich potrzeb:',
                download: 'Pobierz CV'
            }
        };

        this.elements.quizContent.classList.add('hidden');
        this.elements.quizResult.classList.remove('hidden');
        this.elements.quizResult.innerHTML = `
            <div class="quiz-result-content">
                <div class="result-label">${labels[lang].match}</div>
                <div class="result-profile">${profileName}</div>
                <p class="result-desc">${labels[lang].desc}</p>
                <a href="${downloadUrl}" class="download-btn" target="_blank" rel="noopener">${labels[lang].download}</a>
            </div>
        `;

        Audio.playUnlock();
    }

    closeQuiz() {
        this.elements.quizModal.classList.add('hidden');
    }

    openQuizFromButton() {
        this.showCvQuiz();
    }

    checkAchievements() {
        const newAchievements = Achievements.checkNew(this.state);
        for (const achievement of newAchievements) {
            this.state.achievements.push(achievement.id);
            this.showAchievement(`${achievement.icon} ${achievement.name}`);
            Audio.playUnlock();
        }
        if (newAchievements.length > 0) {
            this.save();
        }
    }

    resetProgress() {
        if (!confirm('Reset all progress? This cannot be undone.')) return;

        const hadProgress = this.state.totalClicks > 0;

        Persistence.clear();
        this.state = { ...Persistence.defaultState };

        if (hadProgress) {
            this.state.achievements = ['reset'];
            this.showAchievement('🔄 Fresh Start');
        }

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
        this.save();
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
