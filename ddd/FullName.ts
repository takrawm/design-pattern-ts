/**
 * FullName.ts - TypeScript版
 *
 * C#のFullName.csと同じ機能をTypeScriptで実装したもの
 * Value Object（値オブジェクト）として、フルネーム（姓名）を表現する
 */

/**
 * FullNameクラス
 *
 * DDD（ドメイン駆動設計）におけるValue Objectの実装
 * - 不変（イミュータブル）: 一度作成したら変更できない
 * - 値による等価性: 同じ値なら等しいとみなす
 */
class FullName {
  // 読み取り専用プロパティ（C#の {get; } に相当）
  public readonly firstName: string;
  public readonly lastName: string;

  /**
   * コンストラクタ
   * @param firstName 名前
   * @param lastName 姓
   */
  constructor(firstName: string, lastName: string) {
    this.firstName = firstName;
    this.lastName = lastName;
  }

  /**
   * 等価性比較メソッド（C#の IEquatable<T>.Equals に相当）
   *
   * 同じFullNameインスタンス同士を比較する
   * @param other 比較対象のFullNameインスタンス
   * @returns 等しい場合はtrue、そうでない場合はfalse
   */
  equals(other: FullName | null): boolean {
    // nullチェック（C#の ReferenceEquals(other, null) に相当）
    if (other === null || other === undefined) {
      return false;
    }

    // 同じ参照かチェック（C#の ReferenceEquals(this, other) に相当）
    if (this === other) {
      return true;
    }

    // 値の比較（C#の string.Equals に相当）
    return (
      this.firstName === other.firstName && this.lastName === other.lastName
    );
  }

  /**
   * オブジェクトとの等価性比較（C#の override bool Equals(object obj) に相当）
   *
   * TypeScriptでは、任意の型との比較が必要な場合に使用
   * @param obj 比較対象のオブジェクト
   * @returns 等しい場合はtrue、そうでない場合はfalse
   */
  equalsObject(obj: unknown): boolean {
    // nullチェック
    if (obj === null || obj === undefined) {
      return false;
    }

    // 同じ参照かチェック
    if (this === obj) {
      return true;
    }

    // 型チェック（C#の GetType() != obj.GetType() に相当）
    if (!(obj instanceof FullName)) {
      return false;
    }

    // FullName型に確定したので、equalsメソッドを呼び出す
    return this.equals(obj as FullName);
  }

  /**
   * ハッシュコードを取得（C#の override int GetHashCode() に相当）
   *
   * TypeScriptでは数値型のハッシュコードを返す
   * DictionaryやSetで使用する際に重要
   * @returns ハッシュコード（数値）
   */
  getHashCode(): number {
    // C#の実装を参考に、ハッシュコードを計算
    const firstNameHash =
      this.firstName !== null && this.firstName !== undefined
        ? this.hashString(this.firstName)
        : 0;
    const lastNameHash =
      this.lastName !== null && this.lastName !== undefined
        ? this.hashString(this.lastName)
        : 0;

    // C#の実装と同じロジック: (firstNameHash * 397) ^ lastNameHash
    // TypeScriptでは、^ はビット単位のXOR演算子
    return (firstNameHash * 397) ^ lastNameHash;
  }

  /**
   * 文字列のハッシュコードを計算（ヘルパーメソッド）
   *
   * TypeScriptには文字列のGetHashCode()がないため、独自実装
   * @param str ハッシュコードを計算する文字列
   * @returns ハッシュコード（数値）
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 32bit整数に変換
    }
    return hash;
  }

  /**
   * 文字列表現を取得（デバッグ用）
   * @returns フルネームの文字列表現
   */
  toString(): string {
    return `${this.lastName} ${this.firstName}`;
  }
}

// ========================================
// 使用例
// ========================================

function run() {
  console.log("=== FullNameクラスの使用例 ===\n");

  // インスタンスの作成
  const name1 = new FullName("太郎", "山田");
  const name2 = new FullName("太郎", "山田");
  const name3 = new FullName("花子", "山田");

  console.log("【等価性比較のテスト】");
  console.log(`name1: ${name1.toString()}`);
  console.log(`name2: ${name2.toString()}`);
  console.log(`name3: ${name3.toString()}\n`);

  console.log(`name1.equals(name2): ${name1.equals(name2)}`); // true（値が同じ）
  console.log(`name1.equals(name3): ${name1.equals(name3)}`); // false（値が異なる）
  console.log(`name1.equals(null): ${name1.equals(null)}`); // false（nullチェック）

  console.log("\n【ハッシュコードのテスト】");
  console.log(`name1.getHashCode(): ${name1.getHashCode()}`);
  console.log(`name2.getHashCode(): ${name2.getHashCode()}`);
  console.log(`name3.getHashCode(): ${name3.getHashCode()}\n`);

  // 同じ値なら同じハッシュコードになることを確認
  console.log(
    `name1とname2のハッシュコードが同じ: ${
      name1.getHashCode() === name2.getHashCode()
    }`
  );

  console.log("\n【不変性の確認】");
  console.log(`name1.firstName: ${name1.firstName}`);
  console.log(`name1.lastName: ${name1.lastName}`);
  // name1.firstName = "変更"; // エラー: readonlyプロパティは変更できない
  console.log(
    "→ readonlyプロパティのため、一度作成したら変更できない（不変性）"
  );
}

// 実行
run();
