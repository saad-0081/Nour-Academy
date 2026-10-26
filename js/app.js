const courses = [
    { id: 1, title: 'Mathématiques - Fondamentaux', subject: 'Mathématiques', level: 'Primaire', slot: 'Lundi 17h–18h30', price: 250, places: 10, center: 'Nador Centre' },
    { id: 2, title: 'Français - Lecture et rédaction', subject: 'Français', level: 'Primaire', slot: 'Mercredi 15h–16h30', price: 250, places: 8, center: 'Hay Al Matar' },
    { id: 3, title: 'Mathématiques - Collège', subject: 'Mathématiques', level: 'Collège', slot: 'Mardi 18h–19h30', price: 300, places: 20, center: 'Nador Centre' },
    { id: 4, title: 'Physique-Chimie - Collège', subject: 'Physique-Chimie', level: 'Collège', slot: 'Jeudi 18h–19h30', price: 300, places: 12, center: 'Selouane' },
    { id: 5, title: 'SVT - Collège', subject: 'SVT', level: 'Collège', slot: 'Samedi 10h–11h30', price: 300, places: 0, center: 'Hay Al Matar' },
    { id: 6, title: 'Français - Expression écrite', subject: 'Français', level: 'Collège', slot: 'Vendredi 17h–18h30', price: 300, places: 15, center: 'Nador Centre' },
    { id: 7, title: 'Anglais - Débutant', subject: 'Anglais', level: 'Collège', slot: 'Samedi 14h–15h30', price: 250, places: 9, center: 'Selouane' },
    { id: 8, title: 'Mathématiques - Tronc commun', subject: 'Mathématiques', level: 'Lycée', slot: 'Lundi 19h–20h30', price: 350, places: 14, center: 'Nador Centre' },
    { id: 9, title: 'Physique-Chimie - Tronc commun', subject: 'Physique-Chimie', level: 'Lycée', slot: 'Mercredi 18h–19h30', price: 350, places: 16, center: 'Hay Al Matar' },
    { id: 10, title: 'SVT - Tronc commun', subject: 'SVT', level: 'Lycée', slot: 'Dimanche 10h–11h30', price: 350, places: 11, center: 'Selouane' },
    { id: 11, title: 'Mathématiques - 1ère Bac', subject: 'Mathématiques', level: 'Lycée', slot: 'Mardi 19h–20h30', price: 350, places: 13, center: 'Nador Centre' },
    { id: 12, title: 'Physique-Chimie - 1ère Bac', subject: 'Physique-Chimie', level: 'Lycée', slot: 'Jeudi 19h–20h30', price: 350, places: 7, center: 'Hay Al Matar' },
    { id: 13, title: 'SVT - 1ère Bac', subject: 'SVT', level: 'Lycée', slot: 'Samedi 16h–17h30', price: 350, places: 0, center: 'Selouane' },
    { id: 14, title: 'Anglais - Conversation', subject: 'Anglais', level: 'Lycée', slot: 'Vendredi 18h–19h30', price: 300, places: 18, center: 'Nador Centre' },
    { id: 15, title: 'Français - Préparation aux examens', subject: 'Français', level: 'Lycée', slot: 'Dimanche 14h–15h30', price: 400, places: 6, center: 'Hay Al Matar' },
    { id: 16, title: 'Mathématiques - 2ème Bac', subject: 'Mathématiques', level: 'Lycée', slot: 'Samedi 18h–20h', price: 400, places: 5, center: 'Nador Centre' },
    { id: 17, title: 'Physique-Chimie - 2ème Bac', subject: 'Physique-Chimie', level: 'Lycée', slot: 'Dimanche 16h–18h', price: 400, places: 8, center: 'Selouane' },
    { id: 18, title: 'SVT - 2ème Bac', subject: 'SVT', level: 'Lycée', slot: 'Mercredi 19h–20h30', price: 400, places: 10, center: 'Hay Al Matar' }
];

const $ = id => document.getElementById(id);
const selected = new Map();
const formatPrice = price => `${price} MAD / mois`;
const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const node = (tag, className, value) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value !== undefined) element.textContent = value;
    return element;
};

const appendText = (parent, tag, label, value) => {
    const p = node(tag, '', `${label} : ${value}`);
    parent.append(p);
    return p;
};

function renderCourses() {
    const query = normalize($('search').value.trim());
    const level = $('levelFilter').value;
    const subject = $('subjectFilter').value;

    const filtered = courses.filter(course =>
        normalize(course.title).includes(query) &&
        (!level || course.level === level) &&
        (!subject || course.subject === subject)
    );

    const fragment = document.createDocumentFragment();

    filtered.forEach(course => {
        const card = node('article', 'course-card');
        card.dataset.id = String(course.id);

        card.append(
            node('span', 'pill', course.subject),
            node('h3', '', course.title),
            node('p', '', `Niveau : ${course.level}`),
            node('p', '', `Créneau : ${course.slot}`),
            node('p', '', `Centre : ${course.center}`),
            node('strong', 'price', formatPrice(course.price))
        );

        const full = course.places === 0;

        card.append(
            node(
                'span',
                `places${full ? ' full' : ''}`,
                full ? 'Complet' : `${course.places} places restantes`
            )
        );

        const actions = node('div', 'course-actions');

        const detail = node('button', 'button secondary', 'Détails');
        detail.type = 'button';
        detail.dataset.action = 'detail';

        const choose = node(
            'button',
            'button primary',
            full ? 'Complet' : selected.has(course.id) ? 'Déjà sélectionné ✓' : 'Choisir ce cours'
        );

        choose.type = 'button';
        choose.dataset.action = 'choose';
        choose.disabled = full || selected.has(course.id);

        actions.append(detail, choose);
        card.append(actions);
        fragment.append(card);
    });

    $('courseGrid').replaceChildren(fragment);

    $('resultCount').textContent =
        `${filtered.length} cours ${filtered.length === 1 ? 'trouvé' : 'trouvés'}`;

    $('noResults').hidden = filtered.length !== 0;
}

function renderSelection() {
    const list = $('selectionList');
    list.replaceChildren();

    if (!selected.size) {
        list.append(node('p', 'notice', 'Aucun cours sélectionné.'));
    }

    let total = 0;

    selected.forEach(course => {
        total += course.price;

        const item = node('div', 'selection-item');
        const info = node('div', 'item-info');

        info.append(
            node('strong', '', course.title),
            node('small', '', `${course.level} · ${course.slot}`)
        );

        const price = node('span', 'item-price', formatPrice(course.price));

        const remove = node('button', 'remove-button', 'Retirer');
        remove.type = 'button';
        remove.dataset.remove = String(course.id);

        item.append(info, price, remove);
        list.append(item);
    });

    $('totalPrice').textContent = formatPrice(total);
    $('selectedCount').textContent =
        `${selected.size} cours sélectionné${selected.size > 1 ? 's' : ''}`;

    $('navCount').textContent = `(${selected.size})`;
    $('finalizeBtn').disabled = selected.size === 0;

    renderCourses();
}

function addCourse(id) {
    const course = courses.find(item => item.id === id);

    if (!course || course.places === 0 || selected.has(id)) return;

    selected.set(id, course);
    renderSelection();
}

$('courseGrid').addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');

    if (!button || !$('courseGrid').contains(button)) return;

    const card = button.closest('.course-card');
    if (!card) return;

    const id = Number(card.dataset.id);

    if (button.dataset.action === 'choose') addCourse(id);
    if (button.dataset.action === 'detail') openDetails(id);
});

$('selectionList').addEventListener('click', event => {
    const button = event.target.closest('button[data-remove]');
    if (!button) return;

    selected.delete(Number(button.dataset.remove));
    renderSelection();
});

function openDetails(id) {
    const course = courses.find(item => item.id === id);
    if (!course) return;

    $('dialogTitle').textContent = course.title;

    const body = $('dialogBody');
    body.replaceChildren();

    [
        ['Matière', course.subject],
        ['Niveau', course.level],
        ['Créneau', course.slot],
        ['Centre', course.center],
        ['Prix', formatPrice(course.price)],
        ['Places restantes', course.places === 0 ? 'Complet' : String(course.places)]
    ].forEach(([label, value]) => appendText(body, 'p', label, value));

    const button = $('dialogChoose');
    button.dataset.courseId = String(id);
    button.disabled = course.places === 0 || selected.has(id);

    button.textContent = course.places === 0 ?
        'Complet' :
        selected.has(id) ?
        'Déjà sélectionné ✓' :
        'Choisir ce cours';

    $('courseDialog').showModal();
}

$('closeDialog').addEventListener('click', () => $('courseDialog').close());

$('courseDialog').addEventListener('click', event => {
    if (event.target === $('courseDialog')) {
        $('courseDialog').close();
    }
});

$('dialogChoose').addEventListener('click', () => {
    addCourse(Number($('dialogChoose').dataset.courseId));
    $('courseDialog').close();
});

['search', 'levelFilter', 'subjectFilter'].forEach(id => {
    $(id).addEventListener(
        id === 'search' ? 'input' : 'change',
        renderCourses
    );
});

$('finalizeBtn').addEventListener('click', () => {
    $('inscription').scrollIntoView({ behavior: 'smooth' });
});

const firstStep = ['parentName', 'email', 'phone', 'studentName', 'studentLevel'];
const secondStep = ['password', 'confirmPassword', 'consent'];
const fields = [...firstStep, ...secondStep];

const nameRegex = /^[\p{L}]+(?:[ '\-][\p{L}]+)*$/u;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phoneRegex = /^(?:0[67]\d{8}|\+212[67]\d{8})$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/;

function validate(id) {
    const input = $(id);
    const value = id === 'consent' ? input.checked : input.value.trim();

    let valid = false;
    let message = '';

    switch (id) {
        case 'parentName':
        case 'studentName':
            valid = nameRegex.test(value);
            message = valid ?
                'Nom valide.' :
                'Utilisez uniquement des lettres, espaces, apostrophes ou tirets.';
            break;

        case 'email':
            valid = emailRegex.test(value);
            message = valid ?
                'E-mail valide.' :
                'Saisissez une adresse e-mail valide (ex. nom@exemple.com).';
            break;

        case 'phone':
            valid = phoneRegex.test(value);
            message = valid ?
                'Numéro marocain valide.' :
                'Format attendu : 06/07 + 8 chiffres ou +2126/7 + 8 chiffres.';
            break;

        case 'studentLevel':
            valid = ['Primaire', 'Collège', 'Lycée'].includes(value);
            message = valid ?
                'Niveau sélectionné.' :
                'Choisissez le niveau de l’élève.';
            break;

        case 'password':
            valid = passwordRegex.test(input.value);
            message = valid ?
                'Mot de passe conforme.' :
                '8 caractères minimum, une majuscule, un chiffre et un caractère spécial.';
            break;

        case 'confirmPassword':
            valid = !!input.value && input.value === $('password').value;
            message = valid ?
                'Les mots de passe correspondent.' :
                'La confirmation doit être identique au mot de passe.';
            break;

        case 'consent':
            valid = !!value;
            message = valid ?
                'Consentement donné.' :
                'Vous devez accepter le traitement indiqué pour continuer.';
            break;
    }

    const feedback = $(id + 'Feedback');
    feedback.textContent = message;
    feedback.className = `feedback ${valid ? 'ok' : 'error'}`;

    if (id !== 'consent') {
        const wrapper = input.closest('.field');
        wrapper.classList.toggle('valid', valid);
        wrapper.classList.toggle('invalid', !valid);
    }

    input.setAttribute('aria-invalid', String(!valid));

    return valid;
}

function strength() {
    const value = $('password').value;

    const checks = [
        value.length >= 8,
        /[A-Z]/.test(value),
        /[a-z]/.test(value),
        /\d/.test(value),
        /[^A-Za-z0-9\s]/.test(value),
        value.length >= 12
    ];

    const score = checks.filter(Boolean).length;

    const label = !value ?
        'non évaluée' :
        score <= 2 ?
        'faible' :
        score <= 4 ?
        'moyenne' :
        'forte';

    $('passwordStrength').textContent = `Robustesse : ${label}`;

    $('strengthFill').style.width = !value ?
        '0%' :
        score <= 2 ?
        '33%' :
        score <= 4 ?
        '66%' :
        '100%';

    $('strengthFill').style.background = score <= 2 ?
        '#b42318' :
        score <= 4 ?
        '#bc8528' :
        '#147d45';
}

fields.forEach(id => {
    const input = $(id);

    input.addEventListener(
        id === 'studentLevel' || id === 'consent' ? 'change' : 'input',
        () => {
            validate(id);

            if (id === 'password') {
                strength();

                if ($('confirmPassword').value) {
                    validate('confirmPassword');
                }
            }

            $('formMessage').textContent = '';
        }
    );

    if (id !== 'consent') {
        input.addEventListener('blur', () => validate(id));
    }
});

function validateGroup(ids) {
    let firstInvalid = null;

    ids.forEach(id => {
        if (!validate(id) && !firstInvalid) {
            firstInvalid = $(id);
        }
    });

    if (firstInvalid) {
        firstInvalid.focus();
        $('formMessage').textContent =
            'Corrigez les champs signalés avant de continuer.';
        return false;
    }

    $('formMessage').textContent = '';
    return true;
}

function setStep(step) {
    $('step1').hidden = step !== 1;
    $('step2').hidden = step !== 2;

    $('stepText').textContent = step === 1 ?
        'Étape 1 sur 2 — Responsable et élève' :
        'Étape 2 sur 2 — Sécurité et consentement';

    $('stepPercent').textContent = step === 1 ? '50 %' : '100 %';

    $('progressBar').setAttribute(
        'aria-valuenow',
        String(step === 1 ? 50 : 100)
    );

    $('progressFill').style.width = step === 1 ? '50%' : '100%';
    $('formMessage').textContent = '';
}

$('nextBtn').addEventListener('click', () => {
    if (validateGroup(firstStep)) {
        setStep(2);
        $('password').focus();
    }
});

$('backBtn').addEventListener('click', () => {
    setStep(1);
    $('parentName').focus();
});

let dossierSequence = 0;

function makeReference() {
    dossierSequence += 1;

    const randomPart =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ?
        crypto.randomUUID().slice(0, 8).toUpperCase() :
        `${Date.now().toString(36)}${dossierSequence}`.toUpperCase();

    return `NA-${randomPart}-${dossierSequence}`;
}

function clearFormAndSelection() {
    $('registrationForm').reset();

    selected.clear();
    renderSelection();

    fields.forEach(id => {
        const input = $(id);

        input.removeAttribute('aria-invalid');

        $(id + 'Feedback').textContent = '';
        $(id + 'Feedback').className = 'feedback';

        if (id !== 'consent') {
            const wrapper = input.closest('.field');
            wrapper.classList.remove('valid', 'invalid');
        }
    });

    strength();
    setStep(1);
}

$('registrationForm').addEventListener('submit', event => {
    event.preventDefault();

    if (!validateGroup(firstStep)) {
        setStep(1);
        validateGroup(firstStep);
        return;
    }

    if (!validateGroup(secondStep)) return;

    if (!selected.size) {
        $('formMessage').textContent =
            'Sélectionnez au moins un cours avant de valider.';

        $('selection').scrollIntoView({ behavior: 'smooth' });
        return;
    }

    const snapshot = {
        student: $('studentName').value.trim(),
        level: $('studentLevel').value,
        courses: Array.from(selected.values()),
        total: Array.from(selected.values()).reduce(
            (sum, course) => sum + course.price,
            0
        ),
        reference: makeReference()
    };

    $('confirmationReference').textContent =
        `Numéro de dossier : ${snapshot.reference}`;

    const details = $('confirmationDetails');
    details.className = 'confirmation-details';
    details.replaceChildren();

    appendText(details, 'p', 'Élève', snapshot.student);
    appendText(details, 'p', 'Niveau', snapshot.level);

    snapshot.courses.forEach((course, index) => {
        appendText(
            details,
            'p',
            `Cours ${index + 1}`,
            `${course.title} — ${course.slot} — ${formatPrice(course.price)}`
        );
    });

    appendText(
        details,
        'p',
        'Total mensuel',
        formatPrice(snapshot.total)
    );

    clearFormAndSelection();

    $('formContainer').hidden = true;
    $('confirmation').hidden = false;
    $('confirmation').focus();
});

$('newRegistrationBtn').addEventListener('click', () => {
    $('confirmation').hidden = true;
    $('formContainer').hidden = false;
    $('parentName').focus();
});

renderSelection();
strength();