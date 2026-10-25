document.addEventListener("DOMContentLoaded", () => {
    const $ = id => document.getElementById(id);

    const cards = [...document.querySelectorAll(".course-card")];

    const courses = cards.map(card => ({
        id: Number(card.dataset.id),
        title: card.dataset.title,
        subject: card.dataset.subject,
        level: card.dataset.level,
        price: Number(card.dataset.price),
        places: Number(card.dataset.places)
    }));

    const selected = new Set();

    function normalize(text) {
        return String(text || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

    function filterCourses() {
        const search = normalize($("search").value);
        const level = $("levelFilter").value;
        const subject = $("subjectFilter").value;

        let count = 0;

        cards.forEach(card => {
            const text = normalize(
                card.dataset.title + " " +
                card.dataset.subject + " " +
                card.dataset.level
            );

            const visible =
                text.includes(search) &&
                (!level || card.dataset.level === level) &&
                (!subject || card.dataset.subject === subject);

            card.hidden = !visible;

            if (visible) {
                count++;
            }
        });

        $("courseCount").textContent =
            count + (count === 1 ? " cours trouvé" : " cours trouvés");

        $("noResults").hidden = count !== 0;
    }

    function selectCourse(id) {
        if (selected.has(id)) {
            return;
        }

        const course = courses.find(c => c.id === id);

        if (!course || course.places <= 0) {
            return;
        }

        selected.add(id);

        renderSelection();

        $("selection").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    function removeCourse(id) {
        selected.delete(id);
        renderSelection();
    }

    function renderSelection() {
        const list = $("selectionList");

        list.replaceChildren();

        let total = 0;

        if (selected.size === 0) {
            const empty = document.createElement("p");
            empty.className = "empty-message";
            empty.textContent = "Aucun cours sélectionné.";
            list.appendChild(empty);
        }

        selected.forEach(id => {
            const course = courses.find(c => c.id === id);

            if (!course) {
                return;
            }

            total += course.price;

            const item = document.createElement("div");
            item.className = "selection-item";

            const info = document.createElement("div");
            info.className = "selection-info";

            const title = document.createElement("strong");
            title.textContent = course.title;

            const level = document.createElement("small");
            level.textContent = "Niveau : " + course.level;

            info.append(title, level);

            const price = document.createElement("strong");
            price.className = "selection-price";
            price.textContent = course.price + " MAD / mois";

            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "remove-btn";
            remove.textContent = "Retirer";

            remove.addEventListener("click", () => {
                removeCourse(id);
            });

            item.append(info, price, remove);
            list.appendChild(item);
        });

        $("totalPrice").textContent = total + " MAD / mois";
        $("cartCount").textContent = selected.size;
        $("finalizeBtn").disabled = selected.size === 0;

        cards.forEach(card => {
            const id = Number(card.dataset.id);
            const button = card.querySelector(".choose-btn");
            const chosen = selected.has(id);

            button.disabled = chosen;
            button.textContent = chosen ?
                "Déjà sélectionné ✓" :
                "Choisir ce cours";

            button.setAttribute("aria-pressed", String(chosen));
        });
    }

    cards.forEach(card => {
        const button = card.querySelector(".choose-btn");

        button.addEventListener("click", () => {
            selectCourse(Number(card.dataset.id));
        });
    });

    $("search").addEventListener("input", filterCourses);
    $("levelFilter").addEventListener("change", filterCourses);
    $("subjectFilter").addEventListener("change", filterCourses);

    $("finalizeBtn").addEventListener("click", () => {
        $("inscription").scrollIntoView({
            behavior: "smooth"
        });
    });

    $("floatingCart").addEventListener("click", () => {
        $("selection").scrollIntoView({
            behavior: "smooth"
        });
    });

    const patterns = {
        parentName: /^\p{L}{2,}(?: +\p{L}{2,})*$/u,
        studentName: /^\p{L}{2,}$/u,
        email: /^[a-z0-9]+(?:[a-z0-9.]*[a-z0-9])?@gmail\.com$/i,
        phone: /^(?:0[5-7]\d{8}|\+212[5-7]\d{8})$/,
        password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/
    };

    const messages = {
        parentName: "Utilisez uniquement des lettres et des espaces.",
        studentName: "Le prénom doit contenir uniquement des lettres.",
        email: "Utilisez une adresse Gmail valide.",
        phone: "Utilisez 10 chiffres ou +212 suivi de 9 chiffres.",
        studentLevel: "Choisissez un niveau.",
        password: "Minimum 8 caractères, majuscule, minuscule, chiffre et symbole.",
        confirmPassword: "Les mots de passe ne correspondent pas."
    };

    const fields = [
        "parentName",
        "email",
        "phone",
        "studentName",
        "studentLevel",
        "password",
        "confirmPassword"
    ];

    function validateField(id) {
        const input = $(id);
        let valid = false;

        if (id === "studentLevel") {
            valid = input.value !== "";
        } else if (id === "confirmPassword") {
            valid =
                input.value.length > 0 &&
                input.value === $("password").value;
        } else {
            const value = id === "password" ?
                input.value :
                input.value.trim();

            valid = patterns[id].test(value);
        }

        input.classList.toggle("invalid", !valid);
        $(id + "Error").textContent = valid ? "" : messages[id];

        return valid;
    }

    $("parentName").addEventListener("input", event => {
        event.target.value = event.target.value
            .replace(/[^\p{L} ]/gu, "")
            .replace(/ {2,}/g, " ");
    });

    $("studentName").addEventListener("input", event => {
        event.target.value = event.target.value
            .replace(/[^\p{L}]/gu, "");
    });

    $("phone").addEventListener("input", event => {
        let value = event.target.value;

        if (value.startsWith("+")) {
            value = "+" + value.slice(1).replace(/\D/g, "");

            if (!"+212".startsWith(value) &&
                !value.startsWith("+212")
            ) {
                value = "+";
            }

            value = value.slice(0, 13);
        } else {
            value = value.replace(/\D/g, "").slice(0, 10);
        }

        event.target.value = value;
    });

    fields.forEach(id => {
        const input = $(id);

        input.addEventListener("blur", () => {
            validateField(id);
        });

        input.addEventListener("input", () => {
            if (input.classList.contains("invalid")) {
                validateField(id);
            }

            if (id === "password" && $("confirmPassword").value) {
                validateField("confirmPassword");
            }

            $("formMessage").textContent = "";
        });

        input.addEventListener("change", () => {
            if (input.classList.contains("invalid")) {
                validateField(id);
            }
        });
    });

    $("registrationForm").addEventListener("submit", event => {
        event.preventDefault();

        const valid = fields.map(validateField).every(Boolean);

        if (!valid) {
            $("formMessage").textContent =
                "Veuillez corriger les champs indiqués en rouge.";
            return;
        }

        if (selected.size === 0) {
            $("formMessage").textContent =
                "Veuillez choisir au moins un cours.";
            return;
        }

        if (!$("acceptTerms").checked) {
            $("formMessage").textContent =
                "Veuillez accepter les conditions.";
            return;
        }

        $("formMessage").textContent = "";

        const chosenCourses = courses.filter(course =>
            selected.has(course.id)
        );

        const details = [
            ["Parent", $("parentName").value.trim()],
            ["Gmail", $("email").value.trim()],
            ["Téléphone", $("phone").value.trim()],
            ["Élève", $("studentName").value.trim()],
            ["Niveau", $("studentLevel").value],
            ["Cours", chosenCourses.map(c => c.title).join(", ")],
            ["Total", $("totalPrice").textContent]
        ];

        const container = $("confirmationDetails");
        container.replaceChildren();

        details.forEach(([label, value]) => {
            const row = document.createElement("p");
            const strong = document.createElement("strong");

            strong.textContent = label + " : ";
            row.append(strong, document.createTextNode(value));

            container.appendChild(row);
        });

        $("confirmationReference").textContent =
            "Référence de démonstration : NA-" +
            Math.floor(100000 + Math.random() * 900000);

        $("formContainer").hidden = true;
        $("confirmation").hidden = false;

        $("inscription").scrollIntoView({
            behavior: "smooth"
        });
    });

    $("resetBtn").addEventListener("click", () => {
        selected.clear();

        $("registrationForm").reset();

        fields.forEach(id => {
            $(id).classList.remove("invalid");
            $(id + "Error").textContent = "";
        });

        $("formMessage").textContent = "";
        $("confirmation").hidden = true;
        $("formContainer").hidden = false;

        renderSelection();

        $("inscription").scrollIntoView({
            behavior: "smooth"
        });
    });

    filterCourses();
    renderSelection();
});