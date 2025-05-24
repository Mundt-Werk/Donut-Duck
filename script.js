document.addEventListener('DOMContentLoaded', () => {
  const gridContainer = document.querySelector('.grid-container');
  let currentRotation = 0;
  let currentIndex = 0; // Dieser Index bestimmt, welches Item als nächstes aktualisiert wird
  let donutIndex = 0; // Dieser Index bestimmt, welcher Donut aus dem Array als nächstes eingefügt wird
  let cycleOrder = []; // Die Reihenfolge wird je nach Bildschirmorientierung gesetzt

  const selectedDonuts = [...donuts]; // Eine Kopie des Donut-Arrays, damit es rotiert werden kann

  let touchStartX = 0; // X-Position des Touch-Starts
  let touchEndX = 0;   // X-Position des Touch-Endes

  // Scroll-Lock System
  let isRotating = false; // Verhindert mehrfache Rotationen
  const rotationDuration = 2000; // 2 Sekunden (passend zur CSS transition)

  // Warenkorb System
  let cart = []; // Array für Warenkorb-Items
  let cartCount = 0; // Anzahl Items im Warenkorb

  // Funktion zum Setzen der Orientierung und Anpassen der Reihenfolge
  function setOrientation() {
      if (window.matchMedia("(orientation: landscape)").matches) {
          // Querformat: Reihenfolge, in der die Items ersetzt werden: erst 4, dann 8, 6 und 2
          cycleOrder = [8, 6, 2, 4];
      } else {
          // Hochformat: Reihenfolge, in der die Items ersetzt werden: erst 4, dann 8, 6 und 2
          cycleOrder = [4, 8, 6, 2];
      }

      // Starte mit dem initialen Setzen der Donuts basierend auf der neuen Reihenfolge
      cycleOrder.forEach((position, index) => {
          const container = document.querySelector(`#grid-item-${position}`);
          const donut = selectedDonuts[index % selectedDonuts.length]; // Wähle die ersten Donuts in der Reihenfolge
          container.innerHTML = ''; // Container leeren
          const img = document.createElement('img');
          img.src = donut.img;
          img.alt = donut.name;
          img.classList.add('donut-image');
          container.appendChild(img);
      });

      // Aktualisiere die Donut-Infos basierend auf der aktuellen Orientierung
      updateDonutInfo();
  }

  // Funktion zum Rotieren des Rads
  function rotateWheel(angle) {
      // Prüfe ob bereits rotiert wird
      if (isRotating) {
          return; // Ignoriere weitere Scroll-Versuche
      }

      // Setze Rotation-Lock
      isRotating = true;

      currentRotation += angle;
      gridContainer.style.transform = `translate(-50%, -50%) rotate(${currentRotation}deg)`;
      
      // Bevor die Rotation beendet ist, den nächsten Donut austauschen (eine Position vorher)
      replaceNextDonut();
      
      // Dann aktualisieren wir die Donut-Informationen
      updateDonutInfo();

      // Entsperre nach der Rotation
      setTimeout(() => {
          isRotating = false;
      }, rotationDuration);
  }

  // Scroll-Event-Listener für PCs - NUR RUNTER SCROLLEN ERLAUBT
  function handleWheelEvent(e) {
      e.preventDefault(); // Verhindert das Standard-Scrollen der Seite

      // Prüfe ob bereits rotiert wird
      if (isRotating) {
          return; // Ignoriere weitere Scroll-Versuche
      }

      const delta = Math.sign(e.deltaY); // Gibt -1 für Scroll nach oben und 1 für Scroll nach unten zurück
      
      // NUR bei runter scrollen (delta > 0) rotieren
      if (delta > 0) {
          const rotationAngle = 90; // Rotiert um 90 Grad im Uhrzeigersinn
          rotateWheel(rotationAngle);
      }
      // Hochscrollen wird ignoriert
  }

  // Touchstart Event-Listener für mobile Geräte (Startpunkt des Swipes)
  function handleTouchStart(e) {
      touchStartX = e.changedTouches[0].screenX; // Speichere die X-Position, wo der Touch begonnen hat
  }

  // Touchend Event-Listener für mobile Geräte (Endpunkt des Swipes)
  function handleTouchEnd(e) {
      touchEndX = e.changedTouches[0].screenX; // Speichere die X-Position, wo der Touch geendet hat
      handleSwipeGesture(); // Prüfe, ob ein Swipe nach links oder rechts erfolgt ist
  }

  // Funktion zur Erkennung der Swipe-Richtung - NUR SWIPE NACH LINKS ERLAUBT
  function handleSwipeGesture() {
      // Prüfe ob bereits rotiert wird
      if (isRotating) {
          return; // Ignoriere weitere Swipe-Versuche
      }

      const swipeDistance = touchStartX - touchEndX;
      const minSwipeDistance = 50; // Minimaler Abstand, um als Swipe erkannt zu werden

      // NUR Swipe nach links (positive swipeDistance) erlaubt
      if (swipeDistance > minSwipeDistance) {
          // Swipe nach links -> Drehung um 90 Grad im Uhrzeigersinn
          rotateWheel(90);
      }
      // Swipe nach rechts wird ignoriert
  }

  // Füge den Event Listener hinzu, nur wenn ein Mausgerät erkannt wird
  if (window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('wheel', handleWheelEvent, { passive: false });
  } else {
      // Für Touchgeräte, Swipe-Events hinzufügen
      window.addEventListener('touchstart', handleTouchStart, false);
      window.addEventListener('touchend', handleTouchEnd, false);
  }

  // Funktion zum Ersetzen des nächsten Donuts (eine Position vorher)
  function replaceNextDonut() {
      // Berechne das Item, das als nächstes ausgetauscht wird (eine Position vorher)
      const nextIndex = (currentIndex - 1 + cycleOrder.length) % cycleOrder.length;
      const currentItem = cycleOrder[nextIndex]; // Hol das nächste Grid-Item aus der Reihenfolge
      const container = document.querySelector(`#grid-item-${currentItem}`);

      // Nächsten Donut auswählen und ins Grid-Item einfügen
      const selectedDonut = selectedDonuts[donutIndex % selectedDonuts.length]; // Zyklisch durch die Donuts gehen
      container.innerHTML = ''; // Container leeren
      const img = document.createElement('img');
      img.src = selectedDonut.img;
      img.alt = selectedDonut.name;
      img.classList.add('donut-image');
      container.appendChild(img);

      // Aktualisiere den Index für den nächsten Wechsel
      currentIndex = (currentIndex + 1) % cycleOrder.length;

      // Aktualisiere den Donut-Index für den nächsten Donut
      donutIndex = (donutIndex + 1) % selectedDonuts.length;
  }

  // Funktion zur Aktualisierung der Donut-Informationen
  function updateDonutInfo() {
      // Berechne, welcher Donut gerade im Fokus ist, indem du den Index um 2 Positionen korrigierst
      const correctedIndex = (donutIndex - 2 + selectedDonuts.length) % selectedDonuts.length;
      const focusedDonut = selectedDonuts[correctedIndex]; // Nimm den Donut, der tatsächlich im Fokus steht
      
      // Donut-Infos aktualisieren
      document.getElementById('donut-name').textContent = focusedDonut.name;
      document.getElementById('rohling').textContent = focusedDonut.rohling || 'Keine Information';
      document.getElementById('füllung').textContent = focusedDonut.füllung || 'Ohne Füllung';
      document.getElementById('glasur').textContent = focusedDonut.glasur || 'Ohne Glasur';
      document.getElementById('topping').textContent = focusedDonut.topping || 'Ohne Topping';
      
      // Preis anzeigen (falls vorhanden)
      const priceElement = document.getElementById('donut-price');
      if (priceElement) {
          priceElement.textContent = `${focusedDonut.preis.toFixed(2)} €`;
      }
  }

  // Warenkorb-Funktionen
  function addToCart() {
      const correctedIndex = (donutIndex - 2 + selectedDonuts.length) % selectedDonuts.length;
      const focusedDonut = selectedDonuts[correctedIndex];
      
      // Prüfe ob Donut bereits im Warenkorb ist
      const existingItem = cart.find(item => item.name === focusedDonut.name);
      
      if (existingItem) {
          existingItem.quantity += 1;
      } else {
          cart.push({
              ...focusedDonut,
              quantity: 1
          });
      }
      
      cartCount += 1;
      updateCartDisplay();
      
      // Kurze Feedback-Animation
      showAddToCartFeedback();
  }

  function updateCartDisplay() {
      document.querySelector('.cart-badge').textContent = cartCount;
  }

  function showAddToCartFeedback() {
      const addButton = document.querySelector('.add-to-cart-btn');
      if (addButton) {
          addButton.style.transform = 'scale(0.9)';
          
          
          setTimeout(() => {
              addButton.style.transform = 'scale(1)';
              addButton.style.backgroundColor = '#ed3e78';
          }, 200);
      }
  }

  function toggleCartView() {
      const cartModal = document.getElementById('cart-modal');
      const cartItems = document.getElementById('cart-items');
      const cartTotal = document.getElementById('cart-total');
      
      if (cartModal.style.display === 'none' || !cartModal.style.display) {
          // Warenkorb anzeigen
          cartItems.innerHTML = '';
          let total = 0;
          
          if (cart.length === 0) {
              cartItems.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">Warenkorb ist leer</p>';
          } else {
              cart.forEach((item, index) => {
                  const itemTotal = item.preis * item.quantity;
                  total += itemTotal;
                  
                  const cartItem = document.createElement('div');
                  cartItem.className = 'cart-item';
                  cartItem.innerHTML = `
                      <img src="${item.img}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: contain;">
                      <div style="flex: 1; margin-left: 10px;">
                          <h4 style="margin: 0; color: #333;">${item.name}</h4>
                          <p style="margin: 0; color: #666; font-size: 14px;">€${item.preis.toFixed(2)} × ${item.quantity}</p>
                      </div>
                      <div style="color: #ed3e78; font-weight: bold;">€${itemTotal.toFixed(2)}</div>
                      <button onclick="removeFromCart(${index})" style="margin-left: 10px; background: #ff4444; color: white; border: none; border-radius: 4px; padding: 5px 8px; cursor: pointer;">×</button>
                  `;
                  cartItems.appendChild(cartItem);
              });
          }
          
          cartTotal.textContent = `Gesamt: €${total.toFixed(2)}`;
          cartModal.style.display = 'block';
      } else {
          // Warenkorb verstecken
          cartModal.style.display = 'none';
      }
  }

  function removeFromCart(index) {
      const removedItem = cart[index];
      cartCount -= removedItem.quantity;
      cart.splice(index, 1);
      updateCartDisplay();
      toggleCartView(); // Refresh cart view
  }

  function clearCart() {
      cart = [];
      cartCount = 0;
      updateCartDisplay();
      toggleCartView();
  }

  // Event Listeners für Warenkorb
  document.addEventListener('click', (e) => {
      if (e.target.classList.contains('add-to-cart-btn')) {
          addToCart();
      }
      
      if (e.target.closest('.cart-icon-container')) {
          toggleCartView();
      }
      
      if (e.target.id === 'close-cart' || e.target.id === 'cart-modal') {
          document.getElementById('cart-modal').style.display = 'none';
      }
      
      if (e.target.id === 'clear-cart') {
          clearCart();
      }
  });

  // Globale Funktion für das Entfernen von Items (für inline onclick)
  window.removeFromCart = removeFromCart;

  // Starte mit dem initialen Setzen der Donuts und der Orientierung
  setOrientation();

  // Überwache Änderungen in der Bildschirmorientierung und aktualisiere die Reihenfolge bei Bedarf
  window.addEventListener('resize', setOrientation);

  // Initiale Donut-Info setzen
  updateDonutInfo();
});