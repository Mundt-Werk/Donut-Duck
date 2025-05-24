// Funktion, um einen zufälligen Donut auszuwählen
function getRandomDonut() {
    const randomIndex = Math.floor(Math.random() * donuts.length); // Zufälliger Index
    return donuts[randomIndex];
  }
  
  // Zufälliges Donut-Bild setzen
  window.onload = function() {
    const randomDonut = getRandomDonut();
    const donutImage = document.getElementById('randomDonut');
    donutImage.src = randomDonut.img; // Setze das Bild des Donuts
    donutImage.alt = randomDonut.name; // Setze den Alt-Text des Donuts
  };
  