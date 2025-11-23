export {};

// 財務データの型定義
interface FinancialData {
  accountId: string;
  accountName: string;
  value: number;
  period: string;
}

interface ReportResult {
  reportType: string;
  period: string;
  data: FinancialData[];
  metadata: {
    generatedAt: Date;
    totalValue: number;
  };
}

// Template Methodパターン: 財務レポート生成の抽象クラス
abstract class FinancialReportGenerator {
  // テンプレートメソッド: レポート生成の共通フローを定義
  generate(period: string): ReportResult {
    console.log(`[${this.getReportType()}] レポート生成を開始します...`);

    // 1. データの読み込み
    const rawData = this.loadData(period);
    console.log(`  ✓ データ読み込み完了 (${rawData.length}件)`);

    // 2. 前処理（フックメソッド）
    this.beforeCalculation(rawData);

    // 3. 計算処理（抽象メソッド - サブクラスで実装）
    const calculatedData = this.calculate(rawData);
    console.log(`  ✓ 計算処理完了`);

    // 4. 後処理（フックメソッド）
    this.afterCalculation(calculatedData);

    // 5. 検証（抽象メソッド - サブクラスで実装）
    this.validate(calculatedData);
    console.log(`  ✓ 検証完了`);

    // 6. フォーマット（抽象メソッド - サブクラスで実装）
    const formattedData = this.format(calculatedData);
    console.log(`  ✓ フォーマット完了`);

    // 7. 結果の構築
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

  // 抽象メソッド: サブクラスで実装必須
  protected abstract loadData(period: string): FinancialData[];
  protected abstract calculate(data: FinancialData[]): FinancialData[];
  protected abstract validate(data: FinancialData[]): void;
  protected abstract format(data: FinancialData[]): FinancialData[];
  protected abstract getReportType(): string;

  // フックメソッド: サブクラスでオプションでオーバーライド可能
  protected beforeCalculation(data: FinancialData[]): void {
    // デフォルト実装（何もしない）
  }

  protected afterCalculation(data: FinancialData[]): void {
    // デフォルト実装（何もしない）
  }

  // 共通メソッド: 全サブクラスで共有
  protected calculateTotal(data: FinancialData[]): number {
    return data.reduce((sum, item) => sum + item.value, 0);
  }
}

// 具象クラス1: 損益計算書（PL: Profit and Loss Statement）レポート生成
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
    // PL特有の計算: 売上総利益、営業利益、経常利益、当期純利益を計算
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

// 具象クラス2: 貸借対照表（BS: Balance Sheet）レポート生成
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

// 具象クラス3: キャッシュフロー計算書（CF: Cash Flow Statement）レポート生成
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

// 実行例
function run() {
  const period = "2024年度";

  // PLレポート生成
  const plGenerator = new PLReportGenerator();
  const plReport = plGenerator.generate(period);

  // BSレポート生成
  const bsGenerator = new BSReportGenerator();
  const bsReport = bsGenerator.generate(period);

  // CFレポート生成
  const cfGenerator = new CFReportGenerator();
  const cfReport = cfGenerator.generate(period);

  // 結果の表示
  console.log("=== 生成されたレポートのサマリー ===");
  console.log(
    `PL: ${
      plReport.data.length
    }項目, 合計: ${plReport.metadata.totalValue.toLocaleString()}`
  );
  console.log(
    `BS: ${
      bsReport.data.length
    }項目, 合計: ${bsReport.metadata.totalValue.toLocaleString()}`
  );
  console.log(
    `CF: ${
      cfReport.data.length
    }項目, 合計: ${cfReport.metadata.totalValue.toLocaleString()}`
  );
}

run();
