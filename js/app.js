document.addEventListener('DOMContentLoaded', () => {
    let cart = [];

    const selectionList = document.getElementById('selection-list');
    const emptySelection = document.getElementById('empty-selection');
    const totalPriceEl = document.getElementById('total-price');
    const cartBadge = document.getElementById('cart-badge');
    const itemCount = document.getElementById('item-count');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const registrationForm = document.getElementById('registration-form');
    const successMessage = document.getElementById('success-message');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.course-card');
            const id = card.dataset.id;
            const title = card.dataset.title;
            const price = parseInt(card.dataset.price);

            if (!cart.some(item => item.id === id)) {
                cart.push({ id, title, price });
                updateCartUI();

                button.textContent = "Ajouté ✓";
                button.classList.add('bg-emerald-600', 'text-white');
                setTimeout(() => {
                    button.textContent = "Ajouter au panier";
                    button.classList.remove('bg-emerald-600', 'text-white');
                }, 1200);
            } else {
                alert("Ce cours est déjà présent dans votre sélection !");
            }
        });
    });

    window.removeFromCart = function(id) {
        cart = cart.filter(item => item.id !== id);
        updateCartUI();
    };

    function updateCartUI() {
        selectionList.innerHTML = '';
        cartBadge.textContent = cart.length;
        itemCount.textContent = `${cart.length} cours`;

        if (cart.length === 0) {
            selectionList.innerHTML = '<p id="empty-selection" class="text-sm text-gray-400 italic py-2">Aucun cours sélectionné. Veuillez choisir vos matières ci-dessous.</p>';
            totalPriceEl.textContent = '0 MAD / mois';
            return;
        }

        let total = 0;
        cart.forEach(item => {
            total += item.price;
            const itemEl = document.createElement('div');
            itemEl.className = 'flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 gap-4';
            itemEl.innerHTML = `
        <div>
          <h3 class="font-bold text-sm text-[#1B3022]">${item.title}</h3>
        </div>
        <div class="flex items-center gap-4 w-full sm:w-auto justify-between">
          <span class="text-sm font-semibold text-gray-700">${item.price} MAD / mois</span>
          <button onclick="removeFromCart('${item.id}')" class="text-red-500 hover:text-red-700 text-xs font-semibold cursor-pointer underline">Retirer</button>
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

        successMessage.classList.remove('hidden');
        registrationForm.reset();

        cart = [];
        updateCartUI();

        setTimeout(() => {
            successMessage.classList.add('hidden');
        }, 6000);
    });
});