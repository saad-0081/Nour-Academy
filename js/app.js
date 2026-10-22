document.addEventListener('DOMContentLoaded', () => {
    let cart = JSON.parse(localStorage.getItem('nour_cart')) || [];

    const selectionList = document.getElementById('selection-list');
    const totalPriceEl = document.getElementById('total-price');
    const cartBadge = document.getElementById('cart-badge');
    const itemCount = document.getElementById('item-count');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const registrationForm = document.getElementById('registration-form');
    const successCard = document.getElementById('success-card');
    const summaryDetails = document.getElementById('summary-details');
    const resetAppBtn = document.getElementById('reset-app-btn');

    updateCartUI();

    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.course-card');
            const id = card.dataset.id;
            const title = card.dataset.title;
            const price = parseInt(card.dataset.price);

            if (!cart.some(item => item.id === id)) {
                cart.push({ id, title, price });
                localStorage.setItem('nour_cart', JSON.stringify(cart));
                updateCartUI();

                button.textContent = "Ajouté ✓";
                button.classList.add('btn-added');
                setTimeout(() => {
                    button.textContent = "Ajouter au panier";
                    button.classList.remove('btn-added');
                }, 1200);
            } else {
                alert("Ce cours est déjà présent dans votre sélection !");
            }
        });
    });

    window.removeFromCart = function(id) {
        cart = cart.filter(item => item.id !== id);
        localStorage.setItem('nour_cart', JSON.stringify(cart));
        updateCartUI();
    };

    function updateCartUI() {
        selectionList.innerHTML = '';
        cartBadge.textContent = cart.length;
        itemCount.textContent = `${cart.length} cours`;

        if (cart.length === 0) {
            selectionList.innerHTML = '<p id="empty-selection" class="empty-text">Aucun cours sélectionné. Veuillez choisir vos matières ci-dessous.</p>';
            totalPriceEl.textContent = '0 MAD / mois';
            return;
        }

        let total = 0;
        cart.forEach(item => {
            total += item.price;
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
        <div>
          <span class="cart-item-title">${item.title}</span>
        </div>
        <div class="cart-item-right">
          <span class="cart-item-price">${item.price} MAD / mois</span>
          <button onclick="removeFromCart('${item.id}')" class="remove-btn">Retirer</button>
        </div>
      `;
            selectionList.appendChild(itemEl);
        });

        totalPriceEl.textContent = `${total} MAD / mois`;
    }

    registrationForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            alert("Attention : Vous devez sélectionner au moins un cours avant de valider votre inscription.");
            window.location.href = "#catalogue";
            return;
        }

        const nom = document.getElementById('nom').value;
        const prenom = document.getElementById('prenom').value;
        const tel = document.getElementById('tel').value;
        const centre = document.getElementById('centre').value;

        let coursesListHTML = cart.map(item => `<li>- ${item.title} (${item.price} MAD)</li>`).join('');
        let totalCalc = cart.reduce((sum, item) => sum + item.price, 0);

        summaryDetails.innerHTML = `
      <p><strong>Nom & Prénom :</strong> ${nom} ${prenom}</p>
      <p><strong>Téléphone :</strong> ${tel}</p>
      <p><strong>Centre :</strong> ${centre}</p>
      <div style="border-top: 1px solid #d1fae5; padding-top: 0.5rem; margin-top: 0.5rem;">
        <p style="font-weight: bold;">Cours choisis :</p>
        <ul style="list-style-type: disc; padding-left: 1rem;">${coursesListHTML}</ul>
      </div>
      <p style="font-weight: bold; padding-top: 0.25rem;">Total mensuel : ${totalCalc} MAD / mois</p>
    `;

        registrationForm.classList.add('hidden');
        successCard.classList.remove('hidden');
        successCard.scrollIntoView({ behavior: 'smooth' });
    });

    resetAppBtn.addEventListener('click', () => {
        cart = [];
        localStorage.removeItem('nour_cart');
        updateCartUI();
        registrationForm.reset();
        registrationForm.classList.remove('hidden');
        successCard.classList.add('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});