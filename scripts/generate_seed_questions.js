const fs = require('fs');

// Domains
const E = [1, 2, 3, 4, 5, 6, 7, 8, 9]; // Executing
const I = [10, 11, 12, 13, 14, 15, 16, 17]; // Influencing
const R = [18, 19, 20, 21, 22, 23, 24, 25, 26]; // Relationship
const S = [27, 28, 29, 30, 31, 32, 33, 34]; // Strategic

// Target degree: 4 for all 34 talents.
// Total vertices = 34, degree = 4 => 68 edges.
// Cross-domain requirement: domain(u) !== domain(v).

function getDomain(id) {
  if (id <= 9) return 'executing';
  if (id <= 17) return 'influencing';
  if (id <= 26) return 'relationship';
  return 'strategic';
}

// Bipartite/4-partite matching to find a 4-regular graph with no intra-domain edges
function findGraph() {
  const talents = Array.from({ length: 34 }, (_, i) => i + 1);
  const maxAttempts = 1000;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const degrees = {};
    talents.forEach(t => degrees[t] = 0);
    const edges = [];
    const edgeSet = new Set();
    
    // Shuffle talents
    const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
    
    // Try building edges
    for (let round = 0; round < 4; round++) {
      // In each round, try to match vertices with degree < 4
      const order = shuffle(talents).sort((a, b) => degrees[b] - degrees[a]);
      // Sort ascending degrees to prioritize lower degrees
      order.sort((a, b) => degrees[a] - degrees[b]);
      
      for (const u of order) {
        if (degrees[u] >= 4) continue;
        const uDom = getDomain(u);
        
        // Candidates must: have degree < 4, different domain, not connected to u
        const candidates = shuffle(talents).filter(v => 
          v !== u && 
          degrees[v] < 4 && 
          getDomain(v) !== uDom &&
          !edgeSet.has(`${Math.min(u, v)}-${Math.max(u, v)}`)
        ).sort((a, b) => degrees[a] - degrees[b]);
        
        if (candidates.length > 0) {
          const v = candidates[0];
          edges.push([u, v]);
          edgeSet.add(`${Math.min(u, v)}-${Math.max(u, v)}`);
          degrees[u]++;
          degrees[v]++;
        }
      }
    }
    
    // Check if valid
    const allFour = talents.every(t => degrees[t] === 4);
    if (allFour && edges.length === 68) {
      console.log(`Found valid 4-regular cross-domain graph on attempt ${attempt + 1}!`);
      return edges;
    }
  }
  throw new Error("Could not find matching within attempt limit");
}

const edges = findGraph();
console.log("Edges count:", edges.length);

