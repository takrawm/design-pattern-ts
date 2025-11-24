export {};

// ========================================
// 統一インターフェース（Target）
// ========================================

/**
 * 財務データローダーの統一インターフェース
 * 異なるデータソース（CSV、JSON、DB）から財務データを読み込むための共通インターフェース
 */
interface FinancialDataLoader {
  /**
   * 財務データを読み込む
   * @param source データソース（ファイルパス、DB接続文字列など）
   * @returns 標準化された財務データ
   */
  loadFinancialData(source: string): FinancialData[];

  /**
   * データソースが有効かどうかを確認
   */
  validateSource(source: string): boolean;
}

// ========================================
// 標準化された財務データ型
// ========================================

// 各データソースの独自形式を、この標準形式に変換することで、後続の処理が統一できる
interface FinancialData {
  accountId: string;
  accountName: string;
  value: number;
  period: string;
  fsType: "PL" | "BS" | "CF";
}

// ========================================
// 既存データソースの型定義
// ========================================

/**
 * JSONファイルから読み込まれる勘定科目データ
 */
interface JsonAccount {
  id: string;
  name: string;
  amount: number;
  fiscalYear: string;
  statementType: string;
}

/**
 * JSONファイルのデータ構造
 */
interface JsonAccountData {
  accounts: JsonAccount[];
}

/**
 * データベースから取得される勘定科目データ
 */
interface DatabaseAccountRow {
  account_code: string;
  account_label: string;
  account_value: number;
  period_label: string;
  financial_statement: string;
}

// ========================================
// 既存のデータソース（Adaptee）
// ========================================

/**
 * CSVファイルからデータを読み込む既存ライブラリ
 * 独自の形式でデータを返す
 */
class CsvFileReader {
  readCsvFile(filePath: string): string[][] {
    // 実際の実装ではファイルを読み込む
    // ここではサンプルデータを返す
    console.log(`CSVファイルを読み込み: ${filePath}`);
    return [
      ["account_id", "account_name", "value", "period", "fs_type"],
      ["REV001", "売上高", "1000000", "2024年度", "PL"],
      ["COST001", "売上原価", "-600000", "2024年度", "PL"],
      ["SG001", "販管費", "-200000", "2024年度", "PL"],
      ["CASH", "現金及び預金", "500000", "2024年度", "BS"],
      ["AR", "売掛金", "300000", "2024年度", "BS"],
    ];
  }
}

/**
 * JSONファイルからデータを読み込む既存ライブラリ
 * 独自の形式でデータを返す
 */
class JsonFileReader {
  readJsonFile(filePath: string): JsonAccountData {
    // 実際の実装ではファイルを読み込む
    // ここではサンプルデータを返す
    console.log(`JSONファイルを読み込み: ${filePath}`);
    return {
      accounts: [
        {
          id: "REV001",
          name: "売上高",
          amount: 1000000,
          fiscalYear: "2024年度",
          statementType: "PL",
        },
        {
          id: "COST001",
          name: "売上原価",
          amount: -600000,
          fiscalYear: "2024年度",
          statementType: "PL",
        },
        {
          id: "SG001",
          name: "販管費",
          amount: -200000,
          fiscalYear: "2024年度",
          statementType: "PL",
        },
        {
          id: "CASH",
          name: "現金及び預金",
          amount: 500000,
          fiscalYear: "2024年度",
          statementType: "BS",
        },
        {
          id: "AR",
          name: "売掛金",
          amount: 300000,
          fiscalYear: "2024年度",
          statementType: "BS",
        },
      ],
    };
  }
}

/**
 * データベースからデータを読み込む既存ライブラリ
 * 独自の形式でデータを返す
 */
class DatabaseReader {
  queryFinancialData(connectionString: string): DatabaseAccountRow[] {
    // 実際の実装ではDBに接続してクエリを実行
    // ここではサンプルデータを返す
    console.log(`データベースから読み込み: ${connectionString}`);
    return [
      {
        account_code: "REV001",
        account_label: "売上高",
        account_value: 1000000,
        period_label: "2024年度",
        financial_statement: "PL",
      },
      {
        account_code: "COST001",
        account_label: "売上原価",
        account_value: -600000,
        period_label: "2024年度",
        financial_statement: "PL",
      },
      {
        account_code: "SG001",
        account_label: "販管費",
        account_value: -200000,
        period_label: "2024年度",
        financial_statement: "PL",
      },
      {
        account_code: "CASH",
        account_label: "現金及び預金",
        account_value: 500000,
        period_label: "2024年度",
        financial_statement: "BS",
      },
      {
        account_code: "AR",
        account_label: "売掛金",
        account_value: 300000,
        period_label: "2024年度",
        financial_statement: "BS",
      },
    ];
  }
}

// ========================================
// Adapter実装（委譲パターン）
// ========================================

/**
 * CSVファイルリーダーをFinancialDataLoaderインターフェースに適合させるAdapter
 */
class CsvDataAdapter implements FinancialDataLoader {
  constructor(private csvReader: CsvFileReader) {}

  validateSource(source: string): boolean {
    return source.endsWith(".csv");
  }

  loadFinancialData(source: string): FinancialData[] {
    if (!this.validateSource(source)) {
      throw new Error(`無効なCSVファイル: ${source}`);
    }

    const csvData = this.csvReader.readCsvFile(source);
    const header = csvData[0];
    const rows = csvData.slice(1);

    // CSVの列インデックスを取得
    const accountIdIndex = header.indexOf("account_id");
    const accountNameIndex = header.indexOf("account_name");
    const valueIndex = header.indexOf("value");
    const periodIndex = header.indexOf("period");
    const fsTypeIndex = header.indexOf("fs_type");

    return rows.map((row) => ({
      accountId: row[accountIdIndex],
      accountName: row[accountNameIndex],
      value: Number(row[valueIndex]),
      period: row[periodIndex],
      fsType: row[fsTypeIndex] as "PL" | "BS" | "CF",
    }));
  }
}

/**
 * JSONファイルリーダーをFinancialDataLoaderインターフェースに適合させるAdapter
 */
class JsonDataAdapter implements FinancialDataLoader {
  constructor(private jsonReader: JsonFileReader) {}

  validateSource(source: string): boolean {
    return source.endsWith(".json");
  }

  loadFinancialData(source: string): FinancialData[] {
    if (!this.validateSource(source)) {
      throw new Error(`無効なJSONファイル: ${source}`);
    }

    const jsonData = this.jsonReader.readJsonFile(source);

    return jsonData.accounts.map((account) => ({
      accountId: account.id,
      accountName: account.name,
      value: account.amount,
      period: account.fiscalYear,
      fsType: this.mapStatementType(account.statementType),
    }));
  }

  private mapStatementType(type: string): "PL" | "BS" | "CF" {
    const mapping: Record<string, "PL" | "BS" | "CF"> = {
      PL: "PL",
      BS: "BS",
      CF: "CF",
      ProfitAndLoss: "PL",
      BalanceSheet: "BS",
      CashFlow: "CF",
    };
    return mapping[type] || "PL";
  }
}

/**
 * データベースリーダーをFinancialDataLoaderインターフェースに適合させるAdapter
 */
class DatabaseDataAdapter implements FinancialDataLoader {
  constructor(private dbReader: DatabaseReader) {}

  validateSource(source: string): boolean {
    return (
      source.startsWith("db://") ||
      source.startsWith("postgresql://") ||
      source.startsWith("mysql://")
    );
  }

  loadFinancialData(source: string): FinancialData[] {
    if (!this.validateSource(source)) {
      throw new Error(`無効なデータベース接続文字列: ${source}`);
    }

    const dbData = this.dbReader.queryFinancialData(source);

    return dbData.map((row) => ({
      accountId: row.account_code,
      accountName: row.account_label,
      value: row.account_value,
      period: row.period_label,
      fsType: this.mapFinancialStatement(row.financial_statement),
    }));
  }

  private mapFinancialStatement(stmt: string): "PL" | "BS" | "CF" {
    const mapping: Record<string, "PL" | "BS" | "CF"> = {
      PL: "PL",
      BS: "BS",
      CF: "CF",
    };
    return mapping[stmt] || "PL";
  }
}

// ========================================
// 使用例: 財務データ処理クラス
// ========================================

/**
 * 財務データを処理するクラス
 * Adapterパターンにより、データソースの種類に関わらず統一的なインターフェースで処理できる
 */
class FinancialDataProcessor {
  /**
   * データローダーを使用して財務データを処理
   */
  processFinancialData(loader: FinancialDataLoader, source: string): void {
    console.log(`\n=== データソース: ${source} ===`);

    if (!loader.validateSource(source)) {
      console.error(`無効なデータソース: ${source}`);
      return;
    }

    try {
      const data = loader.loadFinancialData(source);
      console.log(`読み込み成功: ${data.length}件のデータ`);

      // 財務諸表タイプごとに集計
      const plData = data.filter((d) => d.fsType === "PL");
      const bsData = data.filter((d) => d.fsType === "BS");
      const cfData = data.filter((d) => d.fsType === "CF");

      console.log(`\nPL（損益計算書）: ${plData.length}件`);
      plData.forEach((d) => {
        console.log(`  - ${d.accountName}: ${d.value.toLocaleString()}`);
      });

      console.log(`\nBS（貸借対照表）: ${bsData.length}件`);
      bsData.forEach((d) => {
        console.log(`  - ${d.accountName}: ${d.value.toLocaleString()}`);
      });

      if (cfData.length > 0) {
        console.log(`\nCF（キャッシュフロー計算書）: ${cfData.length}件`);
        cfData.forEach((d) => {
          console.log(`  - ${d.accountName}: ${d.value.toLocaleString()}`);
        });
      }
    } catch (error) {
      console.error(
        `エラー: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

// ========================================
// 実行例
// ========================================

function run() {
  console.log("=== Adapterパターン: 財務データ読み込みの統一化 ===\n");

  const processor = new FinancialDataProcessor();

  // 1. CSVファイルから読み込み
  const csvReader = new CsvFileReader();
  const csvAdapter = new CsvDataAdapter(csvReader);
  processor.processFinancialData(csvAdapter, "financial_data.csv");

  // 2. JSONファイルから読み込み
  const jsonReader = new JsonFileReader();
  const jsonAdapter = new JsonDataAdapter(jsonReader);
  processor.processFinancialData(jsonAdapter, "financial_data.json");

  // 3. データベースから読み込み
  const dbReader = new DatabaseReader();
  const dbAdapter = new DatabaseDataAdapter(dbReader);
  processor.processFinancialData(
    dbAdapter,
    "postgresql://localhost/financial_db"
  );

  // 4. Adapterパターンの利点の説明
  console.log("\n=== Adapterパターンの利点 ===");
  console.log("✓ 異なるデータソースを統一インターフェースで扱える");
  console.log("✓ データソースが追加されても、既存コードの変更が不要");
  console.log("✓ 各データソースの実装詳細を隠蔽できる");
  console.log("✓ テスト時にモックデータソースを簡単に差し替え可能");

  // 5. 複数のデータソースを同じ方法で処理できる例
  console.log("\n=== 複数データソースの一括処理 ===");
  const loaders: Array<{ loader: FinancialDataLoader; source: string }> = [
    { loader: csvAdapter, source: "data1.csv" },
    { loader: jsonAdapter, source: "data2.json" },
    { loader: dbAdapter, source: "db://production/financial" },
  ];

  loaders.forEach(({ loader, source }) => {
    processor.processFinancialData(loader, source);
  });
}

run();
