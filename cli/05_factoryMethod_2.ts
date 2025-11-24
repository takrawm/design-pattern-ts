export {};

// ========================================
// 理想的な知識範囲（クライアントコードが知るべき範囲）
// ========================================
//
// 使う側（クライアントコード）が知っている必要があるのは、次のものだけ：
//
// 1. CreditCardFactory抽象クラスについて：
//    - create(owner: string): CreditCardメソッド: クレジットカードを作成する
//    - PlatinumCreditCardFactoryやGoldCreditCardFactoryという具体的なクラス名は知らなくてもよい
//
// 2. CreditCard抽象クラスについて：
//    - getOwner(): string: 所有者を取得する
//    - getCardType(): string: カードタイプを取得する
//    - getAnnualCharge(): number: 年間手数料を取得する
//    - PlatinumやGoldという具体的なクラス名は知らなくてもよい
//
// 3. ファクトリ関数について：
//    - createPlatinumFactory(): CreditCardFactory型のインスタンスを生成する関数
//    - createGoldFactory(): CreditCardFactory型のインスタンスを生成する関数
//    - 具象クラスの生成を隠蔽する役割
//
// 知らなくてよいもの：
//    - PlatinumCreditCardFactory, GoldCreditCardFactoryという具象クラス名
//    - Platinum, Goldという具象クラス名
//    - creditCardDatabaseというグローバル変数（実装の詳細）

// ========================================
// 抽象クラス: クレジットカード
// ========================================

/**
 * クレジットカードの抽象クラス
 * クライアントコードはこの抽象クラスを通じてクレジットカードを操作する
 */
abstract class CreditCard {
  constructor(public owner: string) {}

  /**
   * 所有者を取得
   */
  getOwner(): string {
    return this.owner;
  }

  /**
   * カードタイプを取得（抽象メソッド）
   */
  abstract getCardType(): string;

  /**
   * 年間手数料を取得（抽象メソッド）
   */
  abstract getAnnualCharge(): number;
}

// ========================================
// 具象クラス: クレジットカードの実装
// ========================================

/**
 * プラチナカードの実装
 * クライアントコードはこのクラス名を知る必要がない
 */
class Platinum extends CreditCard {
  getCardType(): string {
    return "Platinum";
  }

  getAnnualCharge(): number {
    return 30000;
  }
}

/**
 * ゴールドカードの実装
 * クライアントコードはこのクラス名を知る必要がない
 */
class Gold extends CreditCard {
  getCardType(): string {
    return "Gold";
  }

  getAnnualCharge(): number {
    return 10000;
  }
}

// ========================================
// 抽象クラス: クレジットカードファクトリ
// ========================================

/**
 * クレジットカードファクトリの抽象クラス
 * クライアントコードはこの抽象クラスを通じてファクトリを操作する
 */
abstract class CreditCardFactory {
  /**
   * クレジットカードを作成する（抽象メソッド）
   * サブクラスで実装される
   */
  abstract createCreditCard(owner: string): CreditCard;

  /**
   * クレジットカードを登録する（抽象メソッド）
   * サブクラスで実装される
   */
  abstract registerCreditCard(creditCard: CreditCard): void;

  /**
   * クレジットカードを作成して登録する（テンプレートメソッド）
   * クライアントコードはこのメソッドを使用する
   */
  create(owner: string): CreditCard {
    const creditCard = this.createCreditCard(owner);
    this.registerCreditCard(creditCard);
    return creditCard;
  }
}

// ========================================
// データベース（実装の詳細）
// ========================================

/**
 * クレジットカードデータベース
 * クライアントコードはこの存在を知る必要がない（実装の詳細）
 */
const creditCardDatabase: CreditCard[] = [];

// ========================================
// 具象クラス: ファクトリの実装
// ========================================

/**
 * プラチナカードファクトリの実装
 * クライアントコードはこのクラス名を知る必要がない
 */
class PlatinumCreditCardFactory extends CreditCardFactory {
  createCreditCard(owner: string): CreditCard {
    return new Platinum(owner);
  }

  registerCreditCard(creditCard: CreditCard): void {
    creditCardDatabase.push(creditCard);
  }
}

/**
 * ゴールドカードファクトリの実装
 * クライアントコードはこのクラス名を知る必要がない
 */
class GoldCreditCardFactory extends CreditCardFactory {
  createCreditCard(owner: string): CreditCard {
    return new Gold(owner);
  }

  registerCreditCard(creditCard: CreditCard): void {
    creditCardDatabase.push(creditCard);
  }
}

// ========================================
// ファクトリ関数: 具象クラスの生成を隠蔽
// ========================================

/**
 * プラチナカードファクトリを生成するファクトリ関数
 * クライアントコードはこの関数を使用してファクトリを取得する
 * 具象クラス名（PlatinumCreditCardFactory）を知る必要がない
 */
function createPlatinumFactory(): CreditCardFactory {
  return new PlatinumCreditCardFactory();
}

/**
 * ゴールドカードファクトリを生成するファクトリ関数
 * クライアントコードはこの関数を使用してファクトリを取得する
 * 具象クラス名（GoldCreditCardFactory）を知る必要がない
 */
function createGoldFactory(): CreditCardFactory {
  return new GoldCreditCardFactory();
}

// ========================================
// クライアントコード
// ========================================

/**
 * クライアントコードの例
 * この関数は具象クラス名（PlatinumCreditCardFactory, GoldCreditCardFactory,
 * Platinum, Gold）を知らずに動作する
 */
function run() {
  // 具象クラスではなく、抽象クラス型で宣言
  // ファクトリ関数を使用することで、具象クラス名を知る必要がない
  const platinumFactory: CreditCardFactory = createPlatinumFactory();
  const platinumCard: CreditCard = platinumFactory.create("Tanaka");

  console.log("=== プラチナカード ===");
  console.log(`所有者: ${platinumCard.getOwner()}`);
  console.log(`カードタイプ: ${platinumCard.getCardType()}`);
  console.log(
    `年間手数料: ${platinumCard.getAnnualCharge().toLocaleString()}円`
  );

  const goldFactory: CreditCardFactory = createGoldFactory();
  const goldCard: CreditCard = goldFactory.create("Suzuki");

  console.log("\n=== ゴールドカード ===");
  console.log(`所有者: ${goldCard.getOwner()}`);
  console.log(`カードタイプ: ${goldCard.getCardType()}`);
  console.log(`年間手数料: ${goldCard.getAnnualCharge().toLocaleString()}円`);

  // データベースへのアクセスも実装の詳細として隠蔽されている
  // クライアントコードはcreditCardDatabaseの存在を知る必要がない
  console.log(`\n登録済みカード数: ${creditCardDatabase.length}件`);
}

run();
