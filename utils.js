function radiansToDegrees(radians) {
  return radians * (180 / Math.PI);
}

function calculateDistance(obj1, obj2) {
  const dx = obj2.x - obj1.x;
  const dy = obj2.y - obj1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function limitVector(vector, maxMagnitude) {
  const currentMagnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

  if (currentMagnitude > maxMagnitude) {
    const scale = maxMagnitude / currentMagnitude;
    return {
      x: vector.x * scale,
      y: vector.y * scale,
    };
  }

  //If it is already within the limit, it is returned the same way.
  return { ...vector };
}