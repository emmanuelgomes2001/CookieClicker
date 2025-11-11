'use strict';

class MoneyGame {
  constructor({ counterEl, playfieldEl, makeBtn, upgradeBtn, farmBtn, cost = 10 }) {
    this.counterEl = counterEl;
    this.playfieldEl = playfieldEl;
    this.makeBtn = makeBtn;
    this.upgradeBtn = upgradeBtn;
    this.farmBtn = farmBtn;

    this.money = 0;
    this.power = 1;
    this.COST = cost;
    this.bills = [];

    this.upgradeCount = 0;

    this.cellW = 28;
    this.cellH = 32;
    this.margin = 8;

    // Farm system
    this.farms = [];
    this.baseFarmCost = 50;
    this.autoTimer = null;
    this.tickRate = 1000;

    // Event listeners
    this.makeBtn.addEventListener('click', () => this.click());
    this.upgradeBtn.addEventListener('click', () => this.upgrade());
    this.farmBtn.addEventListener('click', () => this.buyFarm());
    window.addEventListener('resize', () => this.layoutBills());

    this.updateUI();
  }

  // --- Main game methods ---
  click() {
    for (let i = 0; i < this.power; i++) this.spawnBill();
    this.updateUI();
  }

  upgrade() {
    if (this.money < this.COST) return;

    // pay for upgrade
    for (let i = 0; i < this.COST; i++) this.removeLastBill();

    // stronger each time
    this.upgradeCount += 1;
    this.power += this.upgradeCount;

    // increase future upgrade cost
    this.COST = Math.floor(this.COST * 1.5);

    this.makeBtn.textContent = `Make Money (+${this.power})`;
    this.upgradeBtn.textContent = `Upgrade (${this.COST})`;

    this.updateUI();
  }

  spawnBill() {
    const el = document.createElement('span');
    el.className = 'bill';
    el.textContent = '💵';
    const startX = Math.floor(Math.random() * (window.innerWidth - this.cellW));
    el.style.left = startX + 'px';
    el.style.top = '-40px';
    this.playfieldEl.appendChild(el);
    this.bills.push(el);
    this.layoutBills();
  }

  removeLastBill() {
    const el = this.bills.pop();
    if (!el) return;
    el.style.transition = 'transform .2s ease, opacity .2s ease, top .2s ease, left .2s ease';
    el.style.transform = 'scale(.6)';
    el.style.opacity = '.2';
    setTimeout(() => el.remove(), 200);
    this.layoutBills();
  }

  layoutBills() {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const cols = Math.max(1, Math.floor(W / this.cellW));
    const baseY = H - this.margin;

    this.bills.forEach((el, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      el.style.left = (col * this.cellW + 4) + 'px';
      el.style.top = (baseY - (row + 1) * this.cellH) + 'px';
    });
  }

  updateUI() {
    this.money = this.bills.length;
    const farmCount = this.farms.length;
    const nextFarmCost = this.getNextFarmCost();

    this.counterEl.textContent = `Money: ${this.money} | Farms: ${farmCount}`;
    this.upgradeBtn.disabled = this.money < this.COST;

    if (this.farmBtn) {
      this.farmBtn.disabled = this.money < nextFarmCost;
      this.farmBtn.textContent = `Buy Farm (${nextFarmCost})`;
    }
  }

  // --- Farm system --- zet getnextfarm cost en buy farm in farm class 
  // --- Farm system --- farm cost & buying delegated to Farm class
  getNextFarmCost() {
    // Delegate cost calculation to Farm; pass current farm count and base cost.
    return Farm.getNextCost(this.farms.length, this.baseFarmCost);
  }

  buyFarm() {
    // Delegate buying flow to Farm.buy which handles payment and creation.
    const bought = Farm.buy(this);
    if (bought) this.updateUI();
  }

  startFarms() {
    if (this.autoTimer) clearInterval(this.autoTimer);
    this.autoTimer = setInterval(() => {
      this.farms.forEach(f => f.produce(this));
      this.updateUI();
    }, this.tickRate);
  }
}

class Farm {
  constructor({ cost = 50, rate = 1 }) {
    this.cost = cost;
    this.rate = rate;
    
  }

  // Compute cost for the next farm given how many farms already exist.
  // Defaults: base = 50, multiplier = 1.5 (tweakable).
  static getNextCost(count, base = 50, multiplier = 1.5) {
    return Math.floor(base * Math.pow(multiplier, count));
  }

  // Attempt to buy a farm for the provided game instance.
  // Returns true if purchase succeeded, false otherwise.
  // This handles payment (removing bills), creating the Farm and starting autos.
  static buy(game, rate = 1) {
    const cost = Farm.getNextCost(game.farms.length, game.baseFarmCost);
    if (game.money < cost) return false;

    // Pay for farm by removing bills
    for (let i = 0; i < cost; i++) game.removeLastBill();

    // Create and register farm
    const farm = new Farm({ cost, rate });
    game.farms.push(farm);
    game.startFarms();
    return true;
  }

  produce(game) {
    for (let i = 0; i < this.rate; i++) {
      game.spawnBill();
    }
  }
}

// --- Initialize Game ---
const game = new MoneyGame({
  counterEl: document.getElementById('cookie_counter'),
  playfieldEl: document.getElementById('playfield'),
  makeBtn: document.getElementById('cookie_btn'),
  upgradeBtn: document.getElementById('upgrade_btn'),
  farmBtn: document.getElementById('farm_btn'),
  cost: 10
});

window.game = game;
