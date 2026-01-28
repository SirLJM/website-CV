const Achievements = {
    list: [
        { id: 'first_click', icon: '👶', name: 'Baby Steps', desc: 'Make your first click', check: s => s.totalClicks >= 1 },
        { id: 'clicks_100', icon: '🖱️', name: 'Clicky McClickface', desc: 'Reach 100 clicks', check: s => s.totalClicks >= 100 },
        { id: 'clicks_1k', icon: '🤯', name: 'Click Addict', desc: 'Reach 1,000 clicks', check: s => s.totalClicks >= 1000 },
        { id: 'clicks_10k', icon: '💪', name: 'Finger of Steel', desc: 'Reach 10,000 clicks', check: s => s.totalClicks >= 10000 },
        { id: 'clicks_100k', icon: '🏆', name: 'Legendary Clicker', desc: 'Reach 100,000 clicks', check: s => s.totalClicks >= 100000 },
        { id: 'first_upgrade', icon: '🛒', name: 'Retail Therapy', desc: 'Buy your first upgrade', check: s => Object.values(s.upgrades).some(v => v > 0) },
        { id: 'upgrades_5', icon: '💉', name: 'Upgrade Junkie', desc: 'Buy 5 total upgrades', check: s => Object.values(s.upgrades).reduce((a, b) => a + b, 0) >= 5 },
        { id: 'upgrades_10', icon: '🚀', name: 'To The Moon', desc: 'Buy 10 total upgrades', check: s => Object.values(s.upgrades).reduce((a, b) => a + b, 0) >= 10 },
        { id: 'first_theme', icon: '👗', name: 'Fashionista', desc: 'Purchase a theme', check: s => s.purchasedThemes.length > 0 },
        { id: 'all_themes', icon: '🌈', name: 'Rainbow Warrior', desc: 'Own all themes', check: s => s.purchasedThemes.length >= 3 },
        { id: 'cv_header', icon: '📝', name: 'Who Dis?', desc: 'Unlock the header section', check: s => s.unlockedSections.includes('header') },
        { id: 'cv_skills', icon: '🧠', name: 'Big Brain Time', desc: 'Unlock the skills section', check: s => s.unlockedSections.includes('skills') },
        { id: 'cv_complete', icon: '🎉', name: 'You\'re Hired!', desc: 'Unlock all CV sections', check: s => s.unlockedSections.length >= 6 },
        { id: 'auto_5', icon: '🤖', name: 'Automation Nation', desc: 'Reach 5 clicks per second', check: s => (s.upgrades.autoclicker || 0) >= 5 },
        { id: 'auto_10', icon: '⚡', name: 'Lightning Fingers', desc: 'Reach 10 clicks per second', check: s => (s.upgrades.autoclicker || 0) >= 10 },
        { id: 'power_5', icon: '🔨', name: 'Heavy Hitter', desc: 'Reach 5 click power', check: s => s.clickPower >= 5 },
        { id: 'crit_unlock', icon: '🍀', name: 'Feeling Lucky', desc: 'Unlock critical clicks', check: s => s.critChance > 0 },
        { id: 'combo_unlock', icon: '🔥', name: 'Combo Breaker', desc: 'Unlock momentum combo', check: s => s.comboEnabled },
        { id: 'speed_demon', icon: '😈', name: 'Speed Demon', desc: 'Have all upgrade types', check: s => Object.values(s.upgrades).every(v => v > 0) },
        { id: 'reset', icon: '🔄', name: 'Fresh Start', desc: 'Reset your progress', check: () => false }
    ],

    getUnlocked(state) {
        return this.list.filter(a => state.achievements?.includes(a.id) || false);
    },

    getLocked(state) {
        return this.list.filter(a => !state.achievements?.includes(a.id));
    },

    checkNew(state) {
        const newAchievements = [];
        for (const achievement of this.list) {
            if (!state.achievements?.includes(achievement.id) && achievement.check(state)) {
                newAchievements.push(achievement);
            }
        }
        return newAchievements;
    },

    render(container, state) {
        container.innerHTML = '';

        const unlocked = this.getUnlocked(state);
        const locked = this.getLocked(state);

        const unlockedSection = document.createElement('div');
        unlockedSection.className = 'achievements-section';
        unlockedSection.innerHTML = `<h4>Unlocked (${unlocked.length}/${this.list.length})</h4>`;

        const unlockedGrid = document.createElement('div');
        unlockedGrid.className = 'achievements-grid';

        for (const a of unlocked) {
            unlockedGrid.appendChild(this.createCard(a, true));
        }

        if (unlocked.length === 0) {
            unlockedGrid.innerHTML = '<p class="no-achievements">Start clicking to earn achievements!</p>';
        }

        unlockedSection.appendChild(unlockedGrid);
        container.appendChild(unlockedSection);

        const lockedSection = document.createElement('div');
        lockedSection.className = 'achievements-section';
        lockedSection.innerHTML = '<h4>Locked</h4>';

        const lockedGrid = document.createElement('div');
        lockedGrid.className = 'achievements-grid';

        for (const a of locked) {
            lockedGrid.appendChild(this.createCard(a, false));
        }

        lockedSection.appendChild(lockedGrid);
        container.appendChild(lockedSection);
    },

    createCard(achievement, unlocked) {
        const card = document.createElement('div');
        card.className = `achievement-card ${unlocked ? 'unlocked' : 'locked'}`;
        card.innerHTML = `
            <span class="achievement-icon">${unlocked ? achievement.icon : '❓'}</span>
            <span class="achievement-name">${unlocked ? achievement.name : '???'}</span>
            <span class="achievement-desc">${achievement.desc}</span>
        `;
        return card;
    }
};
