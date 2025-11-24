export {};

// ========================================
// 理想的な知識範囲（クライアントコードが知るべき範囲）
// ========================================
//
// 使う側（クライアントコード）が知っている必要があるのは、次のものだけ：
//
// 1. OrderFacadeクラスについて：
//    - placeOrder(name: string): voidメソッド: 注文を処理する
//    - この1つのメソッドを呼ぶだけで、注文処理全体が完了する
//
// 知らなくてよいもの：
//    - Product, Payment, Invoiceというサブシステムクラスの存在
//    - 各サブシステムクラスのメソッド名や実装詳細
//    - 処理の順序（商品取得 → 支払い → 請求書送信）
//    - サブシステム間の依存関係
//    - エラーハンドリングの詳細
//    - 内部でどのクラスが使われているか

// ========================================
// サブシステムクラス（クライアントは知る必要がない）
// ========================================

/**
 * 商品管理クラス
 * クライアントコードはこのクラス名を知る必要がない（実装の詳細）
 */
class Product {
  /**
   * 商品を取得する
   */
  getProduct(name: string): void {
    console.log(`  [Product] ${name}を取得しました。`);
  }

  /**
   * 在庫を確認する（内部メソッド）
   */
  checkStock(name: string): boolean {
    console.log(`  [Product] ${name}の在庫を確認中...`);
    return true; // サンプル実装
  }
}

/**
 * 支払い処理クラス
 * クライアントコードはこのクラス名を知る必要がない（実装の詳細）
 */
class Payment {
  /**
   * 支払いを実行する
   */
  makePayment(name: string): void {
    console.log(`  [Payment] ${name}の支払いが完了しました。`);
  }

  /**
   * 支払い方法を検証する（内部メソッド）
   */
  validatePaymentMethod(): boolean {
    console.log(`  [Payment] 支払い方法を検証中...`);
    return true; // サンプル実装
  }
}

/**
 * 請求書送信クラス
 * クライアントコードはこのクラス名を知る必要がない（実装の詳細）
 */
class Invoice {
  /**
   * 請求書を送信する
   */
  sendInvoice(name: string): void {
    console.log(`  [Invoice] ${name}の請求書が送られました。`);
  }

  /**
   * 請求書を生成する（内部メソッド）
   */
  generateInvoice(name: string): string {
    console.log(`  [Invoice] ${name}の請求書を生成中...`);
    return `請求書_${name}`; // サンプル実装
  }
}

// ========================================
// Facadeクラス（クライアントはこれだけを知ればよい）
// ========================================

/**
 * 注文処理のFacadeクラス
 *
 * Facadeパターンの役割：
 * 1. 複雑なサブシステム（Product, Payment, Invoice）を
 *    単一の統一インターフェースで提供する
 * 2. クライアントコードをサブシステムの複雑さから保護する
 * 3. サブシステム間の依存関係や処理順序を管理する
 *
 * クライアントコードはこのクラスだけを知っていれば、
 * 注文処理を実行できる
 */
class OrderFacade {
  private product: Product;
  private payment: Payment;
  private invoice: Invoice;

  constructor() {
    // サブシステムのインスタンスを内部で管理
    // クライアントはこれらの存在を知る必要がない
    this.product = new Product();
    this.payment = new Payment();
    this.invoice = new Invoice();
  }

  /**
   * 注文を処理する（Facadeメソッド）
   *
   * この1つのメソッドで、以下の複雑な処理を実行：
   * 1. 商品の在庫確認と取得
   * 2. 支払い方法の検証と支払い実行
   * 3. 請求書の生成と送信
   *
   * クライアントコードはこのメソッドだけを呼べばよい
   *
   * @param name 商品名
   * @throws Error 注文処理に失敗した場合
   */
  placeOrder(name: string): void {
    console.log(`\n=== 注文処理開始: ${name} ===`);

    try {
      // 1. 商品の在庫確認と取得
      if (!this.product.checkStock(name)) {
        throw new Error(`${name}の在庫がありません`);
      }
      this.product.getProduct(name);

      // 2. 支払い方法の検証と支払い実行
      if (!this.payment.validatePaymentMethod()) {
        throw new Error("支払い方法が無効です");
      }
      this.payment.makePayment(name);

      // 3. 請求書の生成と送信
      const invoiceId = this.invoice.generateInvoice(name);
      this.invoice.sendInvoice(name);

      console.log(`=== 注文処理完了: ${name} ===`);
      console.log(`  請求書ID: ${invoiceId}\n`);
    } catch (error) {
      console.error(`=== 注文処理エラー: ${name} ===`);
      console.error(
        `  エラー: ${error instanceof Error ? error.message : String(error)}\n`
      );
      throw error;
    }
  }

  /**
   * 注文の状態を確認する（追加のFacadeメソッド例）
   * クライアントは必要に応じてこのメソッドも使用できる
   */
  checkOrderStatus(name: string): string {
    // サブシステムの複雑な処理を隠蔽
    const hasStock = this.product.checkStock(name);
    const paymentValid = this.payment.validatePaymentMethod();

    if (hasStock && paymentValid) {
      return "注文可能";
    } else {
      return "注文不可";
    }
  }
}

// ========================================
// クライアントコード
// ========================================

/**
 * クライアントコードの例
 *
 * この関数は以下のことを知らずに動作する：
 * - Product, Payment, Invoiceというサブシステムクラスの存在
 * - 各サブシステムクラスのメソッド名
 * - 処理の順序や依存関係
 * - エラーハンドリングの詳細
 *
 * OrderFacadeクラスとplaceOrder()メソッドだけを知っていれば十分
 */
function run() {
  console.log("=== Facadeパターン: 注文処理の簡素化 ===\n");

  // Facadeクラスのインスタンスを作成
  // クライアントはOrderFacadeだけを知っていればよい
  const orderFacade = new OrderFacade();

  // 1. 基本的な注文処理
  console.log("【例1: 基本的な注文処理】");
  orderFacade.placeOrder("デザインパターン本");

  // 2. 複数の注文処理
  console.log("【例2: 複数の注文処理】");
  const items = ["TypeScript入門", "React実践ガイド", "Node.js完全攻略"];
  items.forEach((item) => {
    try {
      orderFacade.placeOrder(item);
    } catch (error) {
      // エラーハンドリングもFacadeが管理
      console.error(`注文失敗: ${item}`);
    }
  });

  // 3. 注文状態の確認（追加のFacadeメソッドの使用例）
  console.log("【例3: 注文状態の確認】");
  const status = orderFacade.checkOrderStatus("新商品");
  console.log(`新商品の注文状態: ${status}\n`);

  // ========================================
  // Facadeパターンの利点の説明
  // ========================================
  console.log("=== Facadeパターンの利点 ===");
  console.log("✓ 複雑なサブシステムを単一のインターフェースで提供");
  console.log("✓ クライアントコードがシンプルになる");
  console.log("✓ サブシステムの変更がクライアントに影響しない");
  console.log("✓ 処理の順序や依存関係をFacade内で管理");
  console.log("✓ エラーハンドリングを一元化できる");
  console.log("✓ サブシステムの実装詳細を隠蔽できる");

  // ========================================
  // クライアントが知るべきことのまとめ
  // ========================================
  console.log("\n=== クライアントが知るべきこと ===");
  console.log("✓ OrderFacadeクラスの存在");
  console.log("✓ placeOrder(name: string)メソッドの呼び出し方法");
  console.log("✓ 注文処理が完了するという結果");
  console.log("\n=== クライアントが知らなくてよいこと ===");
  console.log("✗ Product, Payment, Invoiceクラスの存在");
  console.log("✗ 各サブシステムクラスのメソッド名");
  console.log("✗ 処理の順序（商品取得 → 支払い → 請求書送信）");
  console.log("✗ サブシステム間の依存関係");
  console.log("✗ エラーハンドリングの詳細");
  console.log("✗ 内部でどのクラスが使われているか");
}

run();
