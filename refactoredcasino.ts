// Interfaces for different types of gamblers
interface Gambler {
    name: string;
    money: number;
    isFinished(): boolean;
    bankrupt(): boolean;
    hitTarget(): boolean;
    win(amount: number): void;
    lose(amount: number): void;
    getBetSize(): number;
}

// using implements to avoid inheritance of StableGambler
class StableGambler implements Gambler {
    constructor(private _name: string, private _money: number, private _target: number, private _betSize: number) {}

    get name(): string {
        return this._name;
    }

    get money(): number {
        return this._money;
    }

    isFinished(): boolean {
        return this._money <= 0 || this._money >= this._target;
    }

    bankrupt(): boolean {
        return this._money <= 0;
    }

    hitTarget(): boolean {
        return this._money >= this._target;
    }

    win(amount: number): void {
        this._money += amount;
    }

    lose(amount: number): void {
        this._money -= amount;
    }

    getBetSize(): number {
        return Math.min(this._betSize, this._money);
    }
}

// Same goes for HighRiskGambler implements in the class Gambler
class HighRiskGambler implements Gambler {
    constructor(private _name: string, private _money: number, private _target: number, private _yoloAmount: number) {}

    get name(): string {
        return this._name;
    }

    get money(): number {
        return this._money;
    }

    isFinished(): boolean {
        return this._money <= 0 || this._money >= this._target;
    }

    bankrupt(): boolean {
        return this._money <= 0;
    }

    hitTarget(): boolean {
        return this._money >= this._target;
    }

    win(amount: number): void {
        this._money += amount;
    }

    lose(amount: number): void {
        this._money -= amount;
    }

    getBetSize(): number {
        if (this._money <= this._yoloAmount) {
            return this._money;
        }
        return this._money / 2;
    }
}

// Same for StreakGambler
class StreakGambler implements Gambler {
    constructor(private _name: string, private _money: number, private _target: number, private _initialBet: number, 
                private _minimumBet: number, private _winMultiplier: number, private _lossMultiplier: number) {}

    get name(): string {
        return this._name;
    }

    get money(): number {
        return this._money;
    }

    isFinished(): boolean {
        return this._money <= 0 || this._money >= this._target;
    }

    bankrupt(): boolean {
        return this._money <= 0;
    }

    hitTarget(): boolean {
        return this._money >= this._target;
    }

    win(amount: number): void {
        this._money += amount;
    }

    lose(amount: number): void {
        this._money -= amount;
    }

    getBetSize(): number {
        if (this._money <= this._minimumBet) {
            return this._money;
        }
        return this._initialBet;
    }
}

// Interface for a game
interface Game {
    simulateGame(book: Map<Gambler, number>): void;
}

// an interface that links to the class Game
class TailsIWin implements Game {
    constructor(private _casino: Casino) {}

    simulateGame(book: Map<Gambler, number>): void {
        console.log("playing Tails I Win with book:");
        for (const [player, bet] of book) {
            console.log(player.name + " : $" + bet.toFixed(2));
            const outcome = Math.random() < 0.5 ? 'tails' : 'heads';
            if (outcome === 'tails') {
                const winnings = bet * 1.9;
                console.log("Coin was " + outcome + ". " + player.name + " wins! They won: $" + (winnings - bet).toFixed(2));
                player.win(winnings - bet);
                this._casino.addProfit(-winnings + bet);
            } else {
                console.log("Coin was " + outcome + ". " + player.name + " loses!");
                this._casino.addProfit(bet);
            }
        }
    }
}

// Same for GuessTheNumber
class GuessTheNumber implements Game {
    private _winningNumber: number;

    constructor(private _casino: Casino) {
        this._winningNumber = Math.floor(Math.random() * 5);
    }

    simulateGame(book: Map<Gambler, number>): void {
        console.log("playing Guess the Number with book:");
        console.log("The correct answer is: " + this._winningNumber);
        
        for (const [player, _] of book) {
            const guess = Math.floor(Math.random() * 5);
            console.log(player.name + " guesses " + guess);
            const bet = book.get(player) || 0;
            if (guess === this._winningNumber) {
                const winnings = bet * 4.5;
                console.log(player.name + " is a winner! They won: $" + (winnings - bet).toFixed(2));
                player.win(winnings - bet);
                this._casino.addProfit(-winnings + bet);
            } else {
                console.log(player.name + " has lost!");
                this._casino.addProfit(bet);
            }
        }
    }
}

// Same for OffTrackGuineaPigRacing Game
class OffTrackGuineaPigRacing implements Game {
    private _winningPig: number;
    private _payouts: number[];

    constructor(private _casino: Casino) {
        this._winningPig = Math.floor(Math.random() * 4); 
        this._payouts = [1.9, 3.8, 7.6, 7.6]; 
    }

    simulateGame(book: Map<Gambler, number>): void {
        console.log("playing Off-track Guinea Pig Racing with book:");
        console.log("The winning pig was " + this._winningPig);
        
        const selectedPigs: Set<number> = new Set();

        for (const [player, bet] of book) {
            let restrictedBet = Math.min(Math.max(bet, 0), 3);
            
            while (selectedPigs.has(restrictedBet)) {
                restrictedBet = (restrictedBet + 1) % 4; 
            }

            selectedPigs.add(restrictedBet);

            console.log(player.name + " bets on pig " + restrictedBet);

            if (Number.isInteger(restrictedBet)) { 
                if (this._winningPig === restrictedBet) {
                    const payout = this._payouts[this._winningPig];
                    console.log(player.name + " is a winner! They won: $" + ((restrictedBet * payout) - restrictedBet).toFixed(2));
                    player.win((restrictedBet * payout) - bet);
                    this._casino.addProfit(-((restrictedBet * payout) - bet));
                } else {
                    console.log(player.name + " has lost!");
                    this._casino.addProfit(bet);
                }
            }
        }
    }
}

// Class for the casino
class Casino {
    private _games: Game[];
    private _gamblers: Gambler[];
    private _profits: number;
    private _maxRounds: number;
    private _currentRound: number;

    constructor(maxRounds: number) {
        this._games = [];
        this._profits = 0;
        this._gamblers = [
            new StableGambler("Alice", 100, 15, 10),
            new HighRiskGambler("Bob", 50, 10, 20),
            new StreakGambler("Camille", 200, 10, 10, 2, 0.5, 500)
        ];
        this._maxRounds = maxRounds;
        this._currentRound = 0;
    }

    addProfit(amount: number): void {
        this._profits += amount;
    }

    simulateOneRound(): void {
        const startingProfit = this._profits;

        console.log("-----------------------");
        console.log("beginning round", this._currentRound);
        
        for (const game of this._games) {
            const book: Map<Gambler, number> = new Map();
            for (const player of this._gamblers) {
                const bet = player.getBetSize();
                book.set(player, bet);
                console.log(player.name + " bets: $" + bet.toFixed(2));
            }
            game.simulateGame(book);
        }
        
        console.log("round complete. casino made:", (this._profits - startingProfit).toFixed(2));
        console.log("total profit:", this._profits.toFixed(2));
        console.log("-----------------------");
    }

    simulate(): void {
        while (this._currentRound < this._maxRounds && this._gamblers.length > 0) {
            this._games = [
                new TailsIWin(this),
                new GuessTheNumber(this),
                new OffTrackGuineaPigRacing(this)
            ];
            this.simulateOneRound();
            console.log();
            this._currentRound++;
        }

        console.log("simulation complete");
    }
}

// Run simulation
const MAX_N_ROUNDS = 5;
const casino = new Casino(MAX_N_ROUNDS);
casino.simulate();
