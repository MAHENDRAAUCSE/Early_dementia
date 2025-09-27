export interface NotificationService {
  requestPermission(): Promise<boolean>;
  scheduleHourlyPuzzles(): void;
  sendPuzzleNotification(puzzle: DailyPuzzle): void;
  cancelAllNotifications(): void;
}

export interface DailyPuzzle {
  id: string;
  type: "math" | "memory" | "pattern" | "word" | "logic";
  question: string;
  options?: string[];
  correctAnswer: string;
  difficulty: 1 | 2 | 3;
  points: number;
}

export interface PuzzleStreak {
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  lastCompletedDate: string;
}

class BrowserNotificationService implements NotificationService {
  private notificationPermission: NotificationPermission = "default";
  private intervalId: NodeJS.Timeout | null = null;
  private readonly STORAGE_KEY = "cognitive_puzzle_streak";
  private readonly NOTIFICATION_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

  constructor() {
    this.notificationPermission = Notification.permission;
    this.initializeStreak();
  }

  private initializeStreak() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) {
      const initialStreak: PuzzleStreak = {
        currentStreak: 0,
        longestStreak: 0,
        totalCompleted: 0,
        lastCompletedDate: ""
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initialStreak));
    }
  }

  async requestPermission(): Promise<boolean> {
    if (this.notificationPermission === "granted") {
      return true;
    }

    if (this.notificationPermission === "denied") {
      return false;
    }

    const permission = await Notification.requestPermission();
    this.notificationPermission = permission;
    return permission === "granted";
  }

  scheduleHourlyPuzzles(): void {
    // Clear existing interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Check if notifications are enabled
    const isEnabled = localStorage.getItem("hourly_puzzles_enabled") === "true";
    if (!isEnabled || this.notificationPermission !== "granted") {
      return;
    }

    // Schedule notifications every hour
    this.intervalId = setInterval(() => {
      const puzzle = this.generateRandomPuzzle();
      this.sendPuzzleNotification(puzzle);
    }, this.NOTIFICATION_INTERVAL);

    // Send first notification after 1 minute (for testing)
    setTimeout(() => {
      const puzzle = this.generateRandomPuzzle();
      this.sendPuzzleNotification(puzzle);
    }, 60 * 1000);
  }

  sendPuzzleNotification(puzzle: DailyPuzzle): void {
    if (this.notificationPermission !== "granted") return;

    const streak = this.getStreak();
    const notification = new Notification("🧠 Cognitive Health Challenge!", {
      body: `Puzzle #${streak.totalCompleted + 1}: ${puzzle.question}`,
      icon: "/favicon.ico",
      tag: `puzzle-${puzzle.id}`,
      requireInteraction: true
    });

    notification.onclick = () => {
      window.focus();
      // Navigate to puzzle page
      window.location.href = `/daily-puzzle/${puzzle.id}`;
      notification.close();
    };

    // Store the puzzle for later access
    localStorage.setItem(`puzzle_${puzzle.id}`, JSON.stringify(puzzle));
  }

  cancelAllNotifications(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getStreak(): PuzzleStreak {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : {
      currentStreak: 0,
      longestStreak: 0,
      totalCompleted: 0,
      lastCompletedDate: ""
    };
  }

  updateStreak(completed: boolean): PuzzleStreak {
    const streak = this.getStreak();
    const today = new Date().toDateString();
    
    if (completed) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();
      
      if (streak.lastCompletedDate === yesterdayStr || streak.lastCompletedDate === today) {
        // Continue streak or same day
        if (streak.lastCompletedDate !== today) {
          streak.currentStreak++;
        }
      } else if (streak.lastCompletedDate !== today) {
        // New streak
        streak.currentStreak = 1;
      }
      
      streak.totalCompleted++;
      streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
      streak.lastCompletedDate = today;
    } else {
      // Break streak if missed
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (streak.lastCompletedDate !== yesterday.toDateString() && streak.lastCompletedDate !== today) {
        streak.currentStreak = 0;
      }
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(streak));
    return streak;
  }

  private generateRandomPuzzle(): DailyPuzzle {
    const puzzleTypes: DailyPuzzle["type"][] = ["math", "memory", "pattern", "word", "logic"];
    const type = puzzleTypes[Math.floor(Math.random() * puzzleTypes.length)];
    const difficulty = Math.floor(Math.random() * 3) + 1 as 1 | 2 | 3;
    
    return this.generatePuzzleByType(type, difficulty);
  }

  private generatePuzzleByType(type: DailyPuzzle["type"], difficulty: 1 | 2 | 3): DailyPuzzle {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    switch (type) {
      case "math":
        return this.generateMathPuzzle(id, difficulty);
      case "memory":
        return this.generateMemoryPuzzle(id, difficulty);
      case "pattern":
        return this.generatePatternPuzzle(id, difficulty);
      case "word":
        return this.generateWordPuzzle(id, difficulty);
      case "logic":
        return this.generateLogicPuzzle(id, difficulty);
      default:
        return this.generateMathPuzzle(id, difficulty);
    }
  }

  private generateMathPuzzle(id: string, difficulty: 1 | 2 | 3): DailyPuzzle {
    let question: string;
    let correctAnswer: string;
    let options: string[];

    if (difficulty === 1) {
      const a = Math.floor(Math.random() * 20) + 1;
      const b = Math.floor(Math.random() * 20) + 1;
      const result = a + b;
      question = `What is ${a} + ${b}?`;
      correctAnswer = result.toString();
      options = [
        correctAnswer,
        (result + 1).toString(),
        (result - 1).toString(),
        (result + 2).toString()
      ].sort(() => Math.random() - 0.5);
    } else if (difficulty === 2) {
      const a = Math.floor(Math.random() * 15) + 5;
      const b = Math.floor(Math.random() * 15) + 5;
      const result = a * b;
      question = `What is ${a} × ${b}?`;
      correctAnswer = result.toString();
      options = [
        correctAnswer,
        (result + 10).toString(),
        (result - 10).toString(),
        (result + 5).toString()
      ].sort(() => Math.random() - 0.5);
    } else {
      const base = Math.floor(Math.random() * 10) + 2;
      const exponent = Math.floor(Math.random() * 3) + 2;
      const result = Math.pow(base, exponent);
      question = `What is ${base}^${exponent}?`;
      correctAnswer = result.toString();
      options = [
        correctAnswer,
        (result + 8).toString(),
        (result - 8).toString(),
        (result * 2).toString()
      ].sort(() => Math.random() - 0.5);
    }

    return {
      id,
      type: "math",
      question,
      options,
      correctAnswer,
      difficulty,
      points: difficulty * 10
    };
  }

  private generateMemoryPuzzle(id: string, difficulty: 1 | 2 | 3): DailyPuzzle {
    const words = ["apple", "car", "house", "tree", "book", "phone", "clock", "chair", "lamp", "window"];
    const sequenceLength = difficulty + 2;
    const sequence = [];
    
    for (let i = 0; i < sequenceLength; i++) {
      sequence.push(words[Math.floor(Math.random() * words.length)]);
    }
    
    const question = `Memorize this sequence: ${sequence.join(", ")}. What was the ${difficulty === 1 ? "first" : difficulty === 2 ? "third" : "last"} word?`;
    const correctAnswer = difficulty === 1 ? sequence[0] : difficulty === 2 ? sequence[2] : sequence[sequence.length - 1];
    
    const options = [
      correctAnswer,
      ...words.filter(w => w !== correctAnswer).slice(0, 3)
    ].sort(() => Math.random() - 0.5);

    return {
      id,
      type: "memory",
      question,
      options,
      correctAnswer,
      difficulty,
      points: difficulty * 15
    };
  }

  private generatePatternPuzzle(id: string, difficulty: 1 | 2 | 3): DailyPuzzle {
    let sequence: number[];
    let next: number;
    
    if (difficulty === 1) {
      // Simple addition pattern
      const start = Math.floor(Math.random() * 10) + 1;
      const step = Math.floor(Math.random() * 5) + 2;
      sequence = [start, start + step, start + step * 2, start + step * 3];
      next = start + step * 4;
    } else if (difficulty === 2) {
      // Multiplication pattern
      const start = Math.floor(Math.random() * 5) + 2;
      const multiplier = Math.floor(Math.random() * 3) + 2;
      sequence = [start, start * multiplier, start * multiplier * multiplier];
      next = start * Math.pow(multiplier, 3);
    } else {
      // Fibonacci-like pattern
      const a = Math.floor(Math.random() * 5) + 1;
      const b = Math.floor(Math.random() * 5) + 1;
      sequence = [a, b, a + b, a + 2 * b];
      next = 2 * a + 3 * b;
    }
    
    const question = `What comes next in this pattern: ${sequence.join(", ")}, ?`;
    const correctAnswer = next.toString();
    const options = [
      correctAnswer,
      (next + 1).toString(),
      (next - 1).toString(),
      (next * 2).toString()
    ].sort(() => Math.random() - 0.5);

    return {
      id,
      type: "pattern",
      question,
      options,
      correctAnswer,
      difficulty,
      points: difficulty * 20
    };
  }

  private generateWordPuzzle(id: string, difficulty: 1 | 2 | 3): DailyPuzzle {
    const wordSets = {
      1: ["CAT", "DOG", "SUN", "CAR"],
      2: ["HOUSE", "PLANT", "WATER", "MUSIC"],
      3: ["ELEPHANT", "COMPUTER", "BUTTERFLY", "TELESCOPE"]
    };
    
    const word = wordSets[difficulty][Math.floor(Math.random() * wordSets[difficulty].length)];
    const scrambled = word.split("").sort(() => Math.random() - 0.5).join("");
    
    const question = `Unscramble this word: ${scrambled}`;
    const correctAnswer = word;
    
    // Generate similar length words as options
    const allWords = Object.values(wordSets).flat();
    const options = [
      correctAnswer,
      ...allWords.filter(w => w !== correctAnswer && w.length === word.length).slice(0, 3)
    ].sort(() => Math.random() - 0.5);

    return {
      id,
      type: "word",
      question,
      options,
      correctAnswer,
      difficulty,
      points: difficulty * 12
    };
  }

  private generateLogicPuzzle(id: string, difficulty: 1 | 2 | 3): DailyPuzzle {
    const puzzles = {
      1: [
        { q: "If all cats are animals and Fluffy is a cat, what is Fluffy?", a: "Animal" },
        { q: "A red house is made of red bricks. A blue house is made of blue bricks. What is a green house made of?", a: "Glass" }
      ],
      2: [
        { q: "If you have 3 apples and give away 2, then buy 4 more, how many do you have?", a: "5" },
        { q: "What has keys but no locks, space but no room, and you can enter but not go inside?", a: "Keyboard" }
      ],
      3: [
        { q: "A man lives on the 20th floor. Every day he takes the elevator down to ground floor. When he comes home, he takes elevator to 10th floor and walks the rest, except on rainy days. Why?", a: "He's too short to reach the button" },
        { q: "You have 12 balls, 11 weigh the same, 1 is different. Using a balance scale only 3 times, how do you find the different ball?", a: "Divide into groups of 4" }
      ]
    };
    
    const puzzle = puzzles[difficulty][Math.floor(Math.random() * puzzles[difficulty].length)];
    const question = puzzle.q;
    const correctAnswer = puzzle.a;
    
    // For logic puzzles, we'll use text input instead of multiple choice
    return {
      id,
      type: "logic",
      question,
      correctAnswer,
      difficulty,
      points: difficulty * 25
    };
  }
}

export const notificationService = new BrowserNotificationService();