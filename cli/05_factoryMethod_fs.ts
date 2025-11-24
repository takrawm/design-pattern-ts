export {};

// ========================================
// 理想的な知識範囲（クライアントコードが知るべき範囲）
// ========================================
//
// 使う側（クライアントコード）が知っている必要があるのは、次のものだけ：
//
// 1. FinancialReportFactory抽象クラスについて：
//    - createReport(data: FinancialData): FinancialReportメソッド: レポートを作成する
//    - PDFReportFactoryやExcelReportFactoryという具体的なクラス名は知らなくてもよい
//
// 2. FinancialReport抽象クラスについて：
//    - generate(): void: レポートを生成する
//    - export(path: string): void: レポートをエクスポートする
//    - getReportType(): string: レポートタイプを取得する
//    - PDFReportやExcelReportという具体的なクラス名は知らなくてもよい
//
// 3. ファクトリ関数について：
//    - createPDFReportFactory(): FinancialReportFactory型のインスタンスを生成する関数
//    - createExcelReportFactory(): FinancialReportFactory型のインスタンスを生成する関数
//    - 具象クラスの生成を隠蔽する役割
//
// 知らなくてよいもの：
//    - PDFReportFactory, ExcelReportFactoryという具象クラス名
//    - PDFReport, ExcelReportという具象クラス名
//    - reportRegistryというグローバル変数（実装の詳細）

// ========================================
// 財務データ型定義
// ========================================

/**
 * 財務データの型定義
 */
interface FinancialData {
  period: string;
  plData: PLData[];
  bsData: BSData[];
  cfData: CFData[];
}

interface PLData {
  accountId: string;
  accountName: string;
  value: number;
}

interface BSData {
  accountId: string;
  accountName: string;
  value: number;
}

interface CFData {
  accountId: string;
  accountName: string;
  value: number;
}

// ========================================
// 抽象クラス: 財務レポート
// ========================================

/**
 * 財務レポートの抽象クラス
 * クライアントコードはこの抽象クラスを通じてレポートを操作する
 */
abstract class FinancialReport {
  protected data: FinancialData;
  protected generated: boolean = false;

  constructor(data: FinancialData) {
    this.data = data;
  }

  /**
   * レポートタイプを取得（抽象メソッド）
   */
  abstract getReportType(): string;

  /**
   * レポートを生成する（抽象メソッド）
   */
  abstract generate(): void;

  /**
   * レポートをエクスポートする（抽象メソッド）
   */
  abstract export(path: string): void;

  /**
   * レポートが生成済みかどうかを確認
   */
  isGenerated(): boolean {
    return this.generated;
  }

  /**
   * 財務データを取得
   */
  getData(): FinancialData {
    return this.data;
  }
}

// ========================================
// 具象クラス: 財務レポートの実装
// ========================================

/**
 * PDFレポートの実装
 * クライアントコードはこのクラス名を知る必要がない
 */
class PDFReport extends FinancialReport {
  private pdfContent: string = "";

  getReportType(): string {
    return "PDF";
  }

  generate(): void {
    console.log("PDFレポートを生成中...");
    // 実際の実装ではPDFライブラリを使用してPDFを生成
    this.pdfContent = `
=== 財務レポート（PDF形式） ===
期間: ${this.data.period}

【損益計算書】
${this.data.plData
  .map((d) => `  ${d.accountName}: ${d.value.toLocaleString()}`)
  .join("\n")}

【貸借対照表】
${this.data.bsData
  .map((d) => `  ${d.accountName}: ${d.value.toLocaleString()}`)
  .join("\n")}

【キャッシュフロー計算書】
${this.data.cfData
  .map((d) => `  ${d.accountName}: ${d.value.toLocaleString()}`)
  .join("\n")}
`;
    this.generated = true;
    console.log("✓ PDFレポートの生成が完了しました");
  }

  export(path: string): void {
    if (!this.generated) {
      throw new Error("レポートが生成されていません。先にgenerate()を呼び出してください");
    }
    console.log(`PDFレポートをエクスポート: ${path}`);
    // 実際の実装ではファイルシステムにPDFファイルを書き込む
    console.log(`  → 内容:\n${this.pdfContent}`);
  }
}

/**
 * Excelレポートの実装
 * クライアントコードはこのクラス名を知る必要がない
 */
class ExcelReport extends FinancialReport {
  private excelData: Map<string, Array<{ name: string; value: number }>> =
    new Map();

  getReportType(): string {
    return "Excel";
  }

  generate(): void {
    console.log("Excelレポートを生成中...");
    // 実際の実装ではExcelライブラリを使用してExcelファイルを生成
    this.excelData.set("PL", this.data.plData.map((d) => ({
      name: d.accountName,
      value: d.value,
    })));
    this.excelData.set("BS", this.data.bsData.map((d) => ({
      name: d.accountName,
      value: d.value,
    })));
    this.excelData.set("CF", this.data.cfData.map((d) => ({
      name: d.accountName,
      value: d.value,
    })));
    this.generated = true;
    console.log("✓ Excelレポートの生成が完了しました");
  }

  export(path: string): void {
    if (!this.generated) {
      throw new Error("レポートが生成されていません。先にgenerate()を呼び出してください");
    }
    console.log(`Excelレポートをエクスポート: ${path}`);
    // 実際の実装ではExcelファイルを書き込む
    console.log("  → シート構成:");
    this.excelData.forEach((rows, sheetName) => {
      console.log(`    - ${sheetName}シート: ${rows.length}行`);
      rows.forEach((row) => {
        console.log(`      ${row.name}: ${row.value.toLocaleString()}`);
      });
    });
  }
}

/**
 * HTMLレポートの実装
 * クライアントコードはこのクラス名を知る必要がない
 */
class HTMLReport extends FinancialReport {
  private htmlContent: string = "";

  getReportType(): string {
    return "HTML";
  }

  generate(): void {
    console.log("HTMLレポートを生成中...");
    // 実際の実装ではHTMLテンプレートを使用してHTMLを生成
    this.htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>財務レポート - ${this.data.period}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
  </style>
</head>
<body>
  <h1>財務レポート - ${this.data.period}</h1>
  
  <h2>損益計算書</h2>
  <table>
    <tr><th>勘定科目</th><th>金額</th></tr>
    ${this.data.plData
      .map(
        (d) =>
          `<tr><td>${d.accountName}</td><td>${d.value.toLocaleString()}</td></tr>`
      )
      .join("\n")}
  </table>
  
  <h2>貸借対照表</h2>
  <table>
    <tr><th>勘定科目</th><th>金額</th></tr>
    ${this.data.bsData
      .map(
        (d) =>
          `<tr><td>${d.accountName}</td><td>${d.value.toLocaleString()}</td></tr>`
      )
      .join("\n")}
  </table>
  
  <h2>キャッシュフロー計算書</h2>
  <table>
    <tr><th>勘定科目</th><th>金額</th></tr>
    ${this.data.cfData
      .map(
        (d) =>
          `<tr><td>${d.accountName}</td><td>${d.value.toLocaleString()}</td></tr>`
      )
      .join("\n")}
  </table>
</body>
</html>
`;
    this.generated = true;
    console.log("✓ HTMLレポートの生成が完了しました");
  }

  export(path: string): void {
    if (!this.generated) {
      throw new Error("レポートが生成されていません。先にgenerate()を呼び出してください");
    }
    console.log(`HTMLレポートをエクスポート: ${path}`);
    // 実際の実装ではファイルシステムにHTMLファイルを書き込む
    console.log(`  → HTMLファイルサイズ: ${this.htmlContent.length}文字`);
  }
}

/**
 * CSVレポートの実装
 * クライアントコードはこのクラス名を知る必要がない
 */
class CSVReport extends FinancialReport {
  private csvContent: string = "";

  getReportType(): string {
    return "CSV";
  }

  generate(): void {
    console.log("CSVレポートを生成中...");
    // CSV形式でデータを生成
    const rows: string[] = [];
    rows.push("財務諸表タイプ,勘定科目,金額");
    
    this.data.plData.forEach((d) => {
      rows.push(`PL,${d.accountName},${d.value}`);
    });
    
    this.data.bsData.forEach((d) => {
      rows.push(`BS,${d.accountName},${d.value}`);
    });
    
    this.data.cfData.forEach((d) => {
      rows.push(`CF,${d.accountName},${d.value}`);
    });
    
    this.csvContent = rows.join("\n");
    this.generated = true;
    console.log("✓ CSVレポートの生成が完了しました");
  }

  export(path: string): void {
    if (!this.generated) {
      throw new Error("レポートが生成されていません。先にgenerate()を呼び出してください");
    }
    console.log(`CSVレポートをエクスポート: ${path}`);
    // 実際の実装ではファイルシステムにCSVファイルを書き込む
    const lines = this.csvContent.split("\n");
    console.log(`  → 行数: ${lines.length}行`);
    console.log(`  → 先頭3行:\n${lines.slice(0, 3).join("\n")}`);
  }
}

// ========================================
// 抽象クラス: 財務レポートファクトリ
// ========================================

/**
 * 財務レポートファクトリの抽象クラス
 * クライアントコードはこの抽象クラスを通じてファクトリを操作する
 */
abstract class FinancialReportFactory {
  /**
   * 財務レポートを作成する（抽象メソッド）
   * サブクラスで実装される
   */
  abstract createReport(data: FinancialData): FinancialReport;

  /**
   * 財務レポートを登録する（抽象メソッド）
   * サブクラスで実装される
   */
  abstract registerReport(report: FinancialReport): void;

  /**
   * 財務レポートを作成して登録する（テンプレートメソッド）
   * クライアントコードはこのメソッドを使用する
   */
  create(data: FinancialData): FinancialReport {
    const report = this.createReport(data);
    this.registerReport(report);
    return report;
  }
}

// ========================================
// レポートレジストリ（実装の詳細）
// ========================================

/**
 * 財務レポートレジストリ
 * クライアントコードはこの存在を知る必要がない（実装の詳細）
 */
const reportRegistry: Map<string, FinancialReport[]> = new Map();

// ========================================
// 具象クラス: ファクトリの実装
// ========================================

/**
 * PDFレポートファクトリの実装
 * クライアントコードはこのクラス名を知る必要がない
 */
class PDFReportFactory extends FinancialReportFactory {
  createReport(data: FinancialData): FinancialReport {
    return new PDFReport(data);
  }

  registerReport(report: FinancialReport): void {
    const reports = reportRegistry.get("PDF") || [];
    reports.push(report);
    reportRegistry.set("PDF", reports);
  }
}

/**
 * Excelレポートファクトリの実装
 * クライアントコードはこのクラス名を知る必要がない
 */
class ExcelReportFactory extends FinancialReportFactory {
  createReport(data: FinancialData): FinancialReport {
    return new ExcelReport(data);
  }

  registerReport(report: FinancialReport): void {
    const reports = reportRegistry.get("Excel") || [];
    reports.push(report);
    reportRegistry.set("Excel", reports);
  }
}

/**
 * HTMLレポートファクトリの実装
 * クライアントコードはこのクラス名を知る必要がない
 */
class HTMLReportFactory extends FinancialReportFactory {
  createReport(data: FinancialData): FinancialReport {
    return new HTMLReport(data);
  }

  registerReport(report: FinancialReport): void {
    const reports = reportRegistry.get("HTML") || [];
    reports.push(report);
    reportRegistry.set("HTML", reports);
  }
}

/**
 * CSVレポートファクトリの実装
 * クライアントコードはこのクラス名を知る必要がない
 */
class CSVReportFactory extends FinancialReportFactory {
  createReport(data: FinancialData): FinancialReport {
    return new CSVReport(data);
  }

  registerReport(report: FinancialReport): void {
    const reports = reportRegistry.get("CSV") || [];
    reports.push(report);
    reportRegistry.set("CSV", reports);
  }
}

// ========================================
// ファクトリ関数: 具象クラスの生成を隠蔽
// ========================================

/**
 * PDFレポートファクトリを生成するファクトリ関数
 * クライアントコードはこの関数を使用してファクトリを取得する
 * 具象クラス名（PDFReportFactory）を知る必要がない
 */
function createPDFReportFactory(): FinancialReportFactory {
  return new PDFReportFactory();
}

/**
 * Excelレポートファクトリを生成するファクトリ関数
 * クライアントコードはこの関数を使用してファクトリを取得する
 * 具象クラス名（ExcelReportFactory）を知る必要がない
 */
function createExcelReportFactory(): FinancialReportFactory {
  return new ExcelReportFactory();
}

/**
 * HTMLレポートファクトリを生成するファクトリ関数
 * クライアントコードはこの関数を使用してファクトリを取得する
 * 具象クラス名（HTMLReportFactory）を知る必要がない
 */
function createHTMLReportFactory(): FinancialReportFactory {
  return new HTMLReportFactory();
}

/**
 * CSVレポートファクトリを生成するファクトリ関数
 * クライアントコードはこの関数を使用してファクトリを取得する
 * 具象クラス名（CSVReportFactory）を知る必要がない
 */
function createCSVReportFactory(): FinancialReportFactory {
  return new CSVReportFactory();
}

// ========================================
// クライアントコード
// ========================================

/**
 * サンプル財務データを生成
 */
function createSampleFinancialData(): FinancialData {
  return {
    period: "2024年度",
    plData: [
      { accountId: "REVENUE", accountName: "売上高", value: 1000000 },
      { accountId: "COST_OF_SALES", accountName: "売上原価", value: -600000 },
      { accountId: "GROSS_PROFIT", accountName: "売上総利益", value: 400000 },
      { accountId: "SG_EXPENSES", accountName: "販管費", value: -200000 },
      { accountId: "OPERATING_INCOME", accountName: "営業利益", value: 200000 },
      { accountId: "NET_INCOME", accountName: "当期純利益", value: 150000 },
    ],
    bsData: [
      { accountId: "CASH", accountName: "現金及び預金", value: 500000 },
      { accountId: "AR", accountName: "売掛金", value: 300000 },
      { accountId: "CURRENT_ASSETS", accountName: "流動資産", value: 800000 },
      { accountId: "PPE", accountName: "有形固定資産", value: 2000000 },
      { accountId: "TOTAL_ASSETS", accountName: "資産合計", value: 2800000 },
      { accountId: "AP", accountName: "買掛金", value: -400000 },
      { accountId: "LONG_TERM_DEBT", accountName: "長期借入金", value: -1000000 },
      { accountId: "TOTAL_LIABILITIES", accountName: "負債合計", value: -1400000 },
      { accountId: "SHARE_CAPITAL", accountName: "資本金", value: -800000 },
      { accountId: "RETAINED_EARNINGS", accountName: "利益剰余金", value: -600000 },
      { accountId: "TOTAL_EQUITY", accountName: "純資産合計", value: -1400000 },
    ],
    cfData: [
      { accountId: "CFO", accountName: "営業活動によるCF", value: 300000 },
      { accountId: "CFI", accountName: "投資活動によるCF", value: -150000 },
      { accountId: "CFF", accountName: "財務活動によるCF", value: -100000 },
      { accountId: "NET_CASH_FLOW", accountName: "現金及び現金同等物の増減額", value: 50000 },
    ],
  };
}

/**
 * クライアントコードの例
 * この関数は具象クラス名（PDFReportFactory, ExcelReportFactory,
 * PDFReport, ExcelReportなど）を知らずに動作する
 */
function run() {
  console.log("=== Factory Methodパターン: 財務レポート生成の統一化 ===\n");

  const financialData = createSampleFinancialData();

  // 1. PDFレポートの生成
  console.log("【1. PDFレポートの生成】");
  const pdfFactory: FinancialReportFactory = createPDFReportFactory();
  const pdfReport: FinancialReport = pdfFactory.create(financialData);
  pdfReport.generate();
  pdfReport.export("./reports/financial_report_2024.pdf");
  console.log(`レポートタイプ: ${pdfReport.getReportType()}\n`);

  // 2. Excelレポートの生成
  console.log("【2. Excelレポートの生成】");
  const excelFactory: FinancialReportFactory = createExcelReportFactory();
  const excelReport: FinancialReport = excelFactory.create(financialData);
  excelReport.generate();
  excelReport.export("./reports/financial_report_2024.xlsx");
  console.log(`レポートタイプ: ${excelReport.getReportType()}\n`);

  // 3. HTMLレポートの生成
  console.log("【3. HTMLレポートの生成】");
  const htmlFactory: FinancialReportFactory = createHTMLReportFactory();
  const htmlReport: FinancialReport = htmlFactory.create(financialData);
  htmlReport.generate();
  htmlReport.export("./reports/financial_report_2024.html");
  console.log(`レポートタイプ: ${htmlReport.getReportType()}\n`);

  // 4. CSVレポートの生成
  console.log("【4. CSVレポートの生成】");
  const csvFactory: FinancialReportFactory = createCSVReportFactory();
  const csvReport: FinancialReport = csvFactory.create(financialData);
  csvReport.generate();
  csvReport.export("./reports/financial_report_2024.csv");
  console.log(`レポートタイプ: ${csvReport.getReportType()}\n`);

  // 5. Factory Methodパターンの利点の説明
  console.log("\n=== Factory Methodパターンの利点 ===");
  console.log("✓ レポート形式が追加されても、既存コードの変更が不要");
  console.log("✓ クライアントコードは具象クラス名を知る必要がない");
  console.log("✓ レポート生成のロジックを各具象クラスに分離できる");
  console.log("✓ テスト時にモックレポートを簡単に差し替え可能");
  console.log("✓ レポート形式ごとの特殊な処理を各クラスに閉じ込められる");

  // 6. 複数のレポート形式を同じ方法で処理できる例
  console.log("\n=== 複数レポート形式の一括生成 ===");
  const factories: Array<{
    factory: FinancialReportFactory;
    type: string;
    path: string;
  }> = [
    { factory: createPDFReportFactory(), type: "PDF", path: "./reports/report.pdf" },
    { factory: createExcelReportFactory(), type: "Excel", path: "./reports/report.xlsx" },
    { factory: createHTMLReportFactory(), type: "HTML", path: "./reports/report.html" },
    { factory: createCSVReportFactory(), type: "CSV", path: "./reports/report.csv" },
  ];

  factories.forEach(({ factory, type, path }) => {
    const report = factory.create(financialData);
    report.generate();
    report.export(path);
    console.log(`  → ${type}レポートを生成しました`);
  });

  // 7. レジストリの確認（実装の詳細）
  console.log("\n=== レポートレジストリの確認 ===");
  reportRegistry.forEach((reports, type) => {
    console.log(`${type}レポート: ${reports.length}件登録済み`);
  });
}

run();

