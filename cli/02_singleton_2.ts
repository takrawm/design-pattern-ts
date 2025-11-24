export {};

// ========================================
// 理想的な知識範囲（クライアントコードが知るべき範囲）
// ========================================
//
// 使う側（クライアントコード）が知っている必要があるのは、次のものだけ：
//
// 1. Loggerクラスについて：
//    - getInstance(): Loggerメソッド: Loggerインスタンスを取得する
//    - output(content: string): voidメソッド: ログを出力する
//    - この2つのメソッドだけを知っていれば、ログ機能を使用できる
//
// 知らなくてよいもの：
//    - private static instance: Loggerという内部実装
//    - private constructor()というコンストラクタの存在
//    - シングルトンパターンの実装詳細
//    - インスタンスが1つだけ存在するという仕組み
//    - インスタンスの生成タイミング

// ========================================
// Singletonパターン: Loggerクラス
// ========================================

/**
 * Loggerクラス（Singletonパターン）
 *
 * Singletonパターンの役割：
 * 1. アプリケーション全体で1つのインスタンスのみを保証
 * 2. グローバルアクセスポイントを提供
 * 3. インスタンス生成の制御をクラス自身が行う
 *
 * クライアントコードはgetInstance()でインスタンスを取得し、
 * output()メソッドでログを出力できる
 */
class Logger {
  // クラスレベルで保持される唯一のインスタンス
  // クライアントコードはこの存在を知る必要がない（実装の詳細）
  private static instance: Logger;

  /**
   * プライベートコンストラクタ
   * 外部からの直接インスタンス化を防止
   * クライアントコードはこの存在を知る必要がない
   */
  private constructor() {
    console.log("Logger: インスタンスを作成しました（初回のみ）");
  }

  /**
   * シングルトンインスタンスを取得する
   *
   * このメソッドが呼ばれるたびに、同じインスタンスを返す。
   * 初回呼び出し時にのみインスタンスを作成し、以降は既存のインスタンスを返す。
   *
   * クライアントコードはこのメソッドを使用してLoggerインスタンスを取得する
   *
   * @returns Loggerの唯一のインスタンス
   */
  static getInstance(): Logger {
    // インスタンスが存在しない場合のみ作成
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * ログを出力する
   *
   * クライアントコードはこのメソッドを使用してログを出力する
   *
   * @param content ログの内容
   */
  output(content: string): void {
    const now = new Date();
    console.log(`${now.toLocaleString("ja-JP")}: ${content}`);
  }

  /**
   * ログの出力回数を取得する（追加機能の例）
   * シングルトンであるため、全箇所でのログ出力回数を追跡できる
   */
  private logCount: number = 0;

  /**
   * ログを出力し、カウントを増やす
   */
  logWithCount(content: string): void {
    this.logCount++;
    this.output(`[${this.logCount}] ${content}`);
  }

  /**
   * ログ出力回数を取得
   */
  getLogCount(): number {
    return this.logCount;
  }
}

// ========================================
// 比較用: 通常のクラス（複数のインスタンスが作成される）
// ========================================

/**
 * 通常のクラス（比較用）
 * このクラスは複数のインスタンスを作成できる
 */
class RegularClass {
  constructor() {
    console.log("RegularClass: 新しいインスタンスを作成しました");
  }

  doSomething(): void {
    console.log("RegularClass: 何か処理を実行");
  }
}

// ========================================
// クライアントコード
// ========================================

/**
 * クライアントコードの例
 *
 * この関数は以下のことを知らずに動作する：
 * - private static instance: Loggerという内部実装
 * - private constructor()というコンストラクタの存在
 * - シングルトンパターンの実装詳細
 * - インスタンスが1つだけ存在するという仕組み
 *
 * 知っている必要があるのは：
 * - Logger.getInstance()でインスタンスを取得する方法
 * - output(content: string)メソッドでログを出力する方法
 */
function run() {
  console.log("=== Singletonパターン: Loggerの動作確認 ===\n");

  // ========================================
  // 1. 通常のクラスとの比較
  // ========================================
  console.log("【例1: 通常のクラス（複数のインスタンスが作成される）】");
  const regular1 = new RegularClass();
  const regular2 = new RegularClass();
  console.log(`RegularClassのインスタンス同一性: ${regular1 === regular2}`);
  console.log("→ 異なるインスタンスが作成される\n");

  // ========================================
  // 2. Singletonパターンの動作確認
  // ========================================
  console.log("【例2: Singletonパターン（1つのインスタンスのみ）】");
  const logger1 = Logger.getInstance();
  const logger2 = Logger.getInstance();
  const logger3 = Logger.getInstance();

  console.log(`Loggerのインスタンス同一性 (logger1 === logger2): ${logger1 === logger2}`);
  console.log(`Loggerのインスタンス同一性 (logger2 === logger3): ${logger2 === logger3}`);
  console.log("→ すべて同じインスタンスを参照している\n");

  // ========================================
  // 3. ログ出力の使用例
  // ========================================
  console.log("【例3: ログ出力の使用例】");
  logger1.output("logger1からログを出力");
  logger2.output("logger2からログを出力");
  logger3.output("logger3からログを出力");
  console.log("→ すべて同じインスタンスから出力されている\n");

  // ========================================
  // 4. シングルトンの利点: 状態の共有
  // ========================================
  console.log("【例4: シングルトンの利点（状態の共有）】");
  logger1.logWithCount("最初のログ");
  logger2.logWithCount("2番目のログ");
  logger3.logWithCount("3番目のログ");
  console.log(`全ログ出力回数: ${logger1.getLogCount()}回`);
  console.log("→ どの参照からでも同じ状態にアクセスできる\n");

  // ========================================
  // 5. 異なるスコープからのアクセス
  // ========================================
  console.log("【例5: 異なるスコープからのアクセス】");
  function functionA() {
    const logger = Logger.getInstance();
    logger.output("関数Aからログ出力");
  }

  function functionB() {
    const logger = Logger.getInstance();
    logger.output("関数Bからログ出力");
  }

  functionA();
  functionB();
  console.log("→ 異なる関数からでも同じインスタンスにアクセスできる\n");

  // ========================================
  // Singletonパターンの利点の説明
  // ========================================
  console.log("=== Singletonパターンの利点 ===");
  console.log("✓ アプリケーション全体で1つのインスタンスのみを保証");
  console.log("✓ グローバルアクセスポイントを提供");
  console.log("✓ メモリ効率: インスタンスを1つだけ作成");
  console.log("✓ 状態の共有: 全箇所で同じ状態にアクセス可能");
  console.log("✓ 初期化の制御: 必要になったタイミングで初期化可能");

  // ========================================
  // クライアントが知るべきことのまとめ
  // ========================================
  console.log("\n=== クライアントが知るべきこと ===");
  console.log("✓ Logger.getInstance()でインスタンスを取得する方法");
  console.log("✓ output(content: string)メソッドでログを出力する方法");
  console.log("✓ 追加のメソッド（logWithCount, getLogCount）の使用方法");
  console.log("\n=== クライアントが知らなくてよいこと ===");
  console.log("✗ private static instance: Loggerという内部実装");
  console.log("✗ private constructor()というコンストラクタの存在");
  console.log("✗ シングルトンパターンの実装詳細");
  console.log("✗ インスタンスが1つだけ存在するという仕組み");
  console.log("✗ インスタンスの生成タイミング");
}

run();

