class Enemy extends GameObject {
    target;
	boids;
    
    active = false;
    constructor ( spritesheetData, x, y, game ) {
      super( spritesheetData, x, y, game );

      //Target
      this.target = null;

      // Boids tuning (radii in px, weights are multipliers)
      this.boids = {
        separationRadius: 32,
        alignmentRadius: 220,
        cohesionRadius: 260,
        heroChaseRadius: 400,
        separationWeight: 1.3,
        alignmentWeight: 0.8,
        cohesionWeight: 0.9,
        stopRadius: 18
      };

  // Finite State Machine for enemy behavior
      this.fsm = new FiniteStateMachine(this);
      // Wander / Patrol state: default roaming + boids
      this.fsm.addState('wander', {
        onEnter() { /* nothing special */ },
        onUpdate() {
          // Boids behaviors
          const neighbors = this._getNeighbors(Math.max(this.boids.separationRadius, this.boids.alignmentRadius, this.boids.cohesionRadius));
          if (neighbors.length > 0) {
            this._separate(neighbors);
            this._align(neighbors);
            this._cohesion(neighbors);
          }
          this.wander();
          // Update animation based on movement direction
          const speed = this.velocity && Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y) || 0;
          if (speed <= 0.1) {
            if (this.spritesAnimated.idle) this.changeAnimation('idle');
          } else {
            const a = this.angle;
            if ( a > 45 && a < 135 && this.spritesAnimated.front) {
              this.changeAnimation('front');
              if (typeof this._applyHorizontalFlip === 'function') this._applyHorizontalFlip();
            } else if (a < -45 && a > -135 && this.spritesAnimated.back) {
              this.changeAnimation('back');
              if (typeof this._applyHorizontalFlip === 'function') this._applyHorizontalFlip();
            } else if (this.spritesAnimated.walk) {
              this.changeAnimation('walk');
              if (typeof this._applyHorizontalFlip === 'function') this._applyHorizontalFlip();
            }
          }
        }
      });

      // Chase state: move towards target (hero or toilet)
      this.fsm.addState('chase', {
        onEnter() { /* ensure animation selected in onUpdate */ },
        onUpdate() {
          this.chase();
          const speed = this.velocity && Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y) || 0;
          if (speed > 0.1 && this.spritesAnimated.walk) {
            this.changeAnimation('walk');
            if (typeof this._applyHorizontalFlip === 'function') this._applyHorizontalFlip();
          }
        }
      });

      // Stop/attack state: close to target, halt movement
      this.fsm.addState('stop', {
        onEnter() { this.velocity.x = 0; this.velocity.y = 0; this.acceleration.x = 0; this.acceleration.y = 0; if (this.spritesAnimated.idle) this.changeAnimation('idle'); },
        onUpdate() { /* remain stopped */ }
      });
      // Attack hero: specialized attack behavior (could play attack animation)
      this.fsm.addState('attackHero', {
        onEnter() {
          // Stop moving and play attack animation if exists
          this.velocity.x = 0; this.velocity.y = 0; this.acceleration.x = 0; this.acceleration.y = 0;
          if (this.spritesAnimated.attack) this.changeAnimation('attack');
          else if (this.spritesAnimated.front) this.changeAnimation('front');
        },
        onUpdate() { /* damage is handled by Game when in contact */ }
      });

      // Attack toilet: specialized attack behavior (could play attack animation)
      this.fsm.addState('attackToilet', {
        onEnter() {
          this.velocity.x = 0; this.velocity.y = 0; this.acceleration.x = 0; this.acceleration.y = 0;
          if (this.spritesAnimated.attack) this.changeAnimation('attack');
          else if (this.spritesAnimated.front) this.changeAnimation('front');
        },
        onUpdate() { /* toilet damage handled by Game when in contact */ }
      });
      // Enable movement by default; game may disable enemies when showing overlays
      this.active = true;
    }

    applyBrain() {
      // Keep the active flag; actual behavior is executed by FSM in onUpdate
      if (!this.active) return;
      // No-op here. Per-frame decisions are done in perceiveEnvironment() (which sets FSM state)
      // and in the FSM onUpdate handlers (executed later in GameObject.tick).
    }

    //Functions

    chase() {
      if (!this.target) return;
      
      const targetPos = this.target.position ? this.target.position : this.target;
      const dist = calculateDistance(this.position, targetPos);
      
      //Larger radius for toilets
      const chaseRadius = this.target.isToilet ? 220 : this.boids.heroChaseRadius;
      
      if (dist > chaseRadius) return;

      const difX = targetPos.x - this.position.x;
      const difY = targetPos.y - this.position.y;
      const magnitude = Math.sqrt(difX * difX + difY * difY);
      
      if (magnitude > 0) {
        //More aggressive with toilets
        const intensity = this.target.isToilet ? 0.15 : 0.1;
        this.acceleration.x += (difX / magnitude) * intensity;
        this.acceleration.y += (difY / magnitude) * intensity;
      }
    }

    wander() {     
      //Add small random acceleration to keep characters moving        
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
          //Vector from neighbor to me, stronger the closer
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
			//steering = desired - currentVelocity (approx)
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

    _findNearestToilet() {
        const activeToilets = this.game.toilets.filter(t => !t.destroyed);
        if (activeToilets.length === 0) return null;
        
        let nearest = null;
        let minDist = 220; //Detection radius
        
        for (let toilet of activeToilets) {
        const dist = calculateDistance(this.position, toilet.position);
            if (dist < minDist) {
                minDist = dist;
                nearest = toilet;
            }
        }

        return nearest;
    }

    // Decide FSM state based on target distance and activity
    perceiveEnvironment() {
      if (!this.active) return;
      
      // Game loop may set this.target already (nearest toilet or hero). Respect it.
      const target = this.target;
      
      if (!target) { this.fsm.setState('wander'); return; }
      const targetPos = target.position ? target.position : target;
      const d = calculateDistance(this.position, targetPos);
      
      // If very close, choose an attack state (hero vs toilet) — Game handles actual damage
      if (d <= this.boids.stopRadius) {
        if (target.isToilet) { this.fsm.setState('attackToilet'); return; }
        if (target instanceof Hero) { this.fsm.setState('attackHero'); return; }
        this.fsm.setState('stop'); return;
      }
      
      // If within chase radius (larger for toilets), chase
      const chaseRadius = target.isToilet ? 220 : this.boids.heroChaseRadius;
      if (d <= chaseRadius) { this.fsm.setState('chase'); return; }
      
      // Otherwise wander
      this.fsm.setState('wander');
    }
}
