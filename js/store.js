const Store = {
    UNLOCK_THRESHOLD: 25,

    upgrades: {
        autoclicker: {
            name: 'Auto-Clicker',
            effect: '+1 click/sec',
            baseCost: 50,
            costMultiplier: 1.15
        },
        clickpower: {
            name: 'Click Power',
            effect: '+1 per click',
            baseCost: 25,
            costMultiplier: 1.2
        },
        doubleclicks: {
            name: 'Double Clicks',
            effect: '2x click value',
            baseCost: 100,
            costMultiplier: 1.25
        },
        luckyclicks: {
            name: 'Lucky Clicks',
            effect: '+5% crit chance',
            baseCost: 75,
            costMultiplier: 1.15
        },
        momentum: {
            name: 'Momentum',
            effect: 'Combo bonus for fast clicks',
            baseCost: 150,
            costMultiplier: 1.2
        }
    },

    themes: {
        base: {
            name: 'Base',
            description: 'Default theme',
            cost: 0,
            file: null
        },
        neon: {
            name: 'Neon Glow',
            description: 'Cyberpunk aesthetic',
            cost: 500,
            file: 'css/themes/neon.css'
        },
        retro: {
            name: 'Retro 8-bit',
            description: 'Pixel art style',
            cost: 750,
            file: 'css/themes/retro.css'
        },
        minimal: {
            name: 'Minimal Pro',
            description: 'Clean professional look',
            cost: 1000,
            file: 'css/themes/minimal.css'
        }
    },

    getCost(upgradeId, owned) {
        const upgrade = this.upgrades[upgradeId];
        if (!upgrade) return Infinity;
        return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, owned));
    },

    canAfford(cost, totalClicks) {
        return totalClicks >= cost;
    },

    renderUpgrades(container, state, onPurchase) {
        container.innerHTML = '';

        for (const [id, upgrade] of Object.entries(this.upgrades)) {
            const owned = state.upgrades[id] || 0;
            const cost = this.getCost(id, owned);
            const affordable = this.canAfford(cost, state.totalClicks);

            const item = document.createElement('div');
            item.className = `store-item ${affordable ? 'affordable' : 'unaffordable'}`;
            item.innerHTML = `
                <div class="store-item-info">
                    <div class="store-item-name">${upgrade.name}</div>
                    <div class="store-item-effect">${upgrade.effect}</div>
                    <div class="store-item-owned">Owned: ${owned}</div>
                </div>
                <div class="store-item-cost">${cost}</div>
            `;

            if (affordable) {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    onPurchase('upgrade', id, cost);
                });
            }

            container.appendChild(item);
        }
    },

    getThemeActionHtml(active, owned, cost) {
        if (active) return '<div class="store-item-cost" style="background: var(--color-success);">Active</div>';
        if (owned) return '<div class="store-item-cost" style="cursor: pointer;">Apply</div>';
        return `<div class="store-item-cost">${cost}</div>`;
    },

    getThemeClass(owned, affordable) {
        if (owned) return 'owned';
        return affordable ? 'affordable' : 'unaffordable';
    },

    renderThemes(container, state, onPurchase, onApply) {
        container.innerHTML = '';

        for (const [id, theme] of Object.entries(this.themes)) {
            const owned = state.purchasedThemes.includes(id);
            const active = state.ownedTheme === id;
            const affordable = !owned && this.canAfford(theme.cost, state.totalClicks);

            const item = document.createElement('div');
            item.className = `store-item ${this.getThemeClass(owned, affordable)}`;

            item.innerHTML = `
                <div class="store-item-info">
                    <div class="store-item-name">${theme.name}</div>
                    <div class="store-item-effect">${theme.description}</div>
                </div>
                ${this.getThemeActionHtml(active, owned, theme.cost)}
            `;

            if (owned && !active) {
                item.addEventListener('click', (e) => { e.stopPropagation(); onApply(id); });
            } else if (!owned && affordable) {
                item.addEventListener('click', (e) => { e.stopPropagation(); onPurchase('theme', id, theme.cost); });
            }

            container.appendChild(item);
        }
    },

    applyUpgrade(state, upgradeId) {
        switch (upgradeId) {
            case 'clickpower':
                state.clickPower += 1;
                break;
            case 'doubleclicks':
                state.multiplier *= 2;
                break;
            case 'luckyclicks':
                state.critChance = Math.min(state.critChance + 0.05, 0.5);
                break;
            case 'momentum':
                state.comboEnabled = true;
                break;
        }
        state.upgrades[upgradeId] = (state.upgrades[upgradeId] || 0) + 1;
    },

    getAutoClickRate(state) {
        return state.upgrades.autoclicker || 0;
    },

    applyTheme(themeId) {
        document.getElementById('theme-stylesheet')?.remove();

        const theme = this.themes[themeId];
        if (theme?.file) {
            const link = document.createElement('link');
            link.id = 'theme-stylesheet';
            link.rel = 'stylesheet';
            link.href = theme.file;
            document.head.appendChild(link);
        }
    }
};
