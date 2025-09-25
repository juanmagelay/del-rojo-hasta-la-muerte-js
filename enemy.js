class Enemy extends GameObject {
    vision;
    target;
    persecutor;
    
    constructor ( spritesheetData, x, y, game ) {
        super( spritesheetData, x, y, game );

        //Vision, target and persecutor
        this.vision = Math.random() * 200 + 300;
        this.target = null;
        this.persecutor = null;
    }

    applyBrain() {
        this.flee();
        this.chase();
        this.wander();
    }

    //Functions

    chase() {
        if ( !this.target ) return;
        
        // mouse targets come in as { position: {x,y} }
        const targetPos = this.target.position ? this.target.position : this.target;
        const dist = calculateDistance(this.position, targetPos);
        if ( dist > this.vision ) return;

        const difX = targetPos.x - this.position.x;
        const difY = targetPos.y - this.position.y;

        // Normalize the direction and apply acceleration
        const magnitude = Math.sqrt(difX * difX + difY * difY);
        
        if ( magnitude > 0 ) {
          this.acceleration.x += (difX / magnitude) * 0.1;
          this.acceleration.y += (difY / magnitude) * 0.1;
        }
    }

    flee() {
        if ( !this.persecutor ) return;
        
        const pursPos = this.persecutor.position ? this.persecutor.position : this.persecutor;
        const dist = calculateDistance(this.position, pursPos);
        if ( dist > this.vision ) return;

        const difX = pursPos.x - this.position.x;
        const difY = pursPos.y - this.position.y;

        // Normalize the direction and apply acceleration (opposite direction)
        const magnitude = Math.sqrt(difX * difX + difY * difY);
        if ( magnitude > 0 ) {
          this.acceleration.x += (-difX / magnitude) * 0.1;
          this.acceleration.y += (-difY / magnitude) * 0.1;
        }
    }

    wander() {     
      // Add small random acceleration to keep characters moving        
      if (Math.abs(this.acceleration.x) < 0.01 && Math.abs(this.acceleration.y) < 0.01) {
        this.acceleration.x += (Math.random() - 0.5) * 0.05;
        this.acceleration.y += (Math.random() - 0.5) * 0.05;
      }
    }
}