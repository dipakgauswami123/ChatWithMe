// matchmaker.js — Bidirectional gender preference matching with city priority

/**
 * Check if two users are a compatible match.
 * Both users must satisfy each other's gender preference.
 * @param {Object} userA
 * @param {Object} userB
 * @returns {boolean}
 */
function isMatch(userA, userB) {
  const aLikesB =
    userA.preferredGender === 'any' || userA.preferredGender === userB.gender;
  const bLikesA =
    userB.preferredGender === 'any' || userB.preferredGender === userA.gender;
  return aLikesB && bLikesA;
}

/**
 * Try to find a match for any two users in the waiting queue.
 * Priority: same city first, then any city.
 * @param {Map} waitingQueue - socketId -> userData
 * @returns {{ idA: string, userA: Object, idB: string, userB: Object } | null}
 */
function findMatch(waitingQueue) {
  const waiting = Array.from(waitingQueue.entries());

  // Pass 1: Same city priority
  for (let i = 0; i < waiting.length; i++) {
    for (let j = i + 1; j < waiting.length; j++) {
      const [idA, userA] = waiting[i];
      const [idB, userB] = waiting[j];
      const sameCity =
        userA.city &&
        userB.city &&
        userA.city.trim().toLowerCase() === userB.city.trim().toLowerCase();
      if (sameCity && isMatch(userA, userB)) {
        return { idA, userA, idB, userB };
      }
    }
  }

  // Pass 2: Any city fallback
  for (let i = 0; i < waiting.length; i++) {
    for (let j = i + 1; j < waiting.length; j++) {
      const [idA, userA] = waiting[i];
      const [idB, userB] = waiting[j];
      if (isMatch(userA, userB)) {
        return { idA, userA, idB, userB };
      }
    }
  }

  return null;
}

module.exports = { findMatch };
