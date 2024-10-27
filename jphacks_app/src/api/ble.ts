// UUID登録 使うサービスとcharacteristicのUUIDを登録する
const serviceUUID = '55725ac1-066c-48b5-8700-2d9fb3603c5e';
// デバイスからのデータCharacteristic
const CharacteristicUUID = '69ddb59c-d601-4ea4-ba83-44f679a670ba';

// BLE接続用
let keyDevice: BluetoothDevice | null = null;
let keyService: BluetoothRemoteGATTService | null = null;
let keyCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;

/**
 * デバイスを選択するための関数
 */
export const requestDeviceOnly = async (): Promise<boolean> => {
  const options: RequestDeviceOptions = {
    acceptAllDevices: true,
    optionalServices: [serviceUUID]
  };
  
  try {
    const device = await navigator.bluetooth.requestDevice(options);
    keyDevice = device;
    console.log("Device selected:", device.name);
    return true;
  } catch (error) {
    console.error("Error in device selection:", error);
    return false;
  }
};

/**
 * 選択されたデバイスに接続する関数
 */
export const connectToDevice = async (): Promise<boolean> => {
  if (!keyDevice) return false;

  try {
    const server = await keyDevice.gatt.connect();
    const service = await server.getPrimaryService(serviceUUID);
    keyService = service;

    const characteristics = await service.getCharacteristics();
    keyCharacteristic = characteristics[0];
    console.log("Connected and service/characteristic acquired.");
    return true;
  } catch (error) {
    console.error("Error in connection:", error);
    return false;
  }
};

/**
 * メッセージを送信するための関数
 * 
 * @param msg - 送信する文字列
 */
export const writeCharacteristics = async (msg: string) => {
  if (!keyCharacteristic) {
    console.error("Characteristic not found.");
    alert("送信に失敗しました");
    return;
  }

  const encoder = new TextEncoder();
  const encodedMsg = encoder.encode(msg);

  try {
    await keyCharacteristic.writeValue(encodedMsg);
    alert("送信しました");
  } catch (error) {
    console.error('Error: ', error);
    alert("送信に失敗しました");
  }
};

/**
 * デバイスの接続を切断する関数
 */
export const onDisconnect = async (): Promise<boolean> => {
  if (!keyDevice || !keyDevice.gatt) return false;

  try {
    keyDevice.gatt.disconnect();
    console.log("Device disconnected.");
    return true;
  } catch (error) {
    console.error('Error: ', error);
    return false;
  }
};
