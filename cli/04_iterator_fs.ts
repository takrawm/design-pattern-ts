export {};

// ========================================
// 財務諸表の行データ型定義
// ========================================

/**
 * 財務諸表の1行を表すデータ
 */
interface FinancialStatementRow {
  accountId: string;
  accountName: string;
  value: number;
  level: number; // 階層レベル（0: トップレベル、1: サブ項目など）
  fsType: "PL" | "BS" | "CF";
  isSummary?: boolean; // 集計行かどうか
}

// ========================================
// Iteratorインターフェース
// ========================================

/**
 * Iteratorインターフェース
 * 財務諸表の行を順次処理するための統一インターフェース
 */
interface FinancialStatementIterator {
  /**
   * 次の要素が存在するかどうか
   */
  hasNext(): boolean;

  /**
   * 次の要素を取得
   */
  next(): FinancialStatementRow | null;

  /**
   * 現在の位置をリセット
   */
  reset(): void;

  /**
   * 現在の位置を取得
   */
  getCurrentIndex(): number;
}

// ========================================
// Aggregateインターフェース
// ========================================

/**
 * Aggregateインターフェース
 * Iteratorを生成するためのインターフェース
 */
interface FinancialStatementAggregate {
  // データ構造は実装の内部に隠し、外部には操作のみを公開するため、
  // provate rows: FinancialStatementRow[] = []はインターフェースには含めない
  /**
   * Iteratorを取得
   */
  getIterator(): FinancialStatementIterator;

  /**
   * 行の総数を取得
   */
  getRowCount(): number;

  /**
   * 指定インデックスの行を取得
   */
  getRow(index: number): FinancialStatementRow | null;
}

// ========================================
// 財務諸表クラス（Aggregate実装）
// ========================================

/**
 * 損益計算書（PL: Profit and Loss Statement）
 */
class ProfitAndLossStatement implements FinancialStatementAggregate {
  private rows: FinancialStatementRow[] = [];

  constructor() {
    // PLの標準的な行を初期化
    this.rows = [
      {
        accountId: "REVENUE",
        accountName: "売上高",
        value: 1000000,
        level: 0,
        fsType: "PL",
      },
      {
        accountId: "COST_OF_SALES",
        accountName: "売上原価",
        value: -600000,
        level: 1,
        fsType: "PL",
      },
      {
        accountId: "GROSS_PROFIT",
        accountName: "売上総利益",
        value: 400000,
        level: 0,
        fsType: "PL",
        isSummary: true,
      },
      {
        accountId: "SG_EXPENSES",
        accountName: "販管費",
        value: -200000,
        level: 1,
        fsType: "PL",
      },
      {
        accountId: "OPERATING_INCOME",
        accountName: "営業利益",
        value: 200000,
        level: 0,
        fsType: "PL",
        isSummary: true,
      },
      {
        accountId: "TAXES",
        accountName: "法人税等",
        value: -50000,
        level: 1,
        fsType: "PL",
      },
      {
        accountId: "NET_INCOME",
        accountName: "当期純利益",
        value: 150000,
        level: 0,
        fsType: "PL",
        isSummary: true,
      },
    ];
  }

  getIterator(): FinancialStatementIterator {
    return new ProfitAndLossIterator(this);
  }

  getRowCount(): number {
    return this.rows.length;
  }

  getRow(index: number): FinancialStatementRow | null {
    if (index < 0 || index >= this.rows.length) {
      return null;
    }
    return this.rows[index];
  }

  /**
   * 行を追加（動的に行を追加する場合）
   */
  addRow(row: FinancialStatementRow): void {
    this.rows.push(row);
  }
}

/**
 * 貸借対照表（BS: Balance Sheet）
 */
class BalanceSheet implements FinancialStatementAggregate {
  private rows: FinancialStatementRow[] = [];

  constructor() {
    // BSの標準的な行を初期化
    this.rows = [
      // 資産の部
      {
        accountId: "CURRENT_ASSETS",
        accountName: "流動資産",
        value: 800000,
        level: 0,
        fsType: "BS",
        isSummary: true,
      },
      {
        accountId: "CASH",
        accountName: "現金及び預金",
        value: 500000,
        level: 1,
        fsType: "BS",
      },
      {
        accountId: "AR",
        accountName: "売掛金",
        value: 300000,
        level: 1,
        fsType: "BS",
      },
      {
        accountId: "NON_CURRENT_ASSETS",
        accountName: "固定資産",
        value: 2000000,
        level: 0,
        fsType: "BS",
        isSummary: true,
      },
      {
        accountId: "PPE",
        accountName: "有形固定資産",
        value: 2000000,
        level: 1,
        fsType: "BS",
      },
      {
        accountId: "TOTAL_ASSETS",
        accountName: "資産合計",
        value: 2800000,
        level: 0,
        fsType: "BS",
        isSummary: true,
      },

      // 負債の部
      {
        accountId: "CURRENT_LIABILITIES",
        accountName: "流動負債",
        value: -400000,
        level: 0,
        fsType: "BS",
        isSummary: true,
      },
      {
        accountId: "AP",
        accountName: "買掛金",
        value: -400000,
        level: 1,
        fsType: "BS",
      },
      {
        accountId: "NON_CURRENT_LIABILITIES",
        accountName: "固定負債",
        value: -1000000,
        level: 0,
        fsType: "BS",
        isSummary: true,
      },
      {
        accountId: "LONG_TERM_DEBT",
        accountName: "長期借入金",
        value: -1000000,
        level: 1,
        fsType: "BS",
      },
      {
        accountId: "TOTAL_LIABILITIES",
        accountName: "負債合計",
        value: -1400000,
        level: 0,
        fsType: "BS",
        isSummary: true,
      },

      // 純資産の部
      {
        accountId: "SHARE_CAPITAL",
        accountName: "資本金",
        value: -800000,
        level: 0,
        fsType: "BS",
      },
      {
        accountId: "RETAINED_EARNINGS",
        accountName: "利益剰余金",
        value: -600000,
        level: 0,
        fsType: "BS",
      },
      {
        accountId: "TOTAL_EQUITY",
        accountName: "純資産合計",
        value: -1400000,
        level: 0,
        fsType: "BS",
        isSummary: true,
      },
    ];
  }

  getIterator(): FinancialStatementIterator {
    return new BalanceSheetIterator(this);
  }

  getRowCount(): number {
    return this.rows.length;
  }

  getRow(index: number): FinancialStatementRow | null {
    if (index < 0 || index >= this.rows.length) {
      return null;
    }
    return this.rows[index];
  }

  addRow(row: FinancialStatementRow): void {
    this.rows.push(row);
  }
}

/**
 * キャッシュフロー計算書（CF: Cash Flow Statement）
 */
class CashFlowStatement implements FinancialStatementAggregate {
  private rows: FinancialStatementRow[] = [];

  constructor() {
    // CFの標準的な行を初期化
    this.rows = [
      {
        accountId: "CFO",
        accountName: "営業活動によるCF",
        value: 300000,
        level: 0,
        fsType: "CF",
      },
      {
        accountId: "CFI",
        accountName: "投資活動によるCF",
        value: -150000,
        level: 0,
        fsType: "CF",
      },
      {
        accountId: "CFF",
        accountName: "財務活動によるCF",
        value: -100000,
        level: 0,
        fsType: "CF",
      },
      {
        accountId: "NET_CASH_FLOW",
        accountName: "現金及び現金同等物の増減額",
        value: 50000,
        level: 0,
        fsType: "CF",
        isSummary: true,
      },
      {
        accountId: "CASH_BEGINNING",
        accountName: "期首現金残高",
        value: 400000,
        level: 0,
        fsType: "CF",
      },
      {
        accountId: "CASH_ENDING",
        accountName: "期末現金残高",
        value: 450000,
        level: 0,
        fsType: "CF",
        isSummary: true,
      },
    ];
  }

  getIterator(): FinancialStatementIterator {
    return new CashFlowIterator(this);
  }

  getRowCount(): number {
    return this.rows.length;
  }

  getRow(index: number): FinancialStatementRow | null {
    if (index < 0 || index >= this.rows.length) {
      return null;
    }
    return this.rows[index];
  }

  addRow(row: FinancialStatementRow): void {
    this.rows.push(row);
  }
}

// ========================================
// Iterator実装
// ========================================

/**
 * 損益計算書用Iterator
 */
class ProfitAndLossIterator implements FinancialStatementIterator {
  private position: number = 0;

  constructor(private aggregate: ProfitAndLossStatement) {}

  hasNext(): boolean {
    return this.position < this.aggregate.getRowCount();
  }

  next(): FinancialStatementRow | null {
    if (!this.hasNext()) {
      return null;
    }
    const row = this.aggregate.getRow(this.position);
    this.position++;
    return row;
  }

  reset(): void {
    this.position = 0;
  }

  getCurrentIndex(): number {
    return this.position;
  }
}

/**
 * 貸借対照表用Iterator
 */
class BalanceSheetIterator implements FinancialStatementIterator {
  private position: number = 0;

  constructor(private aggregate: BalanceSheet) {}

  hasNext(): boolean {
    return this.position < this.aggregate.getRowCount();
  }

  next(): FinancialStatementRow | null {
    if (!this.hasNext()) {
      return null;
    }
    const row = this.aggregate.getRow(this.position);
    this.position++;
    return row;
  }

  reset(): void {
    this.position = 0;
  }

  getCurrentIndex(): number {
    return this.position;
  }
}

/**
 * キャッシュフロー計算書用Iterator
 */
class CashFlowIterator implements FinancialStatementIterator {
  private position: number = 0;

  constructor(private aggregate: CashFlowStatement) {}

  hasNext(): boolean {
    return this.position < this.aggregate.getRowCount();
  }

  next(): FinancialStatementRow | null {
    if (!this.hasNext()) {
      return null;
    }
    const row = this.aggregate.getRow(this.position);
    this.position++;
    return row;
  }

  reset(): void {
    this.position = 0;
  }

  getCurrentIndex(): number {
    return this.position;
  }
}

// ========================================
// 使用例: 財務諸表処理クラス
// ========================================

/**
 * 財務諸表を処理するクラス
 * Iteratorパターンにより、財務諸表の種類に関わらず統一的なインターフェースで処理できる
 */
class FinancialStatementProcessor {
  /**
   * 財務諸表の全行を表示
   */
  displayAllRows(aggregate: FinancialStatementAggregate, title: string): void {
    console.log(`\n=== ${title} ===`);
    const iterator = aggregate.getIterator();

    while (iterator.hasNext()) {
      const row = iterator.next();
      if (row) {
        const indent = Array(row.level + 1).join("  ");
        const summaryMark = row.isSummary ? "【集計】" : "";
        const valueStr =
          row.value >= 0
            ? row.value.toLocaleString()
            : `(${Math.abs(row.value).toLocaleString()})`;
        console.log(`${indent}${summaryMark}${row.accountName}: ${valueStr}`);
      }
    }
  }

  /**
   * 財務諸表の集計行のみを表示
   */
  displaySummaryRows(
    aggregate: FinancialStatementAggregate,
    title: string
  ): void {
    console.log(`\n=== ${title}（集計行のみ）===`);
    const iterator = aggregate.getIterator();

    while (iterator.hasNext()) {
      const row = iterator.next();
      if (row && row.isSummary) {
        const valueStr =
          row.value >= 0
            ? row.value.toLocaleString()
            : `(${Math.abs(row.value).toLocaleString()})`;
        console.log(`  ${row.accountName}: ${valueStr}`);
      }
    }
  }

  /**
   * 財務諸表の合計値を計算
   */
  calculateTotal(aggregate: FinancialStatementAggregate): number {
    const iterator = aggregate.getIterator();
    let total = 0;

    while (iterator.hasNext()) {
      const row = iterator.next();
      if (row) {
        total += row.value;
      }
    }

    return total;
  }

  /**
   * 指定した階層レベルの行のみを表示
   */
  displayRowsByLevel(
    aggregate: FinancialStatementAggregate,
    level: number,
    title: string
  ): void {
    console.log(`\n=== ${title}（レベル${level}のみ）===`);
    const iterator = aggregate.getIterator();

    while (iterator.hasNext()) {
      const row = iterator.next();
      if (row && row.level === level) {
        const valueStr =
          row.value >= 0
            ? row.value.toLocaleString()
            : `(${Math.abs(row.value).toLocaleString()})`;
        console.log(`  ${row.accountName}: ${valueStr}`);
      }
    }
  }
}

// ========================================
// 実行例
// ========================================

function run() {
  console.log("=== Iteratorパターン: 財務諸表の行処理の統一化 ===\n");

  const processor = new FinancialStatementProcessor();

  // 1. 損益計算書の処理
  const plStatement = new ProfitAndLossStatement();
  processor.displayAllRows(plStatement, "損益計算書（PL）");
  processor.displaySummaryRows(plStatement, "損益計算書");

  // 2. 貸借対照表の処理
  const bsStatement = new BalanceSheet();
  processor.displayAllRows(bsStatement, "貸借対照表（BS）");
  processor.displayRowsByLevel(bsStatement, 0, "貸借対照表");

  // 3. キャッシュフロー計算書の処理
  const cfStatement = new CashFlowStatement();
  processor.displayAllRows(cfStatement, "キャッシュフロー計算書（CF）");

  // 4. Iteratorパターンの利点の説明
  console.log("\n=== Iteratorパターンの利点 ===");
  console.log("✓ 財務諸表の種類に関わらず統一的なインターフェースで処理可能");
  console.log("✓ 内部実装（配列、リンクリストなど）を隠蔽できる");
  console.log("✓ 複数の走査方法（全行、集計行のみ、階層別など）を提供可能");
  console.log("✓ 財務諸表の種類が追加されても、既存コードの変更が不要");

  // 5. 複数の財務諸表を同じ方法で処理できる例
  console.log("\n=== 複数財務諸表の一括処理 ===");
  const statements: Array<{
    aggregate: FinancialStatementAggregate;
    title: string;
  }> = [
    { aggregate: plStatement, title: "PL" },
    { aggregate: bsStatement, title: "BS" },
    { aggregate: cfStatement, title: "CF" },
  ];

  statements.forEach(({ aggregate, title }) => {
    const total = processor.calculateTotal(aggregate);
    console.log(`${title}の合計値: ${total.toLocaleString()}`);
  });
}

run();
