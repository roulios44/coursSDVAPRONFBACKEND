function createIdGenerator(start = 1) {
  let current = start;
  return () => current++;
}

module.exports = { createIdGenerator };
