import confetti from 'canvas-confetti';

export function fireSchoolConfetti() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#FFD23F', '#FF7849', '#00BBF9', '#52B788', '#FF6B8B'],
  });
}

export function fireStarsConfetti() {
  const defaults = {
    spread: 360,
    ticks: 60,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    shapes: ['star'] as confetti.Shape[],
    colors: ['#FFE600', '#FFB703', '#FB8500', '#FFD166'],
  };

  confetti({
    ...defaults,
    particleCount: 40,
    scalar: 1.3,
  });

  confetti({
    ...defaults,
    particleCount: 25,
    scalar: 0.8,
  });
}

export function fireSuperWinnerConfetti() {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    
    // Bắn pháo từ góc trái
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#FFD23F', '#FF7849', '#00BBF9', '#9B5DE5', '#00F5D4'],
    });
    // Bắn pháo từ góc phải
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#FFD23F', '#FF7849', '#00BBF9', '#9B5DE5', '#00F5D4'],
    });
  }, 250);
}
