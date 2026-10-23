(() => {
    "use strict";

    const CONFIG = { endpoint: "" };
    const $ = s => document.querySelector(s);
    const norm = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const ico = (n, s = 16) => `<svg class="sv" width="${s}" height="${s}" aria-hidden="true"><use href="#${n}"/></svg>`;
    const mad = n => `${n} MAD / mois`;
    const byId = id => coursesData.find(c => c.id === id);
    // Sélection 
    const STORE = "na-cart";
    const load = () => { try { return JSON.parse(sessionStorage.getItem(STORE) || "[]").filter(id => byId(id) && byId(id).seats > 0); } catch { return []; } };
    const save = () => { try { sessionStorage.setItem(STORE, JSON.stringify(cart)); } catch { /* stockage indisponible */ } };
    let cart = load(); // ids, dans l'ordre de sélection

    const go = id => $("#" + id) ? .scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });

    /*filtrage*/
    levels.forEach(l => {
        $("#lvl").add(new Option(l, l));
        $("#lv").add(new Option(l, l));
    });
    [...new Set(coursesData.map(c => c.subject))].forEach(s => $("#sub").add(new Option(s, s)));

    const status = c => c.seats === 0 ? { cls: "err", txt: "Complet" } :
        c.seats <= 3 ? { cls: "warn", txt: `${c.seats} dernière${c.seats > 1 ? "s" : ""} place${c.seats > 1 ? "s" : ""}` } : { cls: "ok", txt: `${c.seats} places restantes` };

    const card = c => {
        const sel = cart.includes(c.id),
            st = status(c);
        const btn = st.cls === "err" ?
            `<button type="button" class="btn" disabled>Cours complet</button>` :
            `<button type="button" class="btn${sel ? " line" : ""}" data-add="${c.id}" aria-label="${sel ? "Retirer" : "Choisir"} ${c.subject} (${c.level}) ${sel ? "de ma sélection" : ""}">${sel ? "Retirer de ma sélection" : "Choisir ce cours"}</button>`;
        return `<article class="card${sel ? " is-sel" : ""}">
      <div class="row"><span class="badge">${c.level}</span><span class="sicon">${ico(c.icon, 22)}</span></div>
      <h3>${c.subject}</h3>
      <p class="meta">${ico("pin")}${c.center}</p>
      <p class="meta">${ico("cal")}${c.slot}</p>
      <p class="price">${mad(c.price)}</p>
      <p class="status ${st.cls}"><i></i>${st.txt}</p>${btn}</article>`;
    };

    function renderCourses() {
        const q = norm($("#q").value.trim()),
            l = $("#lvl").value,
            s = $("#sub").value;
        const list = coursesData.filter(c => (!l || c.level === l) && (!s || c.subject === s) &&
            norm(`${c.subject} ${c.level} ${c.center}`).includes(q));
        $("#count").textContent = `${list.length} résultat${list.length > 1 ? "s" : ""}`;
        $("#grid").hidden = !list.length;
        $("#empty").hidden = !!list.length;
        $("#grid").innerHTML = list.map(card).join("");
    }

    /* ---------- Sélection ---------- */
    function renderCart() {
        const items = cart.map(byId),
            total = items.reduce((t, c) => t + c.price, 0);
        $("#selList").innerHTML = items.length ?
            items.map(c => `<div class="item"><div class="info"><b>${c.subject} — ${c.level}</b><small>${c.center} · ${c.slot}</small></div>
          <span class="pr">${mad(c.price)}</span>
          <button type="button" class="btn line" data-add="${c.id}" aria-label="Retirer ${c.subject} (${c.level})">Retirer</button></div>`).join("") :
            `<p class="sub">Aucun cours sélectionné. Choisissez un cours dans le catalogue pour préparer l’inscription.</p>`;
        $("#total").textContent = mad(total);
        $("#finalize").disabled = !items.length;
        $("#bar").classList.toggle("show", items.length > 0);
        $("#barN").textContent = `${items.length} cours sélectionné${items.length > 1 ? "s" : ""}`;
        $("#barT").textContent = mad(total);
    }

    function toggle(id) {
        cart = cart.includes(id) ? cart.filter(x => x !== id) : [...cart, id];
        save();
        renderCourses();
        renderCart();
        refreshSend();
        document.querySelector(`#grid [data-add="${id}"]`) ? .focus({ preventScroll: true });
    }

    /* ---------- Validation temps réel ---------- */
    const val = id => $("#" + id).value;
    const rules = {
        name: v => /^\p{L}[\p{L} '’-]{2,}$/u.test(v.trim()) ? "" : "Entrez au moins 3 lettres (prénom et nom).",
        email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Email invalide. Exemple : nom@exemple.ma",
        tel: v => /^(0|\+212)[67]\d{8}$/.test(v.replace(/[\s.-]/g, "")) ? "" : "Numéro invalide. Exemple : 0612345678",
        kid: v => /^\p{L}[\p{L} '’-]+$/u.test(v.trim()) ? "" : "Entrez au moins 2 lettres.",
        lv: v => v ? "" : "Choisissez le niveau de l’élève.",
        pw: v => {
            const m = [];
            if (v.length < 8) m.push("8 caractères");
            if (!/[A-Z]/.test(v)) m.push("une majuscule");
            if (!/\d/.test(v)) m.push("un chiffre");
            if (!/[^\p{L}\p{N}\s]/u.test(v)) m.push("un caractère spécial");
            return m.length ? `Il manque : ${m.join(", ")}.` : "";
        },
        pw2: v => v && v === val("pw") ? "" : "Les mots de passe ne correspondent pas."
    };
    const okMsg = { name: "Nom valide", email: "Email valide", tel: "Numéro valide", kid: "Prénom valide", lv: "Niveau choisi", pw: "Mot de passe valide", pw2: "Les mots de passe correspondent" };
    const touched = new Set();
    document.querySelectorAll(".hint[aria-live]").forEach(h => (h.dataset.def = h.textContent));
    Object.keys(rules).forEach(id => {
        const h = document.querySelector(`[data-f="${id}"] .hint`);
        h.id = "h-" + id;
        $("#" + id).setAttribute("aria-describedby", h.id);
    });

    function check(id) {
        const f = document.querySelector(`[data-f="${id}"]`),
            hint = f.querySelector(".hint");
        const input = f.querySelector("input,select");
        f.classList.remove("ok", "bad");
        input.removeAttribute("aria-invalid");
        if (!touched.has(id)) { hint.textContent = hint.dataset.def; return; }
        const err = !val(id).trim() && id !== "lv" ? "Champ obligatoire." : rules[id](val(id));
        f.classList.add(err ? "bad" : "ok");
        input.setAttribute("aria-invalid", !!err);
        hint.textContent = err || okMsg[id];
    }

    const formValid = () => Object.keys(rules).every(k => !rules[k](val(k))) && $("#cons").checked;

    function refreshSend() {
        const ok = formValid() && cart.length > 0;
        $("#send").disabled = !ok;
        const lvl = val("lv"),
            off = lvl ? cart.map(byId).filter(c => c.level !== lvl) : [];
        const note = $("#sendNote");
        note.className = "hint note";
        if (!cart.length) note.textContent = "Choisissez au moins un cours pour envoyer l’inscription.";
        else if (!$("#cons").checked) note.textContent = "Cochez la case de consentement pour continuer.";
        else if (off.length) {
            note.className = "hint note warn";
            note.textContent = `Attention : ${off.map(c => c.subject).join(", ")} ne correspond${off.length > 1 ? "ent" : ""} pas au niveau « ${lvl} ».`;
        } else note.textContent = "";
    }

    const form = $("#form");
    form.addEventListener("input", e => {
        const id = e.target.id;
        if (rules[id]) {
            touched.add(id);
            check(id);
            if (id === "pw" && val("pw2")) {
                touched.add("pw2");
                check("pw2");
            }
        }
        refreshSend();
    });
    form.addEventListener("focusout", e => {
        const id = e.target.id;
        if (rules[id]) {
            touched.add(id);
            check(id);
        }
    });
    form.addEventListener("change", e => {
        const id = e.target.id;
        if (rules[id]) {
            touched.add(id);
            check(id);
        }
        refreshSend();
    });

    form.addEventListener("submit", async e => {
        e.preventDefault();
        Object.keys(rules).forEach(k => {
            touched.add(k);
            check(k);
        });
        if (!formValid() || !cart.length) { refreshSend(); return; }
        const items = cart.map(byId),
            btn = $("#send"),
            note = $("#sendNote");
        btn.disabled = true;
        btn.textContent = "Envoi en cours…";
        const payload = {
            parent: { name: val("name").trim(), email: val("email").trim(), phone: val("tel").replace(/[\s.-]/g, "") },
            student: { firstName: val("kid").trim(), level: val("lv") },
            courseIds: [...cart],
            password: val("pw"), // HTTPS uniquement ; à hacher côté serveur (argon2/bcrypt), jamais stocké en clair
            consent: true
        };
        try {
            let ref;
            if (CONFIG.endpoint) {
                const r = await fetch(CONFIG.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
                if (!r.ok) throw new Error("HTTP " + r.status);
                ref = (await r.json()).ref;
            } else { // mode démonstration
                ref = `NA-2026-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;
            }
            $("#ref").textContent = `N° de dossier : ${ref}`;
            const rows = [
                ["Élève", `${payload.student.firstName} — ${payload.student.level}`],
                ["Cours", items.map(c => `${c.subject} — ${c.center}`).join(" · ")],
                ["Total mensuel", mad(items.reduce((t, c) => t + c.price, 0))]
            ];
            const recap = $("#recap");
            recap.replaceChildren();
            rows.forEach(([k, v]) => { // textContent : aucune injection HTML possible
                const dt = document.createElement("dt"),
                    dd = document.createElement("dd");
                dt.textContent = k;
                dd.textContent = v;
                recap.append(dt, dd);
            });
            $("#formBox").hidden = true;
            $("#done").hidden = false;
            $("#doneTitle").focus();
        } catch {
            note.className = "hint note bad";
            note.textContent = "L’envoi a échoué. Vérifiez votre connexion et réessayez.";
            btn.disabled = false;
        } finally {
            btn.textContent = "Envoyer mon inscription";
        }
    });

    function resetAll() {
        cart = [];
        save();
        touched.clear();
        form.reset();
        Object.keys(rules).forEach(check);
        $("#formBox").hidden = false;
        $("#done").hidden = true;
        renderCourses();
        renderCart();
        refreshSend();
        go("top");
    }

    document.addEventListener("click", e => {
        const t = e.target.closest("[data-add],[data-go],[data-act]");
        if (!t) return;
        if (t.dataset.add) toggle(+t.dataset.add);
        else if (t.dataset.go) go(t.dataset.go);
        else if (t.dataset.act === "new") resetAll();
        else if (t.dataset.act === "reset-filters") {
            $("#q").value = "";
            $("#lvl").value = "";
            $("#sub").value = "";
            renderCourses();
        }
    });
    ["input", "change"].forEach(ev => ["#q", "#lvl", "#sub"].forEach(s => $(s).addEventListener(ev, renderCourses)));

    const nav = $("#nav"),
        burger = $("#burger");
    burger.addEventListener("click", () => burger.setAttribute("aria-expanded", nav.classList.toggle("open")));
    nav.addEventListener("click", e => {
        if (e.target.closest("a")) {
            nav.classList.remove("open");
            burger.setAttribute("aria-expanded", "false");
        }
    });

    const links = [...nav.querySelectorAll("a:not(.nav-cta)")];
    const spy = new IntersectionObserver(es => es.forEach(en => {
        if (!en.isIntersecting) return;
        links.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + en.target.id));
    }), { rootMargin: "-40% 0px -55% 0px" });
    ["top", "cours", "why", "contact"].forEach(id => spy.observe($("#" + id)));

    renderCourses();
    renderCart();
    Object.keys(rules).forEach(check);
    refreshSend();
})();