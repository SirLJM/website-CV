const CVRenderer = {
    data: null,
    currentLang: 'en',

    unlockThresholds: [
        { clicks: 10, section: 'header', name: 'Header' },
        { clicks: 50, section: 'skills', name: 'Skills' },
        { clicks: 150, section: 'experience', name: 'Experience' },
        { clicks: 400, section: 'projects', name: 'Projects' },
        { clicks: 800, section: 'education', name: 'Education' },
        { clicks: 1500, section: 'contact', name: 'Contact' }
    ],

    async loadData() {
        try {
            const response = await fetch('data/content_it.yaml');
            const text = await response.text();
            this.data = jsyaml.load(text);
            return true;
        } catch (e) {
            console.error('Failed to load CV data:', e);
            return false;
        }
    },

    setLanguage(lang) {
        this.currentLang = lang;
    },

    getData() {
        return this.data ? this.data[this.currentLang] : null;
    },

    getNextUnlock(currentClicks) {
        for (const threshold of this.unlockThresholds) {
            if (currentClicks < threshold.clicks) {
                return threshold;
            }
        }
        return null;
    },

    getProgress(currentClicks) {
        let prevThreshold = 0;
        for (const threshold of this.unlockThresholds) {
            if (currentClicks < threshold.clicks) {
                const range = threshold.clicks - prevThreshold;
                const progress = currentClicks - prevThreshold;
                return Math.min(progress / range, 1);
            }
            prevThreshold = threshold.clicks;
        }
        return 1;
    },

    getNewUnlocks(oldClicks, newClicks) {
        const unlocks = [];
        for (const threshold of this.unlockThresholds) {
            if (oldClicks < threshold.clicks && newClicks >= threshold.clicks) {
                unlocks.push(threshold);
            }
        }
        return unlocks;
    },

    renderSection(sectionId) {
        const data = this.getData();
        if (!data) return;

        const container = document.getElementById(`cv-${sectionId}`);
        if (!container) return;

        container.classList.remove('locked');
        container.classList.add('unlocking');

        switch (sectionId) {
            case 'header':
                this.renderHeader(container, data);
                break;
            case 'skills':
                this.renderSkills(container, data);
                break;
            case 'experience':
                this.renderExperience(container, data);
                break;
            case 'projects':
                this.renderProjects(container, data);
                break;
            case 'education':
                this.renderEducation(container, data);
                break;
            case 'contact':
                this.renderContact(container, data);
                break;
        }

        setTimeout(() => container.classList.remove('unlocking'), 500);
    },

    renderHeader(container, data) {
        container.innerHTML = `
            <div class="profile">
                <img src="assets/images/CV_1024x1024.png" alt="${data.name}" class="profile-photo">
                <div class="profile-info">
                    <h2>${data.name}</h2>
                    <div class="title">Java Developer / Project Manager</div>
                    <p>${data.intro}</p>
                </div>
            </div>
        `;
    },

    renderSkills(container, data) {
        const labels = data.labels;
        let html = `<h2>${labels.skills}</h2><div class="skill-grid">`;

        for (const skill of data.skills) {
            html += `
                <div class="skill-item">
                    <h4>${skill.name}</h4>
                    <p>${skill.description}</p>
                </div>
            `;
        }

        html += '</div>';
        if (data.skills_other) {
            html += `<p style="margin-top: 1rem; color: var(--color-text-dim);">${data.skills_other}</p>`;
        }

        container.innerHTML = html;
    },

    renderExperience(container, data) {
        const labels = data.labels;
        let html = `<h2>${labels.experience}</h2>`;

        for (const exp of data.experience) {
            html += `
                <div class="experience-item">
                    <div class="years">${exp.years}</div>
                    <div class="position">${exp.position}</div>
                    ${exp.company ? `<div class="company">${exp.company}</div>` : ''}
                    ${exp.technologies ? `<div class="tech">${exp.technologies}</div>` : ''}
                    <ul>
                        ${exp.details.map(d => `<li>${d}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        container.innerHTML = html;
    },

    renderProjects(container, data) {
        const labels = data.labels;
        let html = `<h2>${labels.projects}</h2>`;

        for (const proj of data.projects) {
            html += `
                <div class="project-item">
                    <div class="title">${proj.title}</div>
                    <div class="meta">
                        <span>${proj.years}</span>
                        <span>${proj.position}</span>
                        ${proj.team_size ? `<span>${labels.team}: ${proj.team_size}</span>` : ''}
                        ${proj.budget ? `<span>${labels.budget}: ${proj.budget}</span>` : ''}
                    </div>
                    <div class="tech">${labels.technology}: ${proj.technology}</div>
                    <p class="intro">${proj.intro}</p>
                    <p class="role">${proj.role}</p>
                </div>
            `;
        }

        container.innerHTML = html;
    },

    renderEducation(container, data) {
        const labels = data.labels;
        let html = `<h2>${labels.education}</h2><div class="education-grid">`;

        for (const edu of data.education) {
            html += `
                <div class="education-item">
                    <div class="year">${edu.year}</div>
                    <div class="detail">${edu.detail}</div>
                    <div class="org">${edu.org}</div>
                </div>
            `;
        }

        html += '</div>';

        html += `<h3>${labels.certifications}</h3><div class="certifications-list">`;
        for (const cert of data.certifications) {
            html += `
                <div class="cert-item">
                    <div class="name">${cert.name}</div>
                    <div class="org">${cert.org} (${cert.year})</div>
                </div>
            `;
        }
        html += '</div>';

        container.innerHTML = html;
    },

    renderContact(container, data) {
        const labels = data.labels;
        const contact = data.contact;

        let html = `<h2>${labels.language}</h2><div class="languages-list">`;
        for (const lang of data.languages) {
            html += `
                <div class="lang-item">
                    <div class="name">${lang.name}</div>
                    <div class="level">${lang.level}</div>
                </div>
            `;
        }
        html += '</div>';

        html += `<h3>Contact</h3><div class="contact-grid">`;
        html += `
            <div class="contact-item">
                <span class="label">Email</span>
                <a href="mailto:${contact.email}">${contact.email}</a>
            </div>
            <div class="contact-item">
                <span class="label">Phone</span>
                <span>${contact.phone}</span>
            </div>
            <div class="contact-item">
                <span class="label">Location</span>
                <span>${contact.location}</span>
            </div>
            <div class="contact-item">
                <span class="label">LinkedIn</span>
                <a href="${contact.linkedin}" target="_blank">Profile</a>
            </div>
            <div class="contact-item">
                <span class="label">Availability</span>
                <span>${contact.availability}</span>
            </div>
        `;
        html += '</div>';

        container.innerHTML = html;
    },

    renderAllUnlocked(unlockedSections) {
        for (const sectionId of unlockedSections) {
            this.renderSection(sectionId);
        }
    }
};
