export {};

// グローバルアカウントの型定義
interface GlobalAccount {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  fsType: "PL" | "BS" | "CF";
  accountType:
    | "ASSET"
    | "LIABILITY"
    | "EQUITY"
    | "REVENUE"
    | "EXPENSE"
    | "CASH_FLOW";
  isCredit: boolean;
  parentId?: string;
  sortOrder: number;
}

/**
 * グローバルアカウントマスタ管理クラス（シングルトンパターン）
 *
 * 財務モデルアプリケーション全体で共通の勘定科目定義を管理します。
 * シングルトンが適する理由：
 * 1. 全モデル・全シナリオで共通のマスタデータを共有
 * 2. メモリ効率: 1つのインスタンスで全計算で利用可能
 * 3. 一貫性: アプリケーション全体で同じ勘定科目定義を保証
 * 4. 初期化コスト: DBやファイルからの読み込みを1回だけ実行
 */
class GlobalAccountMaster {
  // staticは「クラスそのものに紐づく変数」という意味で、すべてのインスタンスで共有
  private static instance: GlobalAccountMaster;
  // accountsやaccountsByCodeはインスタンスプロパティ
  private accounts: Map<string, GlobalAccount> = new Map();
  private accountsByCode: Map<string, GlobalAccount> = new Map();
  private initialized: boolean = false;

  // プライベートコンストラクタ: 外部からのインスタンス化を防止
  private constructor() {
    console.log("GlobalAccountMaster: インスタンスを作成しました");
  }

  /**
   * シングルトンインスタンスを取得
   * staticプロパティは「クラスそのものに属する変数」で、
   * インスタンスごとではなく、クラスに対して1つだけ存在。
   * ⇒インスタンスがなくても呼べる
   * ※staticがないと、インスタンスを作ってから呼ぶ必要があるが、コンストラクタがprivateなので、
   * 外部からnew GlobalAccountMaster()と書くこともできない
   *
   * 最初にgetInstance()が呼ばれた時点では、GlobalAccountMaster.instanceは
   * まだ何も代入されていない状態（undefined）。
   * そのためif (!GlobalAccountMaster.instance)の条件が真となり、
   * new GlobalAccountMaster()でインスタンスを作成し、
   * それをGlobalAccountMaster.instanceに保存する。
   * この時点で、クラスレベルで1つのインスタンスが作られ、保持された状態になる
   */
  static getInstance(): GlobalAccountMaster {
    if (!GlobalAccountMaster.instance) {
      GlobalAccountMaster.instance = new GlobalAccountMaster();
    }
    return GlobalAccountMaster.instance;
  }

  /**
   * マスタデータを初期化（実際のアプリではDBやファイルから読み込み）
   */
  initialize(): void {
    if (this.initialized) {
      console.log("GlobalAccountMaster: 既に初期化済みです");
      return;
    }

    // 標準的なグローバルアカウントを登録
    const standardAccounts: GlobalAccount[] = [
      // PL（損益計算書）勘定
      {
        id: "REVENUE",
        code: "REV",
        name: "売上高",
        nameEn: "Revenue",
        fsType: "PL",
        accountType: "REVENUE",
        isCredit: false,
        sortOrder: 1,
      },
      {
        id: "COST_OF_SALES",
        code: "COS",
        name: "売上原価",
        nameEn: "Cost of Sales",
        fsType: "PL",
        accountType: "EXPENSE",
        isCredit: false,
        sortOrder: 2,
      },
      {
        id: "GROSS_PROFIT",
        code: "GP",
        name: "売上総利益",
        nameEn: "Gross Profit",
        fsType: "PL",
        accountType: "REVENUE",
        isCredit: false,
        sortOrder: 3,
      },
      {
        id: "SG_EXPENSES",
        code: "SGA",
        name: "販管費",
        nameEn: "SG&A Expenses",
        fsType: "PL",
        accountType: "EXPENSE",
        isCredit: false,
        sortOrder: 4,
      },
      {
        id: "OPERATING_INCOME",
        code: "OI",
        name: "営業利益",
        nameEn: "Operating Income",
        fsType: "PL",
        accountType: "REVENUE",
        isCredit: false,
        sortOrder: 5,
      },
      {
        id: "NET_INCOME",
        code: "NI",
        name: "当期純利益",
        nameEn: "Net Income",
        fsType: "PL",
        accountType: "REVENUE",
        isCredit: false,
        sortOrder: 6,
      },

      // BS（貸借対照表）勘定
      {
        id: "CASH",
        code: "CASH",
        name: "現金及び預金",
        nameEn: "Cash and Cash Equivalents",
        fsType: "BS",
        accountType: "ASSET",
        isCredit: false,
        parentId: "CURRENT_ASSETS",
        sortOrder: 10,
      },
      {
        id: "ACCOUNTS_RECEIVABLE",
        code: "AR",
        name: "売掛金",
        nameEn: "Accounts Receivable",
        fsType: "BS",
        accountType: "ASSET",
        isCredit: false,
        parentId: "CURRENT_ASSETS",
        sortOrder: 11,
      },
      {
        id: "CURRENT_ASSETS",
        code: "CA",
        name: "流動資産",
        nameEn: "Current Assets",
        fsType: "BS",
        accountType: "ASSET",
        isCredit: false,
        sortOrder: 9,
      },
      {
        id: "PPE",
        code: "PPE",
        name: "有形固定資産",
        nameEn: "Property, Plant and Equipment",
        fsType: "BS",
        accountType: "ASSET",
        isCredit: false,
        parentId: "NON_CURRENT_ASSETS",
        sortOrder: 20,
      },
      {
        id: "NON_CURRENT_ASSETS",
        code: "NCA",
        name: "固定資産",
        nameEn: "Non-Current Assets",
        fsType: "BS",
        accountType: "ASSET",
        isCredit: false,
        sortOrder: 19,
      },
      {
        id: "TOTAL_ASSETS",
        code: "TA",
        name: "資産合計",
        nameEn: "Total Assets",
        fsType: "BS",
        accountType: "ASSET",
        isCredit: false,
        sortOrder: 30,
      },

      {
        id: "ACCOUNTS_PAYABLE",
        code: "AP",
        name: "買掛金",
        nameEn: "Accounts Payable",
        fsType: "BS",
        accountType: "LIABILITY",
        isCredit: true,
        parentId: "CURRENT_LIABILITIES",
        sortOrder: 40,
      },
      {
        id: "CURRENT_LIABILITIES",
        code: "CL",
        name: "流動負債",
        nameEn: "Current Liabilities",
        fsType: "BS",
        accountType: "LIABILITY",
        isCredit: true,
        sortOrder: 39,
      },
      {
        id: "LONG_TERM_DEBT",
        code: "LTD",
        name: "長期借入金",
        nameEn: "Long-term Debt",
        fsType: "BS",
        accountType: "LIABILITY",
        isCredit: true,
        parentId: "NON_CURRENT_LIABILITIES",
        sortOrder: 50,
      },
      {
        id: "NON_CURRENT_LIABILITIES",
        code: "NCL",
        name: "固定負債",
        nameEn: "Non-Current Liabilities",
        fsType: "BS",
        accountType: "LIABILITY",
        isCredit: true,
        sortOrder: 49,
      },
      {
        id: "TOTAL_LIABILITIES",
        code: "TL",
        name: "負債合計",
        nameEn: "Total Liabilities",
        fsType: "BS",
        accountType: "LIABILITY",
        isCredit: true,
        sortOrder: 60,
      },

      {
        id: "SHARE_CAPITAL",
        code: "SC",
        name: "資本金",
        nameEn: "Share Capital",
        fsType: "BS",
        accountType: "EQUITY",
        isCredit: true,
        sortOrder: 70,
      },
      {
        id: "RETAINED_EARNINGS",
        code: "RE",
        name: "利益剰余金",
        nameEn: "Retained Earnings",
        fsType: "BS",
        accountType: "EQUITY",
        isCredit: true,
        sortOrder: 71,
      },
      {
        id: "TOTAL_EQUITY",
        code: "TE",
        name: "純資産合計",
        nameEn: "Total Equity",
        fsType: "BS",
        accountType: "EQUITY",
        isCredit: true,
        sortOrder: 80,
      },

      // CF（キャッシュフロー計算書）勘定
      {
        id: "CFO",
        code: "CFO",
        name: "営業活動によるCF",
        nameEn: "Cash Flow from Operations",
        fsType: "CF",
        accountType: "CASH_FLOW",
        isCredit: false,
        sortOrder: 100,
      },
      {
        id: "CFI",
        code: "CFI",
        name: "投資活動によるCF",
        nameEn: "Cash Flow from Investing",
        fsType: "CF",
        accountType: "CASH_FLOW",
        isCredit: false,
        sortOrder: 101,
      },
      {
        id: "CFF",
        code: "CFF",
        name: "財務活動によるCF",
        nameEn: "Cash Flow from Financing",
        fsType: "CF",
        accountType: "CASH_FLOW",
        isCredit: false,
        sortOrder: 102,
      },
    ];

    for (const account of standardAccounts) {
      this.accounts.set(account.id, account);
      this.accountsByCode.set(account.code, account);
    }

    this.initialized = true;
    console.log(
      `GlobalAccountMaster: ${standardAccounts.length}件の勘定科目を登録しました`
    );
  }

  /**
   * IDで勘定科目を取得
   */
  getAccountById(id: string): GlobalAccount | undefined {
    if (!this.initialized) {
      throw new Error(
        "GlobalAccountMaster: 初期化されていません。initialize()を呼び出してください"
      );
    }
    return this.accounts.get(id);
  }

  /**
   * コードで勘定科目を取得
   */
  getAccountByCode(code: string): GlobalAccount | undefined {
    if (!this.initialized) {
      throw new Error(
        "GlobalAccountMaster: 初期化されていません。initialize()を呼び出してください"
      );
    }
    return this.accountsByCode.get(code);
  }

  /**
   * 財務諸表タイプで勘定科目を取得
   */
  getAccountsByFsType(fsType: "PL" | "BS" | "CF"): GlobalAccount[] {
    if (!this.initialized) {
      throw new Error(
        "GlobalAccountMaster: 初期化されていません。initialize()を呼び出してください"
      );
    }
    return Array.from(this.accounts.values())
      .filter((account) => account.fsType === fsType)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /**
   * 全勘定科目を取得
   */
  getAllAccounts(): GlobalAccount[] {
    if (!this.initialized) {
      throw new Error(
        "GlobalAccountMaster: 初期化されていません。initialize()を呼び出してください"
      );
    }
    return Array.from(this.accounts.values()).sort(
      (a, b) => a.sortOrder - b.sortOrder
    );
  }

  /**
   * 勘定科目の存在確認
   */
  hasAccount(id: string): boolean {
    return this.accounts.has(id);
  }
}

/**
 * 財務モデル計算クラス（複数のインスタンスが作成される）
 * 各モデル・シナリオごとに独立したインスタンスが必要
 */
class FinancialModel {
  private modelId: number;
  private scenarioId: number;
  private accountMaster: GlobalAccountMaster;

  constructor(modelId: number, scenarioId: number) {
    this.modelId = modelId;
    this.scenarioId = scenarioId;
    // シングルトンインスタンスを取得（全モデルで共有）
    this.accountMaster = GlobalAccountMaster.getInstance();
    console.log(`FinancialModel[${modelId}-${scenarioId}]: 作成されました`);
  }

  /**
   * 勘定科目名を取得（マスタから参照）
   */
  getAccountName(accountId: string): string {
    const account = this.accountMaster.getAccountById(accountId);
    return account ? account.name : `不明な勘定(${accountId})`;
  }

  /**
   * PL勘定の一覧を取得
   */
  getPLAccounts(): GlobalAccount[] {
    return this.accountMaster.getAccountsByFsType("PL");
  }

  /**
   * 計算を実行（例）
   */
  calculate(): void {
    console.log(
      `FinancialModel[${this.modelId}-${this.scenarioId}]: 計算を実行`
    );
    const plAccounts = this.getPLAccounts();
    console.log(`  → PL勘定科目数: ${plAccounts.length}件`);
    plAccounts.forEach((account) => {
      console.log(`    - ${account.code}: ${account.name}`);
    });
  }
}

// 実行例
function run() {
  console.log("=== シングルトンパターンの動作確認 ===\n");

  // 1. マスタを初期化（1回だけ）
  const master1 = GlobalAccountMaster.getInstance();
  master1.initialize();

  // 2. 別の参照で同じインスタンスを取得
  const master2 = GlobalAccountMaster.getInstance();
  console.log(`マスタインスタンスの同一性: ${master1 === master2}\n`);

  // 3. 複数の財務モデルを作成（各モデルで独立したインスタンス）
  const model1 = new FinancialModel(1, 100);
  const model2 = new FinancialModel(2, 200);
  const model3 = new FinancialModel(3, 300);

  console.log("\n=== 各モデルでの計算実行 ===");
  model1.calculate();
  console.log("");
  model2.calculate();
  console.log("");
  model3.calculate();

  // 4. マスタから直接勘定科目を取得
  console.log("\n=== マスタからの直接取得 ===");
  const cashAccount = master1.getAccountById("CASH");
  if (cashAccount) {
    console.log(`現金勘定: ${cashAccount.name} (${cashAccount.code})`);
  }

  const revenueByCode = master1.getAccountByCode("REV");
  if (revenueByCode) {
    console.log(
      `売上高（コード検索）: ${revenueByCode.name} (${revenueByCode.id})`
    );
  }

  const bsAccounts = master1.getAccountsByFsType("BS");
  console.log(`\nBS勘定科目数: ${bsAccounts.length}件`);

  // 5. シングルトンの利点の確認
  console.log("\n=== シングルトンの利点 ===");
  console.log("✓ 全モデルで同じマスタデータを共有");
  console.log("✓ メモリ効率: 1つのインスタンスのみ");
  console.log("✓ 一貫性: アプリケーション全体で同じ勘定科目定義");
  console.log("✓ 初期化コスト: 1回だけ実行");
}

run();
