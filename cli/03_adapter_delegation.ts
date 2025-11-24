export {};

// 既存システムが期待するインターフェース
interface Target {
  getCsvData(): string; // CSV形式がほしい
}

class NewLibrary {
  getJsonData() {
    // でもJSON形式しか提供できない
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

class JsonToCsvAdapter implements Target {
  constructor(private adaptee: NewLibrary) {}
  getCsvData(): string {
    const jsonData = this.adaptee.getJsonData();
    const header = Object.keys(jsonData[0]).join(",") + "\n";
    const body = jsonData
      .map((d) => {
        return Object.keys(d)
          .map((key) => d[key])
          .join(",");
      })
      .join("\n");

    return header + body;
  }
}

function run() {
  const adaptee = new NewLibrary();
  console.log("=== Adapteeが提供するデータ ===");
  console.log(adaptee.getJsonData());

  console.log("");
  const adapter = new JsonToCsvAdapter(adaptee);
  console.log("=== Adapterに変換されたデータ ===");
  console.log(adapter.getCsvData());
}

run();
