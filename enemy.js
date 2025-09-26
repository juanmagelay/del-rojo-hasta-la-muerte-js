class Enemy extends GameObject {
    target;
	  boids;
    
    constructor ( spritesheetData, x, y, game ) {
      super( spritesheetData, x, y, game );

      // Target
          this.target = null;

      // Boids tuning (radii in px, weights are multipliers)
      this.boids = {
        separationRadius: 32,
        alignmentRadius: 140,
        cohesionRadius: 160,
        heroChaseRadius: 200,
        separationWeight: 1.3,
        alignmentWeight: 0.8,
        cohesionWeight: 0.9,
        stopRadius: 18
      };
    }

    applyBrain() {
		// If very close to hero, stop and skip other behaviors
		if (this.target) {
			const targetPos = this.target.position ? this.target.position : this.target;
			const dStop = calculateDistance(this.position, targetPos);
			if (dStop <= this.boids.stopRadius) {
				this.velocity.x = 0; this.velocity.y = 0;
				this.acceleration.x = 0; this.acceleration.y = 0;
				return;
			}
		}

		
      // Boids: separation, alignment, cohesion (enemies flocking)
      const neighbors = this._getNeighbors(Math.max(this.boids.separationRadius, this.boids.alignmentRadius, this.boids.cohesionRadius));
      if (neighbors.length > 0) {
        this._separate(neighbors);
        this._align(neighbors);
        this._cohesion(neighbors);
      }

      // Hero chase in a little radious
      this.chase();

      // Light wander if there are no significant forces
      this.wander();
      }

    //Functions

    chase() {
        if ( !this.target ) return;
        
        const targetPos = this.target.position ? this.target.position : this.target;
		    const dist = calculateDistance(this.position, targetPos);
		    if ( dist > this.boids.heroChaseRadius ) return;

        const difX = targetPos.x - this.position.x;
        const difY = targetPos.y - this.position.y;

        // Normalize the direction and apply acceleration
        const magnitude = Math.sqrt(difX * difX + difY * difY);
        
        if ( magnitude > 0 ) {
          this.acceleration.x += (difX / magnitude) * 0.1;
          this.acceleration.y += (difY / magnitude) * 0.1;
        }
    }

    wander() {     
      
      // Add small random acceleration to keep characters moving        
      if (Math.abs(this.acceleration.x) < 0.01 && Math.abs(this.acceleration.y) < 0.01) {
        this.acceleration.x += (Math.random() - 0.5) * 0.05;
        this.acceleration.y += (Math.random() - 0.5) * 0.05;
      }
    }

    // --- Boids helpers ---
    _getNeighbors( maxRadius ) {
      const result = [];
      for (let c of this.game.characters) {
        if (c === this) continue;
        if (!(c instanceof Enemy)) continue;
        const d = calculateDistance(this.position, c.position);
        if (d <= maxRadius) result.push(c);
      }
      return result;
    }

    _separate(neighbors) {
      let steer = { x: 0, y: 0 };
      let count = 0;
      for (let n of neighbors) {
        const d = calculateDistance(this.position, n.position);
        if (d > 0 && d < this.boids.separationRadius) {
          // Vector desde vecino hacia mí, más fuerte cuanto más cerca
          const diffX = this.position.x - n.position.x;
          const diffY = this.position.y - n.position.y;
          const inv = 1 / d;
          steer.x += diffX * inv;
          steer.y += diffY * inv;
          count++;
        }
      }
      if (count > 0) {
        steer.x /= count; steer.y /= count;
        const mag = Math.sqrt(steer.x * steer.x + steer.y * steer.y) || 1;
        steer.x = (steer.x / mag) * this.maxAcceleration;
        steer.y = (steer.y / mag) * this.maxAcceleration;
        this.acceleration.x += steer.x * this.boids.separationWeight;
        this.acceleration.y += steer.y * this.boids.separationWeight;
      }
    }

	_align(neighbors) {
		let sum = { x: 0, y: 0 };
		let count = 0;
		for (let n of neighbors) {
			const d = calculateDistance(this.position, n.position);
			if (d < this.boids.alignmentRadius) {
				sum.x += n.velocity.x;
				sum.y += n.velocity.y;
				count++;
			}
		}
		if (count > 0) {
			sum.x /= count; sum.y /= count;
			// steering = desired - currentVelocity (approx)
			let steer = { x: sum.x - this.velocity.x, y: sum.y - this.velocity.y };
			const mag = Math.sqrt(steer.x * steer.x + steer.y * steer.y);
			if (mag > 0) {
				steer.x = (steer.x / mag) * this.maxAcceleration;
				steer.y = (steer.y / mag) * this.maxAcceleration;
				this.acceleration.x += steer.x * this.boids.alignmentWeight;
				this.acceleration.y += steer.y * this.boids.alignmentWeight;
			}
		}
	}

  _cohesion(neighbors) {
    let center = { x: 0, y: 0 };
    let count = 0;
    for (let n of neighbors) {
      const d = calculateDistance(this.position, n.position);
      if (d < this.boids.cohesionRadius) {
        center.x += n.position.x;
        center.y += n.position.y;
        count++;
      }
    }
    if (count > 0) {
      center.x /= count; center.y /= count;
      let desired = { x: center.x - this.position.x, y: center.y - this.position.y };
      const mag = Math.sqrt(desired.x * desired.x + desired.y * desired.y);
      if (mag > 0) {
        desired.x = (desired.x / mag) * this.maxAcceleration;
        desired.y = (desired.y / mag) * this.maxAcceleration;
        this.acceleration.x += desired.x * this.boids.cohesionWeight;
        this.acceleration.y += desired.y * this.boids.cohesionWeight;
      }
    }
  }
}