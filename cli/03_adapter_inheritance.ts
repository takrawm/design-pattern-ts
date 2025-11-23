export {};

interface Target {
  getCsvData(): string;
}

class NewLibrary {
  getJsonData() {
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

class JsonToCsvAdapter extends NewLibrary implements Target {
  getCsvData(): string {
    const jsonData = this.getJsonData();
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
  const adapter = new JsonToCsvAdapter();
  console.log("=== Adapterに変換されたデータ ===");
  console.log(adapter.getCsvData());
}

run();
