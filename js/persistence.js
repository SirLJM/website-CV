const Persistence = {
    COOKIE_NAME: 'cv_clicker_save',
    COOKIE_DAYS: 365,

    localStorageAvailable: (() => {
        try {
            const test = '__test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    })(),

    defaultState: {
        totalClicks: 0,
        clickPower: 1,
        multiplier: 1,
        critChance: 0,
        comboEnabled: false,
        unlockedSections: [],
        ownedTheme: null,
        language: 'en',
        soundEnabled: true,
        upgrades: {
            autoclicker: 0,
            clickpower: 0,
            doubleclicks: 0,
            luckyclicks: 0,
            momentum: 0
        },
        purchasedThemes: [],
        achievements: [],
        lastSave: Date.now()
    },

    save(state) {
        const data = JSON.stringify(state);
        const expires = new Date(Date.now() + this.COOKIE_DAYS * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `${this.COOKIE_NAME}=${encodeURIComponent(data)}; expires=${expires}; path=/; SameSite=Lax`;

        if (this.localStorageAvailable) {
            localStorage.setItem(this.COOKIE_NAME, data);
        }
    },

    parseJSON(str) {
        try {
            return JSON.parse(str);
        } catch {
            return null;
        }
    },

    load() {
        let data = null;

        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === this.COOKIE_NAME && value) {
                data = this.parseJSON(decodeURIComponent(value));
                if (data) break;
            }
        }

        if (!data && this.localStorageAvailable) {
            const stored = localStorage.getItem(this.COOKIE_NAME);
            if (stored) {
                data = this.parseJSON(stored);
            }
        }

        return data ? this.migrate(data) : { ...this.defaultState };
    },

    migrate(data) {
        const state = { ...this.defaultState };

        for (const key of Object.keys(state)) {
            if (data[key] !== undefined) {
                if (key === 'upgrades') {
                    state.upgrades = { ...state.upgrades, ...data.upgrades };
                } else {
                    state[key] = data[key];
                }
            }
        }

        return state;
    },

    clear() {
        document.cookie = `${this.COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        if (this.localStorageAvailable) {
            localStorage.removeItem(this.COOKIE_NAME);
        }
    }
};
