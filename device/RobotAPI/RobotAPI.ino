#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <ESP32Servo.h>

#include <GxEPD2_BW.h>
#include <Fonts/FreeMonoBold9pt7b.h>

// BLE用
#define SERVICE_UUID        "55725ac1-066c-48b5-8700-2d9fb3603c5e"
#define CHARACTERISTIC_UUID "69ddb59c-d601-4ea4-ba83-44f679a670ba"
#define BLE_DEVICE_NAME     "WriteRobot"

BLEServer *pServer = NULL;
BLECharacteristic *pCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;

// Aを初期値として利用する
//  A  B  C  D  E  F  G  H  I  J  K  L  M  N  O  P  Q  R  S  T  
// 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 

// Servo用
Servo servoRight;
Servo servoLeft;
int rightPin = 32;
int leftPin = 33;

int period = 50;
int minUs = 550;
int maxUs = 2450;

int initAngle = 90;
int lefts[8] = {90, 90, 125, 10, 0, 135, 190, 180};
int rights[8] = {90, 55, 0, 10, 55, 60, 90, 180};

// 特定のパターンに沿って実行
void rotateServo(int code) {
  int left = lefts[code];
  int right = rights[code];

  servoLeft.write(left);
  servoRight.write(right);
  delay(1000);
}

// BLE Utils
class ServerCallbacks: public BLEServerCallbacks {
  void onConnect(BLEServer *pServer) {
    deviceConnected = true;
    Serial.println("onConnect");
  };
  void onDisconnect(BLEServer *pServer) {
    deviceConnected = false;
    Serial.println("onDisconnect");
  };
};

class CharacteristicCallbacks: public BLECharacteristicCallbacks {
  // Writeされた時
  void onWrite(BLECharacteristic *pCharacteristic) {
    Serial.println("onWrite");
    String value = pCharacteristic->getValue();
    if (value.length() > 0) {
      Serial.print("Received Value: ");
      for (int i = 0; i < value.length(); i++) {
        int hexValue = (int)value[i];
        Serial.print(hexValue);
        Serial.print(' ');
        rotateServo(41 - hexValue);
      }     
      Serial.println();
    }
  }
};

void setup() {
  Serial.begin(115200);

  // サーボセットアップ
  servoRight.setPeriodHertz(period);
  servoLeft.setPeriodHertz(period);
  servoRight.attach(rightPin, minUs, maxUs);
  servoLeft.attach(leftPin, minUs, maxUs);

  BLEDevice::init(BLE_DEVICE_NAME);
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new ServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);

  pCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_WRITE  |
    BLECharacteristic::PROPERTY_NOTIFY
  );

  pCharacteristic->setCallbacks(new CharacteristicCallbacks());
  pCharacteristic->addDescriptor(new BLE2902());

  pService->start();

  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(false);
  pAdvertising->setMinPreferred(0x0);
  BLEDevice::startAdvertising();

  Serial.println("End Setup");
  
  // 初期値は開いている状態にする
  servoRight.write(initAngle);
  servoLeft.write(initAngle);
}

void loop() {
  // disconnecting
  if(!deviceConnected && oldDeviceConnected){
    delay(500); // give the bluetooth stack the chance to get things ready
    pServer->startAdvertising();
    Serial.println("restartAdvertising");
    oldDeviceConnected = deviceConnected;
  }
  // connecting
  if(deviceConnected && !oldDeviceConnected){
    oldDeviceConnected = deviceConnected;
  }
}
