export {};

// ========================================
// 理想的な知識範囲（クライアントコードが知るべき範囲）
// ========================================
//
// 使う側（クライアントコード）が知っている必要があるのは、次のものだけ：
//
// 1. Targetインターフェースについて：
//    - getCsvData(): stringメソッド: CSV形式のデータを取得する
//    - このインターフェースを実装したオブジェクトを使用できる
//
// 2. JsonToCsvAdapterクラスについて：
//    - Targetインターフェースを実装している
//    - getCsvData(): stringメソッドでCSVデータを取得できる
//    - コンストラクタでNewLibraryのインスタンスを受け取る
//
// 知らなくてよいもの：
//    - NewLibraryクラスの存在（既存システムの実装詳細）
//    - NewLibraryのgetJsonData()メソッドの存在
//    - Adapter内部でのJSONからCSVへの変換処理
//    - データ変換のアルゴリズム
//    - Adapteeという用語やパターンの詳細

// ========================================
// Targetインターフェース（クライアントが期待するインターフェース）
// ========================================

/**
 * Targetインターフェース
 *
 * クライアントコードが期待するインターフェース。
 * CSV形式のデータを取得するメソッドを定義している。
 *
 * クライアントコードはこのインターフェースを知っていれば、
 * CSVデータを取得できる
 */
interface Target {
  /**
   * CSV形式のデータを取得する
   * クライアントコードはこのメソッドを使用してCSVデータを取得する
   *
   * @returns CSV形式の文字列データ
   */
  getCsvData(): string;
}

// ========================================
// Adapteeクラス（既存システム - クライアントは知る必要がない）
// ========================================

/**
 * NewLibraryクラス（Adaptee）
 *
 * 既存のライブラリで、JSON形式のデータしか提供できない。
 * クライアントコードはこのクラスの存在を知る必要がない（実装の詳細）。
 *
 * Adapterパターンにより、このクラスをTargetインターフェースに適合させる。
 */
class NewLibrary {
  /**
   * JSON形式のデータを取得する
   * クライアントコードはこのメソッドの存在を知る必要がない
   *
   * @returns JSON形式のデータ配列
   */
  getJsonData(): Array<{ data1: string; data2: string }> {
    // 実際の実装では、外部APIやデータベースからJSONデータを取得
    return [
      {
        data1: "json_dataA",
        data2: "json_dataB",
      },
      {
        data1: "json_dataC",
        data2: "json_dataD",
      },
    ];
  }
}

// ========================================
// Adapterクラス（委譲パターン）
// ========================================

/**
 * JsonToCsvAdapterクラス（Adapter - 委譲パターン）
 *
 * Adapterパターンの役割：
 * 1. Targetインターフェースを実装して、クライアントが期待する形式を提供
 * 2. Adaptee（NewLibrary）を内部で使用して、データを変換
 * 3. クライアントコードを既存システムの変更から保護
 *
 * クライアントコードはこのクラスを使用して、JSONデータをCSV形式で取得できる
 */
class JsonToCsvAdapter implements Target {
  /**
   * Adapteeのインスタンスを保持
   * クライアントコードはこの存在を知る必要がない（実装の詳細）
   */
  constructor(private adaptee: NewLibrary) {}

  /**
   * CSV形式のデータを取得する（Targetインターフェースの実装）
   *
   * 内部でAdapteeのgetJsonData()を呼び出し、JSONデータをCSV形式に変換する。
   * クライアントコードはこのメソッドを使用してCSVデータを取得する。
   *
   * @returns CSV形式の文字列データ
   */
  getCsvData(): string {
    // AdapteeからJSONデータを取得
    const jsonData = this.adaptee.getJsonData();

    // JSONデータをCSV形式に変換
    // ヘッダー行を作成
    const header = Object.keys(jsonData[0]).join(",") + "\n";

    // データ行を作成
    const body = jsonData
      .map((d) => {
        return Object.keys(d)
          .map((key) => d[key as keyof typeof d])
          .join(",");
      })
      .join("\n");

    return header + body;
  }
}

// ========================================
// クライアントコード
// ========================================

/**
 * CSVデータを処理するクライアントクラス
 *
 * このクラスはTargetインターフェースだけを知っていれば、
 * CSVデータを処理できる。
 * NewLibraryやJsonToCsvAdapterの実装詳細を知る必要はない。
 */
class CsvDataProcessor {
  /**
   * CSVデータを処理する
   *
   * @param target Targetインターフェースを実装したオブジェクト
   */
  processCsvData(target: Target): void {
    console.log("=== CSVデータの処理 ===");
    const csvData = target.getCsvData();
    console.log(csvData);
    console.log("処理完了\n");
  }
}

/**
 * クライアントコードの例
 *
 * この関数は以下のことを知らずに動作する：
 * - NewLibraryクラスの存在
 * - NewLibraryのgetJsonData()メソッドの存在
 * - Adapter内部でのJSONからCSVへの変換処理
 * - データ変換のアルゴリズム
 *
 * 知っている必要があるのは：
 * - TargetインターフェースのgetCsvData()メソッド
 * - JsonToCsvAdapterクラスの使用方法
 */
function run() {
  console.log("=== Adapterパターン: インターフェースの適合 ===\n");

  // ========================================
  // 1. Adapteeが提供するデータ（参考表示）
  // ========================================
  console.log("【例1: Adapteeが提供するデータ（参考）】");
  const adaptee = new NewLibrary();
  console.log("JSON形式のデータ:");
  console.log(JSON.stringify(adaptee.getJsonData(), null, 2));
  console.log("→ クライアントコードはこの形式を直接扱えない\n");

  // ========================================
  // 2. Adapterを使用してCSVデータを取得
  // ========================================
  console.log("【例2: Adapterを使用してCSVデータを取得】");
  const adapter = new JsonToCsvAdapter(adaptee);
  console.log("CSV形式のデータ:");
  console.log(adapter.getCsvData());
  console.log("→ Adapterにより、TargetインターフェースでCSVデータを取得できる\n");

  // ========================================
  // 3. クライアントコードでの使用例
  // ========================================
  console.log("【例3: クライアントコードでの使用例】");
  const processor = new CsvDataProcessor();
  processor.processCsvData(adapter);
  console.log("→ クライアントコードはTargetインターフェースだけを知っていれば使用できる\n");

  // ========================================
  // 4. 複数のAdapteeインスタンスに対応
  // ========================================
  console.log("【例4: 複数のAdapteeインスタンスに対応】");
  const adaptee1 = new NewLibrary();
  const adaptee2 = new NewLibrary();
  const adapter1 = new JsonToCsvAdapter(adaptee1);
  const adapter2 = new JsonToCsvAdapter(adaptee2);

  console.log("Adapter1のCSVデータ:");
  console.log(adapter1.getCsvData());
  console.log("\nAdapter2のCSVデータ:");
  console.log(adapter2.getCsvData());
  console.log("→ 各AdapteeインスタンスごとにAdapterを作成できる\n");

  // ========================================
  // Adapterパターンの利点の説明
  // ========================================
  console.log("=== Adapterパターンの利点 ===");
  console.log("✓ 既存システムを変更せずに、新しいインターフェースに適合可能");
  console.log("✓ クライアントコードを既存システムの変更から保護");
  console.log("✓ 異なるインターフェースを持つシステムを統一的に扱える");
  console.log("✓ 既存システムの実装詳細を隠蔽できる");
  console.log("✓ テスト時にモックオブジェクトを簡単に差し替え可能");

  // ========================================
  // クライアントが知るべきことのまとめ
  // ========================================
  console.log("\n=== クライアントが知るべきこと ===");
  console.log("✓ TargetインターフェースのgetCsvData()メソッド");
  console.log("✓ JsonToCsvAdapterクラスの使用方法");
  console.log("✓ AdapterのコンストラクタでNewLibraryのインスタンスを渡す方法");
  console.log("\n=== クライアントが知らなくてよいこと ===");
  console.log("✗ NewLibraryクラスの存在（既存システムの実装詳細）");
  console.log("✗ NewLibraryのgetJsonData()メソッドの存在");
  console.log("✗ Adapter内部でのJSONからCSVへの変換処理");
  console.log("✗ データ変換のアルゴリズム");
  console.log("✗ Adapteeという用語やパターンの詳細");
}

run();

