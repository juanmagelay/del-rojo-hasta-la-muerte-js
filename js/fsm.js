// Lightweight Finite State Machine helper
class FiniteStateMachine {
  constructor(owner) {
    this.owner = owner;
    this.states = {}; // name -> { onEnter, onExit, onUpdate }
    this.current = null;
  }

  addState(name, handlers) {
    this.states[name] = handlers || {};
  }

  setState(name) {
    if (!name) return;
    if (this.current === name) return;
    const prev = this.current;
    if (prev && this.states[prev] && typeof this.states[prev].onExit === 'function') {
      try { this.states[prev].onExit.call(this.owner); } catch (e) { console.error('fsm exit', e); }
    }
    this.current = name;
    if (this.states[name] && typeof this.states[name].onEnter === 'function') {
      try { this.states[name].onEnter.call(this.owner); } catch (e) { console.error('fsm enter', e); }
    }
  }

  update(dt) {
    if (!this.current) return;
    const s = this.states[this.current];
    if (s && typeof s.onUpdate === 'function') {
      try { s.onUpdate.call(this.owner, dt); } catch (e) { console.error('fsm update', e); }
    }
  }

  getState() { return this.current; }
  isActive() { return Object.keys(this.states).length > 0; }
}
