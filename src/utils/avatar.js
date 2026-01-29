// Cute cartoon avatars for kids - colorful characters with big eyes and happy faces

const ANIMAL_CHARACTERS = [
  // Bunny
  { name: 'bunny', label: 'Bunny 🐰', color: '#FF69B4', accentColor: '#FFB6D9' },
  // Cat
  { name: 'cat', label: 'Cat 🐱', color: '#FFA500', accentColor: '#FFD700' },
  // Dog
  { name: 'dog', label: 'Dog 🐶', color: '#8B4513', accentColor: '#D2691E' },
  // Fox
  { name: 'fox', label: 'Fox 🦊', color: '#FF6347', accentColor: '#FFB347' },
  // Lion
  { name: 'lion', label: 'Lion 🦁', color: '#FFD700', accentColor: '#FFA500' },
  // Penguin
  { name: 'penguin', label: 'Penguin 🐧', color: '#000000', accentColor: '#FFFFFF' },
  // Panda
  { name: 'panda', label: 'Panda 🐼', color: '#000000', accentColor: '#FFFFFF' },
  // Dinosaur
  { name: 'dinosaur', label: 'Dinosaur 🦕', color: '#7CFC00', accentColor: '#ADFF2F' },
  // Whale
  { name: 'whale', label: 'Whale 🐋', color: '#1E90FF', accentColor: '#87CEEB' },
  // Monkey
  { name: 'monkey', label: 'Monkey 🐵', color: '#CD853F', accentColor: '#DEB887' },
  // Bear
  { name: 'bear', label: 'Bear 🐻', color: '#8B6F47', accentColor: '#A0826D' },
  // Tiger
  { name: 'tiger', label: 'Tiger 🐯', color: '#FF8C00', accentColor: '#FFD700' },
  // Owl
  { name: 'owl', label: 'Owl 🦉', color: '#8B4513', accentColor: '#D4A574' },
  // Unicorn
  { name: 'unicorn', label: 'Unicorn 🦄', color: '#FF69B4', accentColor: '#FFB6D9' },
  // Dragon
  { name: 'dragon', label: 'Dragon 🐉', color: '#DC143C', accentColor: '#FFD700' },
  // Koala
  { name: 'koala', label: 'Koala 🐨', color: '#A9A9A9', accentColor: '#D3D3D3' },
  // Giraffe
  { name: 'giraffe', label: 'Giraffe 🦒', color: '#FFD700', accentColor: '#8B7355' },
  // Dolphin
  { name: 'dolphin', label: 'Dolphin 🐬', color: '#1E90FF', accentColor: '#87CEEB' },
  // Parrot
  { name: 'parrot', label: 'Parrot 🦜', color: '#32CD32', accentColor: '#FFD700' },
  // Butterfly
  { name: 'butterfly', label: 'Butterfly 🦋', color: '#FF1493', accentColor: '#FFD700' }
];

// Export for use in components
export const AVATAR_OPTIONS = ANIMAL_CHARACTERS;

function getCharacterForName(name = 'user') {
  const charCode = (name || '').charCodeAt(0) || 0;
  return ANIMAL_CHARACTERS[charCode % ANIMAL_CHARACTERS.length];
}

export function getCharacterByName(characterName) {
  return ANIMAL_CHARACTERS.find(c => c.name === characterName) || ANIMAL_CHARACTERS[0];
}

function generateBunny(color, accentColor) {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <!-- Head -->
    <circle cx="100" cy="110" r="60" fill="${color}"/>
    <!-- Left Ear -->
    <ellipse cx="70" cy="40" rx="18" ry="45" fill="${color}" transform="rotate(-25 70 40)"/>
    <ellipse cx="70" cy="45" rx="12" ry="38" fill="${accentColor}" transform="rotate(-25 70 45)"/>
    <!-- Right Ear -->
    <ellipse cx="130" cy="40" rx="18" ry="45" fill="${color}" transform="rotate(25 130 40)"/>
    <ellipse cx="130" cy="45" rx="12" ry="38" fill="${accentColor}" transform="rotate(25 130 45)"/>
    <!-- Snout -->
    <circle cx="100" cy="120" r="25" fill="${accentColor}"/>
    <!-- Eyes -->
    <circle cx="85" cy="100" r="8" fill="#000"/>
    <circle cx="115" cy="100" r="8" fill="#000"/>
    <circle cx="87" cy="98" r="3" fill="#FFF"/>
    <circle cx="117" cy="98" r="3" fill="#FFF"/>
    <!-- Nose -->
    <circle cx="100" cy="115" r="5" fill="#FF1493"/>
    <!-- Mouth -->
    <path d="M 100 120 Q 95 128 85 125" stroke="#000" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M 100 120 Q 105 128 115 125" stroke="#000" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`;
}

function generateCat(color, accentColor) {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <!-- Head -->
    <circle cx="100" cy="110" r="55" fill="${color}"/>
    <!-- Left Ear -->
    <polygon points="65,60 50,20 70,55" fill="${color}"/>
    <polygon points="63,58 57,35 68,53" fill="${accentColor}"/>
    <!-- Right Ear -->
    <polygon points="135,60 150,20 130,55" fill="${color}"/>
    <polygon points="137,58 143,35 132,53" fill="${accentColor}"/>
    <!-- Eyes -->
    <ellipse cx="82" cy="100" rx="10" ry="16" fill="#00FF00"/>
    <ellipse cx="118" cy="100" rx="10" ry="16" fill="#00FF00"/>
    <ellipse cx="82" cy="104" rx="5" ry="12" fill="#000"/>
    <ellipse cx="118" cy="104" rx="5" ry="12" fill="#000"/>
    <!-- Nose -->
    <polygon points="100,115 95,122 105,122" fill="${accentColor}"/>
    <!-- Mouth -->
    <path d="M 100 122 Q 90 135 75 130" stroke="#000" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M 100 122 Q 110 135 125 130" stroke="#000" stroke-width="2" fill="none" stroke-linecap="round"/>
    <!-- Whiskers -->
    <line x1="60" y1="105" x2="40" y2="100" stroke="#000" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="60" y1="115" x2="40" y2="120" stroke="#000" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="140" y1="105" x2="160" y2="100" stroke="#000" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="140" y1="115" x2="160" y2="120" stroke="#000" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`;
}

function generateDog(color, accentColor) {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <!-- Head -->
    <circle cx="100" cy="110" r="55" fill="${color}"/>
    <!-- Left Ear -->
    <ellipse cx="65" cy="65" rx="22" ry="35" fill="${color}"/>
    <!-- Right Ear -->
    <ellipse cx="135" cy="65" rx="22" ry="35" fill="${color}"/>
    <!-- Snout -->
    <ellipse cx="100" cy="125" rx="30" ry="25" fill="${accentColor}"/>
    <!-- Eyes -->
    <circle cx="85" cy="100" r="8" fill="#000"/>
    <circle cx="115" cy="100" r="8" fill="#000"/>
    <circle cx="87" cy="98" r="3" fill="#FFF"/>
    <circle cx="117" cy="98" r="3" fill="#FFF"/>
    <!-- Nose -->
    <circle cx="100" cy="122" r="6" fill="#000"/>
    <!-- Tongue -->
    <ellipse cx="100" cy="140" rx="8" ry="10" fill="#FF69B4"/>
    <!-- Mouth -->
    <path d="M 100 128 Q 95 135 85 133" stroke="#000" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M 100 128 Q 105 135 115 133" stroke="#000" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  </svg>`;
}

function generateFox(color, accentColor) {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <!-- Head -->
    <circle cx="100" cy="110" r="55" fill="${color}"/>
    <!-- Left Ear -->
    <polygon points="60,60 45,15 75,65" fill="${color}"/>
    <polygon points="62,58 52,30 72,62" fill="${accentColor}"/>
    <!-- Right Ear -->
    <polygon points="140,60 155,15 125,65" fill="${color}"/>
    <polygon points="138,58 148,30 128,62" fill="${accentColor}"/>
    <!-- Snout -->
    <ellipse cx="100" cy="120" rx="35" ry="30" fill="${accentColor}"/>
    <!-- Eyes -->
    <circle cx="82" cy="100" r="7" fill="#000"/>
    <circle cx="118" cy="100" r="7" fill="#000"/>
    <circle cx="84" cy="98" r="2" fill="#FFF"/>
    <circle cx="120" cy="98" r="2" fill="#FFF"/>
    <!-- Nose -->
    <circle cx="100" cy="118" r="5" fill="#000"/>
    <!-- Smile -->
    <path d="M 100 123 Q 95 132 80 130" stroke="#000" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M 100 123 Q 105 132 120 130" stroke="#000" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`;
}

function generatePenguin(color, accentColor) {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <!-- Body -->
    <ellipse cx="100" cy="120" rx="40" ry="60" fill="${color}"/>
    <!-- Belly -->
    <ellipse cx="100" cy="120" rx="25" ry="55" fill="${accentColor}"/>
    <!-- Head -->
    <circle cx="100" cy="60" r="35" fill="${color}"/>
    <!-- Face white -->
    <circle cx="100" cy="65" r="22" fill="${accentColor}"/>
    <!-- Eyes -->
    <circle cx="88" cy="55" r="7" fill="${accentColor}"/>
    <circle cx="112" cy="55" r="7" fill="${accentColor}"/>
    <circle cx="88" cy="55" r="4" fill="#000"/>
    <circle cx="112" cy="55" r="4" fill="#000"/>
    <circle cx="89" cy="54" r="1.5" fill="#FFF"/>
    <circle cx="113" cy="54" r="1.5" fill="#FFF"/>
    <!-- Beak -->
    <polygon points="100,65 95,75 105,75" fill="#FFD700"/>
    <!-- Feet -->
    <ellipse cx="88" cy="175" rx="12" ry="8" fill="#FFD700"/>
    <ellipse cx="112" cy="175" rx="12" ry="8" fill="#FFD700"/>
  </svg>`;
}

function generateDinosaur(color, accentColor) {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <!-- Body -->
    <ellipse cx="100" cy="130" rx="50" ry="45" fill="${color}"/>
    <!-- Head -->
    <ellipse cx="70" cy="85" rx="35" ry="40" fill="${color}"/>
    <!-- Spikes down back -->
    <polygon points="80,90 75,70 85,85" fill="${accentColor}"/>
    <polygon points="95,85 90,65 100,80" fill="${accentColor}"/>
    <polygon points="110,90 105,70 115,85" fill="${accentColor}"/>
    <polygon points="125,100 120,80 130,95" fill="${accentColor}"/>
    <!-- Eyes -->
    <circle cx="60" cy="80" r="6" fill="#000"/>
    <circle cx="62" cy="78" r="2" fill="#FFF"/>
    <!-- Nostrils -->
    <circle cx="52" cy="95" r="2" fill="#000"/>
    <!-- Teeth -->
    <line x1="45" y1="105" x2="40" y2="115" stroke="#FFF" stroke-width="2" stroke-linecap="round"/>
    <line x1="50" y1="108" x2="47" y2="118" stroke="#FFF" stroke-width="2" stroke-linecap="round"/>
    <!-- Tail -->
    <path d="M 150 120 Q 170 115 180 100" stroke="${color}" stroke-width="18" fill="none" stroke-linecap="round"/>
  </svg>`;
}

function generateWhale(color, accentColor) {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <!-- Body -->
    <ellipse cx="100" cy="120" rx="55" ry="45" fill="${color}"/>
    <!-- Head -->
    <circle cx="65" cy="95" r="30" fill="${color}"/>
    <!-- Blowhole -->
    <path d="M 75 75 L 73 60 L 77 60 L 75 75" fill="${accentColor}"/>
    <!-- Eyes -->
    <circle cx="60" cy="90" r="5" fill="#000"/>
    <circle cx="61" cy="89" r="1.5" fill="#FFF"/>
    <!-- Fin on back -->
    <polygon points="100,75 95,45 105,75" fill="${accentColor}"/>
    <!-- Tail -->
    <path d="M 155 125 Q 175 115 180 95 Q 175 135 155 140" fill="${accentColor}"/>
    <!-- Belly accent -->
    <ellipse cx="100" cy="130" rx="35" ry="20" fill="${accentColor}" opacity="0.6"/>
    <!-- Smile -->
    <path d="M 45 105 Q 50 115 60 118" stroke="#000" stroke-width="1" fill="none" stroke-linecap="round"/>
  </svg>`;
}

function generateLion(color, accentColor) {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <!-- Head -->
    <circle cx="100" cy="90" r="35" fill="${color}"/>
    <!-- Mane -->
    <circle cx="100" cy="90" r="55" fill="${color}" opacity="0.7"/>
    <circle cx="70" cy="60" r="20" fill="${color}"/>
    <circle cx="130" cy="60" r="20" fill="${color}"/>
    <circle cx="55" cy="90" r="18" fill="${color}"/>
    <circle cx="145" cy="90" r="18" fill="${color}"/>
    <!-- Face -->
    <circle cx="100" cy="95" r="25" fill="${accentColor}"/>
    <!-- Eyes -->
    <circle cx="88" cy="85" r="6" fill="#000"/>
    <circle cx="112" cy="85" r="6" fill="#000"/>
    <circle cx="89" cy="84" r="2" fill="#FFF"/>
    <circle cx="113" cy="84" r="2" fill="#FFF"/>
    <!-- Nose -->
    <circle cx="100" cy="98" r="4" fill="#000"/>
    <!-- Mouth -->
    <path d="M 100 103 Q 95 110 82 107" stroke="#000" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M 100 103 Q 105 110 118 107" stroke="#000" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  </svg>`;
}

function generatePanda(color, accentColor) {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <!-- Body -->
    <circle cx="100" cy="130" r="45" fill="${accentColor}"/>
    <!-- Head -->
    <circle cx="100" cy="70" r="40" fill="${accentColor}"/>
    <!-- Ears -->
    <circle cx="70" cy="35" r="15" fill="${color}"/>
    <circle cx="130" cy="35" r="15" fill="${color}"/>
    <!-- Eye patches -->
    <ellipse cx="82" cy="65" rx="15" ry="18" fill="${color}"/>
    <ellipse cx="118" cy="65" rx="15" ry="18" fill="${color}"/>
    <!-- Eyes -->
    <circle cx="82" cy="65" r="6" fill="#FFF"/>
    <circle cx="118" cy="65" r="6" fill="#FFF"/>
    <circle cx="82" cy="65" r="3" fill="#000"/>
    <circle cx="118" cy="65" r="3" fill="#000"/>
    <!-- Nose -->
    <circle cx="100" cy="80" r="4" fill="${color}"/>
    <!-- Mouth -->
    <path d="M 100 85 Q 95 92 85 90" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M 100 85 Q 105 92 115 90" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <!-- Front paws -->
    <ellipse cx="80" cy="165" rx="15" ry="20" fill="${color}"/>
    <ellipse cx="120" cy="165" rx="15" ry="20" fill="${color}"/>
  </svg>`;
}

function generateMonkey(color, accentColor) {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <!-- Body -->
    <ellipse cx="100" cy="130" rx="40" ry="50" fill="${color}"/>
    <!-- Head -->
    <circle cx="100" cy="70" r="40" fill="${color}"/>
    <!-- Face -->
    <circle cx="100" cy="75" r="28" fill="${accentColor}"/>
    <!-- Left Ear -->
    <circle cx="65" cy="45" r="15" fill="${color}"/>
    <circle cx="65" cy="48" r="8" fill="${accentColor}"/>
    <!-- Right Ear -->
    <circle cx="135" cy="45" r="15" fill="${color}"/>
    <circle cx="135" cy="48" r="8" fill="${accentColor}"/>
    <!-- Eyes -->
    <circle cx="85" cy="65" r="6" fill="#000"/>
    <circle cx="115" cy="65" r="6" fill="#000"/>
    <circle cx="86" cy="64" r="2" fill="#FFF"/>
    <circle cx="116" cy="64" r="2" fill="#FFF"/>
    <!-- Nose -->
    <ellipse cx="100" cy="80" rx="5" ry="6" fill="#8B4513"/>
    <!-- Mouth -->
    <path d="M 100 85 Q 95 95 85 93" stroke="#000" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M 100 85 Q 105 95 115 93" stroke="#000" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <!-- Belly -->
    <ellipse cx="100" cy="140" rx="25" ry="30" fill="${accentColor}"/>
  </svg>`;
}

function generateBear(color, accentColor) {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <!-- Body -->
    <ellipse cx="100" cy="130" rx="45" ry="55" fill="${color}"/>
    <!-- Head -->
    <circle cx="100" cy="75" r="45" fill="${color}"/>
    <!-- Left Ear -->
    <circle cx="65" cy="35" r="18" fill="${color}"/>
    <!-- Right Ear -->
    <circle cx="135" cy="35" r="18" fill="${color}"/>
    <!-- Eyes -->
    <circle cx="85" cy="65" r="8" fill="#000"/>
    <circle cx="115" cy="65" r="8" fill="#000"/>
    <circle cx="87" cy="63" r="2" fill="#FFF"/>
    <circle cx="117" cy="63" r="2" fill="#FFF"/>
    <!-- Nose -->
    <circle cx="100" cy="85" r="6" fill="#000"/>
    <!-- Mouth -->
    <path d="M 100 92 Q 95 100 80 98" stroke="#000" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M 100 92 Q 105 100 120 98" stroke="#000" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`;
}

function generateTiger(color, accentColor) {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <!-- Head -->
    <circle cx="100" cy="85" r="45" fill="${color}"/>
    <!-- Stripes -->
    <path d="M 70 60 Q 65 70 70 85" stroke="#000" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M 130 60 Q 135 70 130 85" stroke="#000" stroke-width="3" fill="none" stroke-linecap="round"/>
    <!-- Face -->
    <circle cx="100" cy="90" r="28" fill="${accentColor}"/>
    <!-- Eyes -->
    <circle cx="85" cy="75" r="7" fill="#FFD700"/>
    <circle cx="115" cy="75" r="7" fill="#FFD700"/>
    <circle cx="85" cy="75" r="4" fill="#000"/>
    <circle cx="115" cy="75" r="4" fill="#000"/>
    <!-- Nose -->
    <polygon points="100,90 95,98 105,98" fill="#000"/>
    <!-- Mouth -->
    <path d="M 100 100 Q 90 108 75 105" stroke="#000" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M 100 100 Q 110 108 125 105" stroke="#000" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`;
}

function generateOwl(color, accentColor) {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <!-- Body -->
    <ellipse cx="100" cy="120" rx="38" ry="50" fill="${color}"/>
    <!-- Head -->
    <circle cx="100" cy="70" r="40" fill="${color}"/>
    <!-- Left Ear tuft -->
    <polygon points="65,35 55,20 70,40" fill="${color}"/>
    <!-- Right Ear tuft -->
    <polygon points="135,35 145,20 130,40" fill="${color}"/>
    <!-- Face -->
    <circle cx="100" cy="75" r="30" fill="${accentColor}"/>
    <!-- Left Eye -->
    <circle cx="80" cy="65" r="12" fill="#000"/>
    <circle cx="82" cy="63" r="4" fill="#FFD700"/>
    <!-- Right Eye -->
    <circle cx="120" cy="65" r="12" fill="#000"/>
    <circle cx="122" cy="63" r="4" fill="#FFD700"/>
    <!-- Beak -->
    <polygon points="100,85 95,95 105,95" fill="#FF8C00"/>
    <!-- Belly -->
    <ellipse cx="100" cy="130" rx="24" ry="30" fill="${accentColor}" opacity="0.6"/>
  </svg>`;
}

function generateUnicorn(color, accentColor) {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <!-- Head -->
    <circle cx="100" cy="100" r="45" fill="${color}"/>
    <!-- Horn -->
    <polygon points="100,45 95,55 105,55" fill="#FFD700"/>
    <polygon points="100,45 96,65 104,65" fill="#FFA500"/>
    <!-- Mane -->
    <path d="M 135 75 Q 145 85 140 100" stroke="${accentColor}" stroke-width="8" fill="none" stroke-linecap="round"/>
    <!-- Eyes -->
    <circle cx="85" cy="90" r="7" fill="#000"/>
    <circle cx="115" cy="90" r="7" fill="#000"/>
    <circle cx="87" cy="88" r="2" fill="#FFF"/>
    <circle cx="117" cy="88" r="2" fill="#FFF"/>
    <!-- Nose -->
    <circle cx="100" cy="110" r="5" fill="#FF69B4"/>
    <!-- Smile -->
    <path d="M 100 115 Q 90 125 80 122" stroke="#000" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M 100 115 Q 110 125 120 122" stroke="#000" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`;
}

function generateDragon(color, accentColor) {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <!-- Body -->
    <ellipse cx="100" cy="120" rx="42" ry="50" fill="${color}"/>
    <!-- Head -->
    <circle cx="75" cy="60" r="35" fill="${color}"/>
    <!-- Horn -->
    <polygon points="65,25 60,10 70,25" fill="${accentColor}"/>
    <!-- Spikes down back -->
    <polygon points="95,75 90,60 100,70" fill="${accentColor}"/>
    <polygon points="110,85 105,70 115,82" fill="${accentColor}"/>
    <!-- Eyes -->
    <circle cx="65" cy="50" r="6" fill="#FFD700"/>
    <circle cx="67" cy="48" r="2" fill="#000"/>
    <!-- Nostrils -->
    <circle cx="58" cy="68" r="2" fill="#000"/>
    <!-- Scales on belly -->
    <ellipse cx="100" cy="130" rx="30" ry="35" fill="${accentColor}" opacity="0.5"/>
    <!-- Tail -->
    <path d="M 142 115 Q 160 110 170 95" stroke="${color}" stroke-width="15" fill="none" stroke-linecap="round"/>
  </svg>`;
}

function generateKoala(color, accentColor) {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <!-- Head -->
    <circle cx="100" cy="80" r="45" fill="${color}"/>
    <!-- Left Ear -->
    <circle cx="65" cy="40" r="20" fill="${color}"/>
    <circle cx="65" cy="45" r="12" fill="${accentColor}"/>
    <!-- Right Ear -->
    <circle cx="135" cy="40" r="20" fill="${color}"/>
    <circle cx="135" cy="45" r="12" fill="${accentColor}"/>
    <!-- Face -->
    <circle cx="100" cy="85" r="32" fill="${accentColor}"/>
    <!-- Eyes -->
    <circle cx="82" cy="70" r="8" fill="#000"/>
    <circle cx="118" cy="70" r="8" fill="#000"/>
    <circle cx="84" cy="68" r="2" fill="#FFF"/>
    <circle cx="120" cy="68" r="2" fill="#FFF"/>
    <!-- Nose -->
    <circle cx="100" cy="88" r="6" fill="#000"/>
    <!-- Mouth -->
    <path d="M 100 95 Q 95 105 82 100" stroke="#000" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M 100 95 Q 105 105 118 100" stroke="#000" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`;
}

function generateGiraffe(color, accentColor) {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <!-- Neck -->
    <rect x="95" y="40" width="10" height="60" fill="${color}"/>
    <!-- Patches on neck -->
    <ellipse cx="100" cy="55" rx="8" ry="6" fill="${accentColor}" opacity="0.6"/>
    <ellipse cx="100" cy="75" rx="8" ry="6" fill="${accentColor}" opacity="0.6"/>
    <!-- Head -->
    <circle cx="100" cy="35" r="20" fill="${color}"/>
    <!-- Horns -->
    <line x1="90" y1="18" x2="85" y2="5" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
    <line x1="110" y1="18" x2="115" y2="5" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
    <!-- Eyes -->
    <circle cx="92" cy="30" r="4" fill="#000"/>
    <circle cx="108" cy="30" r="4" fill="#000"/>
    <!-- Body -->
    <ellipse cx="100" cy="130" rx="40" ry="50" fill="${color}"/>
    <!-- Spots -->
    <ellipse cx="85" cy="115" rx="8" ry="10" fill="${accentColor}" opacity="0.6"/>
    <ellipse cx="115" cy="120" rx="8" ry="10" fill="${accentColor}" opacity="0.6"/>
  </svg>`;
}

function generateDolphin(color, accentColor) {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <!-- Body -->
    <ellipse cx="100" cy="110" rx="50" ry="40" fill="${color}"/>
    <!-- Head/Snout -->
    <ellipse cx="140" cy="95" rx="25" ry="20" fill="${color}"/>
    <!-- Dorsal fin -->
    <polygon points="95,70 90,50 100,70" fill="${accentColor}"/>
    <!-- Tail flukes -->
    <path d="M 50 110 Q 35 90 40 70" stroke="${color}" stroke-width="20" fill="none" stroke-linecap="round"/>
    <path d="M 50 110 Q 35 130 40 150" stroke="${color}" stroke-width="20" fill="none" stroke-linecap="round"/>
    <!-- Eye -->
    <circle cx="135" cy="85" r="5" fill="#000"/>
    <circle cx="136" cy="84" r="1.5" fill="#FFF"/>
    <!-- Smile -->
    <path d="M 155 95 Q 160 100 155 105" stroke="#000" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <!-- Belly accent -->
    <ellipse cx="100" cy="120" rx="30" ry="20" fill="${accentColor}" opacity="0.4"/>
  </svg>`;
}

function generateParrot(color, accentColor) {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <!-- Head -->
    <circle cx="100" cy="70" r="35" fill="${color}"/>
    <!-- Crest feathers -->
    <path d="M 95 40 Q 90 25 100 35" fill="${accentColor}" stroke="${accentColor}" stroke-width="2"/>
    <path d="M 100 40 Q 100 20 105 35" fill="${accentColor}" stroke="${accentColor}" stroke-width="2"/>
    <path d="M 105 40 Q 110 25 100 35" fill="${accentColor}" stroke="${accentColor}" stroke-width="2"/>
    <!-- Face -->
    <circle cx="100" cy="75" r="20" fill="${accentColor}"/>
    <!-- Eyes -->
    <circle cx="90" cy="68" r="5" fill="#FFD700"/>
    <circle cx="90" cy="68" r="2" fill="#000"/>
    <!-- Beak -->
    <polygon points="105,75 120,73 115,80" fill="#FF8C00"/>
    <!-- Body/Wing -->
    <ellipse cx="100" cy="125" rx="32" ry="45" fill="${color}"/>
    <!-- Wing detail -->
    <ellipse cx="110" cy="120" rx="15" ry="35" fill="${accentColor}" opacity="0.5"/>
    <!-- Tail -->
    <path d="M 80 160 Q 70 180 75 195" stroke="${color}" stroke-width="8" fill="none" stroke-linecap="round"/>
  </svg>`;
}

function generateButterfly(color, accentColor) {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <!-- Body -->
    <ellipse cx="100" cy="100" rx="6" ry="35" fill="#8B4513"/>
    <!-- Top Left Wing -->
    <ellipse cx="75" cy="75" rx="25" ry="30" fill="${color}" transform="rotate(-30 75 75)"/>
    <!-- Top Right Wing -->
    <ellipse cx="125" cy="75" rx="25" ry="30" fill="${color}" transform="rotate(30 125 75)"/>
    <!-- Bottom Left Wing -->
    <ellipse cx="70" cy="125" rx="20" ry="28" fill="${accentColor}" transform="rotate(-30 70 125)"/>
    <!-- Bottom Right Wing -->
    <ellipse cx="130" cy="125" rx="20" ry="28" fill="${accentColor}" transform="rotate(30 130 125)"/>
    <!-- Wing spots -->
    <circle cx="75" cy="70" r="4" fill="#FFD700"/>
    <circle cx="125" cy="70" r="4" fill="#FFD700"/>
    <!-- Antennae -->
    <path d="M 100 70 Q 95 50 90 40" stroke="#000" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M 100 70 Q 105 50 110 40" stroke="#000" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`;
}

export function boringAvatar(name = 'user', gender = 'boy') {
  try {
    const character = getCharacterForName(name);
    const svg = generateCharacter(character.name, character.color, character.accentColor);
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  } catch (e) {
    console.warn('Avatar generation failed:', e);
    return fallbackInitialsDataUrl(name);
  }
}

export function avatarByCharacter(characterName = 'bunny') {
  try {
    const character = getCharacterByName(characterName);
    const svg = generateCharacter(character.name, character.color, character.accentColor);
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  } catch (e) {
    console.warn('Avatar generation failed:', e);
    return boringAvatar('user');
  }
}

function generateCharacter(charType, color, accentColor) {
  switch (charType) {
    case 'bunny':
      return generateBunny(color, accentColor);
    case 'cat':
      return generateCat(color, accentColor);
    case 'dog':
      return generateDog(color, accentColor);
    case 'fox':
      return generateFox(color, accentColor);
    case 'lion':
      return generateLion(color, accentColor);
    case 'penguin':
      return generatePenguin(color, accentColor);
    case 'panda':
      return generatePanda(color, accentColor);
    case 'dinosaur':
      return generateDinosaur(color, accentColor);
    case 'whale':
      return generateWhale(color, accentColor);
    case 'monkey':
      return generateMonkey(color, accentColor);
    case 'bear':
      return generateBear(color, accentColor);
    case 'tiger':
      return generateTiger(color, accentColor);
    case 'owl':
      return generateOwl(color, accentColor);
    case 'unicorn':
      return generateUnicorn(color, accentColor);
    case 'dragon':
      return generateDragon(color, accentColor);
    case 'koala':
      return generateKoala(color, accentColor);
    case 'giraffe':
      return generateGiraffe(color, accentColor);
    case 'dolphin':
      return generateDolphin(color, accentColor);
    case 'parrot':
      return generateParrot(color, accentColor);
    case 'butterfly':
      return generateButterfly(color, accentColor);
    default:
      return generateBunny(color, accentColor);
  }
}

export function fallbackInitialsDataUrl(name = '') {
  const initials = (name || '').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || '??';
  const character = getCharacterForName(name);
  
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='100%' height='100%' fill='${character.color}' rx='12'/><text x='50%' y='50%' dy='0.35em' text-anchor='middle' font-family='system-ui, -apple-system, Roboto, "Helvetica Neue", Arial' font-size='72' fill='white' font-weight='700'>${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
