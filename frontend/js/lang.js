function initLanguageSwitcher() {
    const langToggle = document.getElementById('language-toggle');
    let currentLang = localStorage.getItem('lang') || 'vi';

    loadLanguage(currentLang);

    if (langToggle) {
        langToggle.textContent = currentLang === 'vi' ? 'EN' : 'VI';

        langToggle.addEventListener('click', () => {
            currentLang = currentLang === 'vi' ? 'en' : 'vi';
            localStorage.setItem('lang', currentLang);
            loadLanguage(currentLang);
            langToggle.textContent = currentLang === 'vi' ? 'EN' : 'VI';
        });
    }
}

async function loadLanguage(lang) {
    try {
        const response = await fetch(`lang/${lang}.json`);
        const translations = await response.json();
        applyTranslations(translations);
    } catch (error) {
        console.error('Lỗi khi tải file ngôn ngữ:', error);
    }
}

function applyTranslations(translations) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) {
            el.innerHTML = translations[key];
        }
    });

    // Handle placeholder translations
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[key]) {
            el.placeholder = translations[key];
        }
    });
}
