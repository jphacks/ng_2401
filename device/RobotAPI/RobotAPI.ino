#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <ESP32Servo.h>

// BLE用
#define SERVICE_UUID        "55725ac1-066c-48b5-8700-2d9fb3603c5e"
#define CHARACTERISTIC_UUID "69ddb59c-d601-4ea4-ba83-44f679a670ba"
#define BLE_DEVICE_NAME     "WriteRobot"

BLEServer *pServer = NULL;
BLECharacteristic *pCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;

// Servo用
Servo servoRight;
Servo servoLeft;
int rightPin = 25;
int leftPin = 26;

int period = 20000;
int minUs = 550;
int maxUs = 2450;

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
      for (int i = 0; i < value.length(); i++) {
        Serial.print("Received Value: ");
        Serial.print(value[i], HEX);
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
  servoRight.write(0);
  servoLeft.write(180);

  // 安定するまで待つ
  delay(1000);
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
