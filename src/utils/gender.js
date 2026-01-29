// Common male and female names for gender detection
const MALE_NAMES = new Set([
  'aaron', 'adam', 'aidan', 'alan', 'alex', 'alexander', 'andrew', 'anthony', 'arthur',
  'ben', 'benjamin', 'bradley', 'brandon', 'brian', 'bruce',
  'caleb', 'cameron', 'carl', 'charles', 'christian', 'christopher', 'connor',
  'daniel', 'david', 'derek', 'dominic', 'donald', 'dylan',
  'edward', 'ethan', 'evan',
  'felix', 'finn', 'francis', 'frank', 'frederick',
  'gabriel', 'george', 'graham', 'gregory',
  'harry', 'henry', 'howard', 'hugo',
  'ian', 'isaac', 'ivan', 'isaiah',
  'jack', 'jacob', 'james', 'jason', 'jeffrey', 'jeremy', 'john', 'jonathan', 'jordan', 'joseph', 'joshua', 'justin',
  'kevin', 'kyle',
  'lawrence', 'leo', 'leon', 'liam', 'lucas', 'luke',
  'michael', 'mohammed', 'morgan', 'matthew', 'martin', 'max', 'michael',
  'nathan', 'nicholas', 'noah',
  'oliver', 'oscar', 'owen',
  'patrick', 'paul', 'peter', 'philip',
  'quinn',
  'rachel', 'raymond', 'richard', 'robert', 'ryan', 'roger', 'ronald', 'russell',
  'samuel', 'scott', 'sean', 'seth', 'simon', 'stephen', 'stewart', 'steven',
  'taylor', 'thomas', 'timothy', 'toby', 'tyler',
  'victor', 'vincent',
  'william', 'wyatt',
  'xavier',
  'zachary', 'zack'
]);

const FEMALE_NAMES = new Set([
  'abigail', 'alice', 'amanda', 'amy', 'andrea', 'angelina', 'anna', 'annabelle', 'anne', 'ashley',
  'becca', 'bella', 'beth', 'bianca', 'brittany',
  'catherine', 'charlotte', 'chloe', 'christina', 'claire',
  'daisy', 'diana', 'danielle', 'deborah', 'donna',
  'eleanor', 'elizabeth', 'ella', 'emily', 'emma', 'evelyn', 'eva', 'eric',
  'faith', 'fiona', 'florence', 'francesca',
  'georgia', 'grace', 'gwen',
  'hannah', 'harriet', 'heather', 'helen', 'holly',
  'isabel', 'isabella', 'ivy', 'irene',
  'jackie', 'jane', 'jasmine', 'jennifer', 'jessica', 'joanna', 'julia', 'julie', 'june',
  'karen', 'katherine', 'katie', 'kelly', 'kimberly', 'kristen', 'kylie',
  'laura', 'lauren', 'leah', 'lily', 'lisa', 'lucy', 'lydia',
  'madeleine', 'margaret', 'maria', 'marie', 'martha', 'mary', 'maya', 'megan', 'melissa', 'michelle', 'molly',
  'nancy', 'natalie', 'nicole', 'nina', 'nova',
  'olivia', 'ophelia',
  'paige', 'patricia', 'penny', 'phoebe',
  'quinn',
  'rachel', 'rebecca', 'ruth', 'rose', 'ruby', 'robin',
  'samantha', 'sarah', 'sophie', 'sophia', 'stella', 'susan', 'stephanie', 'sandra', 'sharon', 'shelley',
  'tanya', 'taylor', 'tiffany', 'tina', 'tracy', 'tara',
  'ursula',
  'valerie', 'vanessa', 'victoria', 'violet', 'vivian',
  'wendy', 'whitney',
  'yolanda', 'yvonne',
  'zoe'
]);

/**
 * Detect gender based on first name
 * @param {string} fullName - Full name of the person
 * @returns {string} - 'boy', 'girl', or 'boy' (default)
 */
export function detectGender(fullName) {
  if (!fullName || typeof fullName !== 'string') {
    return 'boy'; // Default fallback
  }

  // Get the first name
  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0]?.toLowerCase();

  if (!firstName) {
    return 'boy'; // Default fallback
  }

  // Check against known male names
  if (MALE_NAMES.has(firstName)) {
    return 'boy';
  }

  // Check against known female names
  if (FEMALE_NAMES.has(firstName)) {
    return 'girl';
  }

  // If name not found, use heuristic based on ending
  // Female names often end with: a, e, i, y, ie
  if (firstName.match(/[aeiy]$/i)) {
    return 'girl';
  }

  // Male names often end with: n, r, s, t, d, k, l
  if (firstName.match(/[nrstdkl]$/i)) {
    return 'boy';
  }

  // Default fallback
  return 'boy';
}

export { MALE_NAMES, FEMALE_NAMES };
