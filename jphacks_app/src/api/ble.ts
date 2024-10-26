

//UUID登録 使うサービスとcharacteristicのUUIDを登録する
const serviceUUID = '55725ac1-066c-48b5-8700-2d9fb3603c5e';
//デバイスからのデータCharacteristic
const CharacteristicUUID = '69ddb59c-d601-4ea4-ba83-44f679a670ba';

// BLE接続用
let keyService: any;
let keyCharacteristic: any;

/**
 * web bluetooth api
 * bluetooth接続機器をスキャンする
 */
export const startScan = async () =>  {
  // 動くのでエラーは無視
  const options: RequestDeviceOptions = {
    acceptAllDevices: true,
    optionalServices: [serviceUUID]
  }
  // 動くのでエラーは無視
  const device = await navigator.bluetooth.requestDevice(options);

   // startModal('接続中…');
   //接続
  console.log("device.id    : " + device.id);
  console.log("device.name  : " + device.name);
  console.log("device.uuids : " + device.uuids);
  const server = await device.gatt.connect();
  
  // サービスを取得
  console.log('Getting service...');  
  const service = await server.getPrimaryService(serviceUUID);
  keyService = service;

  //Characteristicを取得
  console.log('Getting Notification Characteristic...');
  const characteristics = await service.getCharacteristics();
  keyCharacteristic = characteristics[0];
};

// 送信する値
//  A  B  C  D  E  F  G  H  I  J  K  L  M  N  O  P  Q  R  S  T  
// 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 
export const writeCharacteristics = (msg: string) => {
  keyService.getCharacteristic(CharacteristicUUID)
      .then((characteristic: any) => {
          keyCharacteristic = characteristic;
          const encoder = new TextEncoder();
          const encodedMsg = encoder.encode(msg);
          keyCharacteristic.writeValue(encodedMsg);
      })
};

export const onDisconnect = () => {
    console.log('> Bluetooth Device disconnected')
};

