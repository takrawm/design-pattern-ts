export {};

// 理想的な知識範囲
// 使う側（クライアントコード）が知っている必要があるのは、次のものだけ：
//
// 1. Aggregateインターフェースについて：
//    - getIterator()メソッド: イテレータを取得する
//    - checkIn(patient: Patient)メソッド: データを追加する（この例では必要）
//    - WaitingRoomという具体的なクラス名は知らなくてもよい
//
// 2. IIteratorインターフェースについて：
//    - hasNext(): 次の要素が存在するかどうかを返す
//    - next(): 次の要素を取得する（戻り値は Patient | undefined）
//    - WaitingRoomIteratorという具体的なクラス名は知らなくてもよい
//
// 3. Patientクラスについて：
//    - データ型として知っている必要がある（new Patient()でインスタンスを作成するため）
//
// 4. ファクトリ関数について：
//    - createWaitingRoom(): Aggregate型のインスタンスを生成する関数
//    - 具象クラスの生成を隠蔽する役割

class Patient {
  constructor(public id: number, public name: string) {}
}

interface IIterator {
  hasNext(): boolean;
  next(): Patient | undefined;
}

interface Aggregate {
  // Aggregateインターフェースを実装するクラス（この例ではWaitingRoom）は、
  // 実際のデータ（patients配列）を保持することが想定される。
  // getIterator()で返されるイテレータは、そのデータにアクセスするために使われる。
  getIterator(): IIterator;
  checkIn(patient: Patient): void;
}

class WaitingRoom implements Aggregate {
  private patients: Patient[] = [];

  getPatient(): Patient[] {
    return this.patients;
  }
  getCount(): number {
    return this.patients.length;
  }
  checkIn(patient: Patient) {
    this.patients.push(patient);
  }
  // Aggregateインターフェースの実装
  getIterator(): IIterator {
    return new WaitingRoomIterator(this);
  }
}

class WaitingRoomIterator implements IIterator {
  private position: number = 0;

  constructor(private aggregate: WaitingRoom) {}

  hasNext(): boolean {
    return this.position < this.aggregate.getCount();
  }

  next(): Patient | undefined {
    if (!this.hasNext()) {
      console.log("患者がいません");
      return undefined;
    }
    const patient = this.aggregate.getPatient()[this.position];
    this.position++;
    return patient;
  }
}

/**
 * ファクトリ関数: Aggregateインスタンスを生成
 * クライアントコードは具象クラス名を知る必要がない
 */
function createWaitingRoom(): Aggregate {
  return new WaitingRoom();
}

function run() {
  // 具象クラスではなく、インターフェース型で宣言
  const waitingRoom: Aggregate = createWaitingRoom();
  waitingRoom.checkIn(new Patient(1, "Yamada"));
  waitingRoom.checkIn(new Patient(2, "Suzuki"));
  waitingRoom.checkIn(new Patient(3, "Tanaka"));

  // イテレータもインターフェース型で受け取る
  // WaitingRoomのデータに直接アクセスしていない。
  // 必要なのはgetIterator()で取得したイテレータだけで、
  // hasNext()とnext()を通じて間接的にデータにアクセス
  const iterator: IIterator = waitingRoom.getIterator();
  console.log(iterator.next());
  console.log(iterator.next());
  console.log(iterator.next());
  console.log(iterator.next());

  // もしWaitingRoomのデータに直接アクセスするなら
  // const patients = waitingRoom.getPatient(); // 配列を直接取得
  // console.log(patients[0]); // 配列のインデックスで直接アクセス
  // console.log(patients[1]);
  // console.log(patients[2]);
  // この方法だと、使う側は「内部が配列である」ことを知る必要があり、
  // インデックスでアクセスする方法を理解している必要がある
}

run();
