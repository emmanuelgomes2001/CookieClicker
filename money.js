'use strict';

class MoneyGame {
  constructor( counterEl, playfieldEl, makeBtn, upgradeBtn, farmBtn, factoriesBtn, cost = 10) {
    this.counterEl = counterEl;
    this.playfieldEl = playfieldEl;
    this.makeBtn = makeBtn;
    this.upgradeBtn = upgradeBtn;
    this.farmBtn = farmBtn;
    this.factoriesBtn = factoriesBtn;

    this.money = 0;
    this.power = 1;
    this.COST = cost;
    this.bills = [];

    this.upgradeCount = 0;

    this.cellW = 28;
    this.cellH = 32;
    this.margin = 8;

    // Farm system
    this.farms = new Farm(50, 1);
    this.factories = new Farm(100, 10);
    this.autoTimer = null;
    this.tickRate = 1000;

    // Event listeners
    this.makeBtn.addEventListener('click', () => this.click());
    this.upgradeBtn.addEventListener('click', () => this.upgrade());
    this.farmBtn.addEventListener('click', () => this.farms.buy(this));
    this.factoriesBtn.addEventListener('click', () => this.factories.buy(this));
    
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

  addMoney(amount) {
    for (let i = 0; i < amount; i++) {
      this.spawnBill()
    };
  }

  removeMoney(amount) {
    for (let i = 0; i < amount; i++) {
      this.removeLastBill()
    };
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
    const farmCount = this.farms.count;
    const nextFarmCost = this.farms.cost;

    this.counterEl.textContent = `Money: ${this.money} | Farms: ${farmCount}`;
    this.upgradeBtn.disabled = this.money < this.COST;

    if (this.farmBtn) {
      this.farmBtn.disabled = this.money < nextFarmCost;
      this.farmBtn.textContent = `Buy Farm (${nextFarmCost})`;
    }

    if (this.factoriesBtn) {
      this.factoriesBtn.disabled = this.money < this.factories.cost;
      this.factoriesBtn.textContent = `Buy Factory (${this.factories.cost})`;
    }
  }
  startFarms() {
    if (this.autoTimer) clearInterval(this.autoTimer);
    this.autoTimer = setInterval(() => {
      this.farms.produce(this);
      this.factories.produce(this);
      this.updateUI();
    }, this.tickRate);
  }
}

class Farm {
  constructor(cost, rate) {
    this.cost = cost;
    this.rate = rate;
    this.count = 0;
  }

  produce(game) {
    game.addMoney(this.count * this.rate);
  }

  increaseCost() {
    const growth = 1.5;
    this.cost = Math.floor(this.cost * growth);
  };

  
  buy(game) {
    // Ensure player has enough money (bills length is money)
    if (game.money < this.cost) return false;

    // Pay: remove cost bills
    game.removeMoney(this.cost);
    this.count += 1;
    this.increaseCost();
    game.updateUI();
    // Start auto production timer if not already running
    if (!game.autoTimer) game.startFarms();

    return true;
  };
}



// --- Initialize Game ---
const game = new MoneyGame(
  document.getElementById('cookie_counter'),
  document.getElementById('playfield'),
  document.getElementById('cookie_btn'),
  document.getElementById('upgrade_btn'),
  document.getElementById('farm_btn'),
  document.getElementById('factories_btn'),
  10
);

window.game = game;

