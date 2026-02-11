export const createConfetti = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD700', '#95E1D3', '#FF69B4', '#00CED1', '#FF1493'];
  
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: fixed;
        width: ${Math.random() * 10 + 5}px;
        height: ${Math.random() * 10 + 5}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * 100}vw;
        top: -20px;
        z-index: 10000;
        pointer-events: none;
        border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        animation: confetti-fall ${Math.random() * 3 + 2}s linear forwards;
      `;
      document.body.appendChild(confetti);
  
      setTimeout(() => confetti.remove(), 5000);
    }
  
    // Add keyframes if not exists
    if (!document.querySelector('#confetti-styles')) {
      const style = document.createElement('style');
      style.id = 'confetti-styles';
      style.textContent = `
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  };
  