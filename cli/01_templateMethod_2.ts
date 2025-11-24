export {};

// ========================================
// 理想的な知識範囲（クライアントコードが知るべき範囲）
// ========================================
//
// 使う側（クライアントコード）が知っている必要があるのは、次のものだけ：
//
// 1. FinancialReportGenerator抽象クラスについて：
//    - generate(period: string): ReportResultメソッド: レポートを生成する
//    - この1つのメソッドを呼ぶだけで、レポート生成の全プロセスが完了する
//
// 2. 具象クラスについて：
//    - PLReportGenerator, BSReportGenerator, CFReportGeneratorなどの具象クラス
//    - 各具象クラスのインスタンスを作成してgenerate()を呼び出す
//
// 3. ReportResult型について：
//    - reportType: レポートタイプ
//    - period: 期間
//    - data: 財務データの配列
//    - metadata: メタデータ（生成日時、合計値など）
//
// 知らなくてよいもの：
//    - 抽象メソッド（loadData, calculate, validate, format）の存在
//    - フックメソッド（beforeCalculation, afterCalculation）の存在
//    - テンプレートメソッド内の処理順序や詳細
//    - 各具象クラスでの実装の違い
//    - 内部でどのような処理が行われているか

// ========================================
// 財務データの型定義
// ========================================

/**
 * 財務データの型定義
 */
interface FinancialData {
  accountId: string;
  accountName: string;
  value: number;
  period: string;
}

/**
 * レポート生成結果の型定義
 * クライアントコードはこの型を知っていれば、結果を扱える
 */
interface ReportResult {
  reportType: string;
  period: string;
  data: FinancialData[];
  metadata: {
    generatedAt: Date;
    totalValue: number;
  };
}

// ========================================
// Template Methodパターン: 財務レポート生成の抽象クラス
// ========================================

/**
 * 財務レポート生成の抽象クラス（Template Methodパターン）
 *
 * Template Methodパターンの役割：
 * 1. レポート生成の共通フロー（テンプレートメソッド）を定義
 * 2. 各ステップの実装をサブクラスに委譲（抽象メソッド）
 * 3. オプションの処理をフックメソッドで提供
 *
 * クライアントコードはgenerate()メソッドだけを知っていれば、
 * レポート生成を実行できる
 */
abstract class FinancialReportGenerator {
  /**
   * テンプレートメソッド: レポート生成の共通フローを定義
   *
   * このメソッドがレポート生成の全体の流れを制御する。
   * 各ステップの実装は抽象メソッドやフックメソッドでサブクラスに委譲される。
   *
   * クライアントコードはこのメソッドだけを呼べばよい
   *
   * @param period 期間（例: "2024年度"）
   * @returns 生成されたレポートの結果
   */
  generate(period: string): ReportResult {
    console.log(`[${this.getReportType()}] レポート生成を開始します...`);

    // 1. データの読み込み（抽象メソッド - サブクラスで実装）
    const rawData = this.loadData(period);
    console.log(`  ✓ データ読み込み完了 (${rawData.length}件)`);

    // 2. 前処理（フックメソッド - オプションでオーバーライド可能）
    this.beforeCalculation(rawData);

    // 3. 計算処理（抽象メソッド - サブクラスで実装）
    const calculatedData = this.calculate(rawData);
    console.log(`  ✓ 計算処理完了`);

    // 4. 後処理（フックメソッド - オプションでオーバーライド可能）
    this.afterCalculation(calculatedData);

    // 5. 検証（抽象メソッド - サブクラスで実装）
    this.validate(calculatedData);
    console.log(`  ✓ 検証完了`);

    // 6. フォーマット（抽象メソッド - サブクラスで実装）
    const formattedData = this.format(calculatedData);
    console.log(`  ✓ フォーマット完了`);

    // 7. 結果の構築（共通メソッド）
    const totalValue = this.calculateTotal(formattedData);
    const result: ReportResult = {
      reportType: this.getReportType(),
      period,
      data: formattedData,
      metadata: {
        generatedAt: new Date(),
        totalValue,
      },
    };

    console.log(
      `[${this.getReportType()}] レポート生成完了 (合計値: ${totalValue.toLocaleString()})\n`
    );
    return result;
  }

  // ========================================
  // 抽象メソッド: サブクラスで実装必須
  // ========================================

  /**
   * データを読み込む（抽象メソッド）
   * サブクラスで実装される
   * クライアントコードはこのメソッドの存在を知る必要がない
   */
  protected abstract loadData(period: string): FinancialData[];

  /**
   * データを計算する（抽象メソッド）
   * サブクラスで実装される
   * クライアントコードはこのメソッドの存在を知る必要がない
   */
  protected abstract calculate(data: FinancialData[]): FinancialData[];

  /**
   * データを検証する（抽象メソッド）
   * サブクラスで実装される
   * クライアントコードはこのメソッドの存在を知る必要がない
   */
  protected abstract validate(data: FinancialData[]): void;

  /**
   * データをフォーマットする（抽象メソッド）
   * サブクラスで実装される
   * クライアントコードはこのメソッドの存在を知る必要がない
   */
  protected abstract format(data: FinancialData[]): FinancialData[];

  /**
   * レポートタイプを取得する（抽象メソッド）
   * サブクラスで実装される
   */
  protected abstract getReportType(): string;

  // ========================================
  // フックメソッド: サブクラスでオプションでオーバーライド可能
  // ========================================

  /**
   * 計算前の前処理（フックメソッド）
   * サブクラスで必要に応じてオーバーライド可能
   * クライアントコードはこのメソッドの存在を知る必要がない
   */
  protected beforeCalculation(data: FinancialData[]): void {
    // デフォルト実装（何もしない）
  }

  /**
   * 計算後の後処理（フックメソッド）
   * サブクラスで必要に応じてオーバーライド可能
   * クライアントコードはこのメソッドの存在を知る必要がない
   */
  protected afterCalculation(data: FinancialData[]): void {
    // デフォルト実装（何もしない）
  }

  // ========================================
  // 共通メソッド: 全サブクラスで共有
  // ========================================

  /**
   * 合計値を計算する（共通メソッド）
   * 全サブクラスで共有される実装
   */
  protected calculateTotal(data: FinancialData[]): number {
    return data.reduce((sum, item) => sum + item.value, 0);
  }
}

// ========================================
// 具象クラス1: 損益計算書（PL）レポート生成
// ========================================

/**
 * 損益計算書（PL: Profit and Loss Statement）レポート生成クラス
 * クライアントコードはこのクラス名を知っていれば、PLレポートを生成できる
 */
class PLReportGenerator extends FinancialReportGenerator {
  protected getReportType(): string {
    return "PL（損益計算書）";
  }

  protected loadData(period: string): FinancialData[] {
    // 実際のアプリではDBやAPIからデータを取得
    return [
      { accountId: "REV001", accountName: "売上高", value: 1000000, period },
      { accountId: "COST001", accountName: "売上原価", value: -600000, period },
      { accountId: "SG001", accountName: "販管費", value: -200000, period },
      { accountId: "TAX001", accountName: "法人税等", value: -50000, period },
    ];
  }

  protected calculate(data: FinancialData[]): FinancialData[] {
    // PL特有の計算: 売上総利益、営業利益、当期純利益を計算
    const revenue = data.find((d) => d.accountId === "REV001")?.value ?? 0;
    const costOfSales = data.find((d) => d.accountId === "COST001")?.value ?? 0;
    const sgExpenses = data.find((d) => d.accountId === "SG001")?.value ?? 0;
    const taxes = data.find((d) => d.accountId === "TAX001")?.value ?? 0;

    const grossProfit = revenue + costOfSales; // costOfSalesは負の値
    const operatingIncome = grossProfit + sgExpenses; // sgExpensesは負の値
    const netIncome = operatingIncome + taxes; // taxesは負の値

    return [
      ...data,
      {
        accountId: "GP001",
        accountName: "売上総利益",
        value: grossProfit,
        period: data[0].period,
      },
      {
        accountId: "OI001",
        accountName: "営業利益",
        value: operatingIncome,
        period: data[0].period,
      },
      {
        accountId: "NI001",
        accountName: "当期純利益",
        value: netIncome,
        period: data[0].period,
      },
    ];
  }

  protected validate(data: FinancialData[]): void {
    const netIncome = data.find((d) => d.accountId === "NI001");
    if (!netIncome) {
      throw new Error("PLレポート: 当期純利益が計算されていません");
    }
    // PL特有の検証: 売上高が正の値であることを確認
    const revenue = data.find((d) => d.accountId === "REV001");
    if (revenue && revenue.value <= 0) {
      throw new Error("PLレポート: 売上高が0以下です");
    }
  }

  protected format(data: FinancialData[]): FinancialData[] {
    // PL特有のフォーマット: 利益項目を強調表示用にマーク
    return data.map((item) => ({
      ...item,
      accountName:
        item.accountId.startsWith("GP") ||
        item.accountId.startsWith("OI") ||
        item.accountId.startsWith("NI")
          ? `【利益】${item.accountName}`
          : item.accountName,
    }));
  }

  protected beforeCalculation(data: FinancialData[]): void {
    console.log(`  → PL前処理: 前期比較データを読み込み中...`);
  }
}

// ========================================
// 具象クラス2: 貸借対照表（BS）レポート生成
// ========================================

/**
 * 貸借対照表（BS: Balance Sheet）レポート生成クラス
 * クライアントコードはこのクラス名を知っていれば、BSレポートを生成できる
 */
class BSReportGenerator extends FinancialReportGenerator {
  protected getReportType(): string {
    return "BS（貸借対照表）";
  }

  protected loadData(period: string): FinancialData[] {
    return [
      {
        accountId: "ASSET001",
        accountName: "現金及び預金",
        value: 500000,
        period,
      },
      { accountId: "ASSET002", accountName: "売掛金", value: 300000, period },
      {
        accountId: "ASSET003",
        accountName: "有形固定資産",
        value: 2000000,
        period,
      },
      { accountId: "LIAB001", accountName: "買掛金", value: -400000, period },
      { accountId: "LIAB002", accountName: "借入金", value: -1000000, period },
      { accountId: "EQUITY001", accountName: "資本金", value: -800000, period },
      {
        accountId: "EQUITY002",
        accountName: "利益剰余金",
        value: -600000,
        period,
      },
    ];
  }

  protected calculate(data: FinancialData[]): FinancialData[] {
    // BS特有の計算: 資産合計、負債合計、純資産合計を計算
    const assets = data
      .filter((d) => d.accountId.startsWith("ASSET"))
      .reduce((sum, d) => sum + d.value, 0);
    const liabilities = data
      .filter((d) => d.accountId.startsWith("LIAB"))
      .reduce((sum, d) => sum + Math.abs(d.value), 0); // 負債は絶対値で合計
    const equity = data
      .filter((d) => d.accountId.startsWith("EQUITY"))
      .reduce((sum, d) => sum + Math.abs(d.value), 0); // 純資産も絶対値で合計

    return [
      ...data,
      {
        accountId: "TOTAL_ASSET",
        accountName: "資産合計",
        value: assets,
        period: data[0].period,
      },
      {
        accountId: "TOTAL_LIAB",
        accountName: "負債合計",
        value: -liabilities,
        period: data[0].period,
      },
      {
        accountId: "TOTAL_EQUITY",
        accountName: "純資産合計",
        value: -equity,
        period: data[0].period,
      },
    ];
  }

  protected validate(data: FinancialData[]): void {
    // BS特有の検証: 資産 = 負債 + 純資産 のバランスを確認
    const totalAsset = data.find((d) => d.accountId === "TOTAL_ASSET");
    const totalLiab = data.find((d) => d.accountId === "TOTAL_LIAB");
    const totalEquity = data.find((d) => d.accountId === "TOTAL_EQUITY");

    if (!totalAsset || !totalLiab || !totalEquity) {
      throw new Error("BSレポート: 合計項目が計算されていません");
    }

    const balance = totalAsset.value + totalLiab.value + totalEquity.value;
    if (Math.abs(balance) > 0.01) {
      throw new Error(
        `BSレポート: バランスが取れていません (差額: ${balance})`
      );
    }
  }

  protected format(data: FinancialData[]): FinancialData[] {
    // BS特有のフォーマット: 資産/負債/純資産のセクションを明確化
    return data.map((item) => {
      let prefix = "";
      if (item.accountId.startsWith("ASSET")) prefix = "[資産] ";
      else if (item.accountId.startsWith("LIAB")) prefix = "[負債] ";
      else if (item.accountId.startsWith("EQUITY")) prefix = "[純資産] ";
      else if (item.accountId.startsWith("TOTAL")) prefix = "【合計】";

      return {
        ...item,
        accountName: prefix + item.accountName,
      };
    });
  }

  protected afterCalculation(data: FinancialData[]): void {
    console.log(`  → BS後処理: 前期BSとの比較分析を実行中...`);
  }
}

// ========================================
// 具象クラス3: キャッシュフロー計算書（CF）レポート生成
// ========================================

/**
 * キャッシュフロー計算書（CF: Cash Flow Statement）レポート生成クラス
 * クライアントコードはこのクラス名を知っていれば、CFレポートを生成できる
 */
class CFReportGenerator extends FinancialReportGenerator {
  protected getReportType(): string {
    return "CF（キャッシュフロー計算書）";
  }

  protected loadData(period: string): FinancialData[] {
    return [
      {
        accountId: "CFO001",
        accountName: "営業活動によるCF",
        value: 300000,
        period,
      },
      {
        accountId: "CFI001",
        accountName: "投資活動によるCF",
        value: -150000,
        period,
      },
      {
        accountId: "CFF001",
        accountName: "財務活動によるCF",
        value: -100000,
        period,
      },
    ];
  }

  protected calculate(data: FinancialData[]): FinancialData[] {
    // CF特有の計算: キャッシュフロー増減額を計算
    const cfo = data.find((d) => d.accountId === "CFO001")?.value ?? 0;
    const cfi = data.find((d) => d.accountId === "CFI001")?.value ?? 0;
    const cff = data.find((d) => d.accountId === "CFF001")?.value ?? 0;

    const netIncrease = cfo + cfi + cff;
    const beginningCash = 400000; // 期首現金残高（実際は前期BSから取得）
    const endingCash = beginningCash + netIncrease;

    return [
      ...data,
      {
        accountId: "CF_BEGIN",
        accountName: "期首現金残高",
        value: beginningCash,
        period: data[0].period,
      },
      {
        accountId: "CF_NET",
        accountName: "現金及び現金同等物の増減額",
        value: netIncrease,
        period: data[0].period,
      },
      {
        accountId: "CF_END",
        accountName: "期末現金残高",
        value: endingCash,
        period: data[0].period,
      },
    ];
  }

  protected validate(data: FinancialData[]): void {
    // CF特有の検証: 期首残高 + 増減額 = 期末残高 を確認
    const begin = data.find((d) => d.accountId === "CF_BEGIN");
    const net = data.find((d) => d.accountId === "CF_NET");
    const end = data.find((d) => d.accountId === "CF_END");

    if (!begin || !net || !end) {
      throw new Error("CFレポート: 必須項目が計算されていません");
    }

    const calculated = begin.value + net.value;
    if (Math.abs(calculated - end.value) > 0.01) {
      throw new Error(
        `CFレポート: 現金残高の計算が一致しません (計算値: ${calculated}, 期末残高: ${end.value})`
      );
    }
  }

  protected format(data: FinancialData[]): FinancialData[] {
    // CF特有のフォーマット: 活動区分を明確化
    return data.map((item) => {
      let prefix = "";
      if (item.accountId.startsWith("CFO")) prefix = "[営業] ";
      else if (item.accountId.startsWith("CFI")) prefix = "[投資] ";
      else if (item.accountId.startsWith("CFF")) prefix = "[財務] ";
      else if (item.accountId.startsWith("CF_")) prefix = "【残高】";

      return {
        ...item,
        accountName: prefix + item.accountName,
      };
    });
  }
}

// ========================================
// クライアントコード
// ========================================

/**
 * クライアントコードの例
 *
 * この関数は以下のことを知らずに動作する：
 * - 抽象メソッド（loadData, calculate, validate, format）の存在
 * - フックメソッド（beforeCalculation, afterCalculation）の存在
 * - テンプレートメソッド内の処理順序や詳細
 * - 各具象クラスでの実装の違い
 *
 * 知っている必要があるのは：
 * - 具象クラス（PLReportGenerator, BSReportGenerator, CFReportGenerator）
 * - generate(period: string)メソッドの呼び出し方法
 * - ReportResult型の構造
 */
function run() {
  console.log("=== Template Methodパターン: 財務レポート生成の統一化 ===\n");

  const period = "2024年度";

  // 1. PLレポート生成
  console.log("【例1: PLレポート生成】");
  const plGenerator = new PLReportGenerator();
  const plReport = plGenerator.generate(period);
  console.log(
    `PLレポート: ${
      plReport.data.length
    }項目, 合計: ${plReport.metadata.totalValue.toLocaleString()}\n`
  );

  // 2. BSレポート生成
  console.log("【例2: BSレポート生成】");
  const bsGenerator = new BSReportGenerator();
  const bsReport = bsGenerator.generate(period);
  console.log(
    `BSレポート: ${
      bsReport.data.length
    }項目, 合計: ${bsReport.metadata.totalValue.toLocaleString()}\n`
  );

  // 3. CFレポート生成
  console.log("【例3: CFレポート生成】");
  const cfGenerator = new CFReportGenerator();
  const cfReport = cfGenerator.generate(period);
  console.log(
    `CFレポート: ${
      cfReport.data.length
    }項目, 合計: ${cfReport.metadata.totalValue.toLocaleString()}\n`
  );

  // 4. 複数のレポートを一括生成
  console.log("【例4: 複数レポートの一括生成】");
  const generators = [
    new PLReportGenerator(),
    new BSReportGenerator(),
    new CFReportGenerator(),
  ];

  const reports = generators.map((gen) => gen.generate(period));
  reports.forEach((report) => {
    console.log(
      `${report.reportType}: ${
        report.data.length
      }項目, 生成日時: ${report.metadata.generatedAt.toLocaleString()}`
    );
  });

  // ========================================
  // Template Methodパターンの利点の説明
  // ========================================
  console.log("\n=== Template Methodパターンの利点 ===");
  console.log("✓ レポート生成の共通フローを1箇所で定義");
  console.log("✓ 各ステップの実装をサブクラスに委譲できる");
  console.log("✓ 新しいレポートタイプを追加しても、共通フローは変更不要");
  console.log("✓ 処理の順序を保証できる");
  console.log("✓ コードの重複を削減できる");

  // ========================================
  // クライアントが知るべきことのまとめ
  // ========================================
  console.log("\n=== クライアントが知るべきこと ===");
  console.log("✓ FinancialReportGenerator抽象クラスの存在");
  console.log("✓ generate(period: string): ReportResultメソッドの呼び出し方法");
  console.log(
    "✓ 具象クラス（PLReportGenerator, BSReportGenerator, CFReportGenerator）"
  );
  console.log("✓ ReportResult型の構造");
  console.log("\n=== クライアントが知らなくてよいこと ===");
  console.log("✗ 抽象メソッド（loadData, calculate, validate, format）の存在");
  console.log("✗ フックメソッド（beforeCalculation, afterCalculation）の存在");
  console.log("✗ テンプレートメソッド内の処理順序や詳細");
  console.log("✗ 各具象クラスでの実装の違い");
  console.log("✗ 内部でどのような処理が行われているか");
}

run();
