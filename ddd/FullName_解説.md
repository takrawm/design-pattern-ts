# FullName.cs 解説（C#初心者向け）

## 概要

このクラスは「フルネーム（姓名）」を表現する Value Object（値オブジェクト）です。
DDD（ドメイン駆動設計）では、値オブジェクトは不変（イミュータブル）で、等価性比較が重要です。

## コードの各部分の解説

### 1. クラス宣言

```csharp
class FullName: IEquatable<FullName>
```

- `class FullName`: `FullName`という名前のクラスを定義
- `: IEquatable<FullName>`: `IEquatable<FullName>`インターフェースを実装
  - このインターフェースは、`FullName`同士を効率的に比較するための`Equals`メソッドを要求します

### 2. コンストラクタ

```csharp
public FullName(string firstName, string lastName) {
    FirstName = firstName;
    LastName = lastName;
}
```

- `public FullName(...)`: コンストラクタ（インスタンス作成時に呼ばれる）
- `string firstName, string lastName`: 名前と姓を受け取る
- `FirstName = firstName`: プロパティに値を設定（初期化）

### 3. プロパティ（読み取り専用）

```csharp
public string FirstName {get; }
public string LastName {get; }
```

- `public string`: 公開された文字列型のプロパティ
- `{get; }`: getter のみ（読み取り専用）
- `set;`がないため、一度設定したら変更できない（不変性）

### 4. Equals メソッド（IEquatable<T>の実装）

```csharp
public bool Equals(FullName other) {
    if (ReferenceEquals(other, null)) return false;  // nullチェック
    if (ReferenceEquals(this, other)) return true;   // 同じ参照ならtrue
    return string.Equals(FirstName, other.FirstName) &&
           string.Equals(LastName, other.LastName);   // 値の比較
}
```

- `ReferenceEquals(other, null)`: `other`が`null`かチェック
- `ReferenceEquals(this, other)`: 同じオブジェクト参照かチェック（最適化）
- `string.Equals(...)`: 文字列の値が等しいか比較（大文字小文字を区別）

### 5. Equals メソッド（object 型用のオーバーライド）

```csharp
public override bool Equals(object obj) {
    if (ReferenceEquals(obj, null)) return false;
    if (ReferenceEquals(this, obj)) return true;
    if (GetType() != obj.GetType()) return false;  // 型チェック
    return Equals((FullName)obj);  // FullName型にキャストして比較
}
```

- `override`: 親クラス（`object`）の`Equals`メソッドを上書き
- `GetType() != obj.GetType()`: 型が異なる場合は`false`
- `(FullName)obj`: `obj`を`FullName`型にキャスト（型変換）

### 6. GetHashCode メソッド（オーバーライド）

```csharp
public override int GetHashCode() {
    unchecked {
        return ((FirstName != null ? FirstName.GetHashCode() : 0) * 397) ^
               (LastName != null ? LastName.GetHashCode() : 0);
    }
}
```

- `GetHashCode()`: ハッシュコードを返す（辞書やセットで使用）
- `unchecked`: オーバーフローをチェックしない（パフォーマンス向上）
- `* 397`: ハッシュ値の分散を良くするための素数
- `^`: XOR 演算子（ビット単位の排他的論理和）
- `!= null ? ... : 0`: null の場合は 0 を返す（三項演算子）

## 重要なポイント

1. **不変性（Immutability）**: プロパティに`set;`がないため、一度作成したら変更できない
2. **等価性比較**: `Equals`メソッドで値による比較が可能
3. **ハッシュコード**: `GetHashCode`を実装することで、`Dictionary`や`HashSet`で正しく動作する
4. **Value Object**: DDD では、値オブジェクトは値による等価性が重要

## 使用例

```csharp
var name1 = new FullName("太郎", "山田");
var name2 = new FullName("太郎", "山田");
var name3 = new FullName("花子", "山田");

Console.WriteLine(name1.Equals(name2));  // true（値が同じ）
Console.WriteLine(name1.Equals(name3));  // false（値が異なる）
```
