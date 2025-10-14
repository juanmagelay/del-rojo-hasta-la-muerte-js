// Camera system with linear interpolation (lerp)
class Camera {
  constructor(viewportWidth, viewportHeight, worldWidth, worldHeight) {
    // Viewport dimensions
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;

    // World dimensions
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;

    // Current camera center position
    this.x = viewportWidth / 2;
    this.y = viewportHeight / 2;

    // Target position (where we want the camera to move)
    this.targetX = this.x;
    this.targetY = this.y;

    // Smooth factor (0-1). Lower is smoother. 0.1 moves 10% of the distance per frame
    this.lerpFactor = 0.1;
  }

  // Linear interpolation helper
  lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  // Set the camera target position
  follow(targetX, targetY) {
    this.targetX = targetX;
    this.targetY = targetY;
  }

  // Update camera position using lerp and clamp to world bounds
  update() {
    this.x = this.lerp(this.x, this.targetX, this.lerpFactor);
    this.y = this.lerp(this.y, this.targetY, this.lerpFactor);

    const halfViewportWidth = this.viewportWidth / 2;
    const halfViewportHeight = this.viewportHeight / 2;

    // Clamp X
    if (this.x - halfViewportWidth < 0) this.x = halfViewportWidth;
    if (this.x + halfViewportWidth > this.worldWidth) this.x = this.worldWidth - halfViewportWidth;

    // Clamp Y
    if (this.y - halfViewportHeight < 0) this.y = halfViewportHeight;
    if (this.y + halfViewportHeight > this.worldHeight) this.y = this.worldHeight - halfViewportHeight;
  }

  // Return the top-left offset to apply to the world container
  getOffset() {
    return {
      x: this.x - this.viewportWidth / 2,
      y: this.y - this.viewportHeight / 2
    };
  }
}
