#include <NimBLEDevice.h>
#include <ESP32Servo.h>

#include <GxEPD2_BW.h>
#include <Fonts/FreeMonoBold9pt7b.h>

// Epaper
// ESP32の接続はこちら SS=5,SCL(SCK)=18,SDA(MOSI)=23,BUSY=15,RST=2,DC=19
GxEPD2_BW<GxEPD2_213_BN, GxEPD2_213_BN::HEIGHT> display(GxEPD2_213_BN(/*CS=5*/ SS, /*DC=*/ 17, /*RST=*/ 16, /*BUSY=*/ 4)); // DEPG0213BN 122x250, SSD1680, TTGO T5 V2.4.1, V2.3.1

// BLE用
#define SERVICE_UUID        "55725ac1-066c-48b5-8700-2d9fb3603c5e"
#define CHARACTERISTIC_UUID "69ddb59c-d601-4ea4-ba83-44f679a670ba"
#define BLE_DEVICE_NAME     "WriteRobot"

NimBLEServer *pServer = NULL;
NimBLECharacteristic *pCharacteristic = NULL;
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

void executeServo(int left, int right) {
  servoLeft.write(left);
  servoRight.write(right);
  delay(1000);
}

// 特定のパターンに沿って実行
void rotateServo(int code) {
  if (code == 0) {
    executeServo(90, 90);
    executeServo(90, 55);
    executeServo(125, 0);
    executeServo(170, 10);
    executeServo(0, 55);
    executeServo(135, 60);
    executeServo(90, 90);
  } else if (code == 1) {
    executeServo(90, 90);
    executeServo(180, 0);
  }
}

// BLE Utils
class ServerCallbacks: public NimBLEServerCallbacks {
  void onConnect(NimBLEServer *pServer) {
    deviceConnected = true;
    drawDisplay("Connect");
    servoLeft.write(110);
    servoRight.write(70);
    Serial.println("onConnect");
  };
  void onDisconnect(NimBLEServer *pServer) {
    deviceConnected = false;
    drawDisplay("Disconnect");
    Serial.println("onDisconnect");
  };
};

class CharacteristicCallbacks: public NimBLECharacteristicCallbacks {
  // Writeされた時
  void onWrite(NimBLECharacteristic *pCharacteristic) {
    Serial.println("onWrite");
    String value = pCharacteristic->getValue();
    if (value.length() > 0) {
      Serial.print("Received Value: ");
      drawDisplay(value.c_str());
      for (int i = 0; i < value.length(); i++) {
        int hexValue = (int)value[i];
        Serial.print(hexValue - 48);
        Serial.print(' ');
        rotateServo(hexValue - 48);
        delay(1000);
      }     
      Serial.println();
    }
  }
};

// Epaper
void drawDisplay(const char* message) {
  //Serial.println("helloWorld");
  display.setRotation(1);
  display.setFont(&FreeMonoBold9pt7b);
  display.setTextColor(GxEPD_WHITE);

  const char* name = "Leonardo da Hukkin";
  int16_t tbx, tby; uint16_t tbw, tbh;
  display.getTextBounds(name, 0, 0, &tbx, &tby, &tbw, &tbh);
  // center bounding box by transposition of origin:
  uint16_t x = ((display.width() - tbw) / 2) - tbx;
  uint16_t y = ((display.height() - tbh) / 2) - tby;
  // full window mode is the initial mode, set it anyway
  display.setFullWindow();

  display.fillScreen(GxEPD_BLACK);
  display.setTextSize(1);
  display.setCursor(x, 20);
  display.print(name);

  display.setTextSize(2);
  display.getTextBounds(message, 0, 0, &tbx, &tby, &tbw, &tbh);
  x = ((display.width() - tbw) / 2) - tbx;
  display.setCursor(x, y + 20);
  display.print(message);

  display.display(false); // full update
}

void resetDisplay() {
  display.setRotation(1);
  display.setFont(&FreeMonoBold9pt7b);
  display.setTextColor(GxEPD_BLACK);

  // おそらくディスプレイを初期化してるけどあんまよくわからん
  display.setFullWindow();
  display.firstPage();
  do {
    // スクリーン白紙
    display.fillScreen(GxEPD_WHITE);
  }  // nextPageは存在しないがないと動かない
  while (display.nextPage());
}

void setup() {
  Serial.begin(115200);
  // EPaper初期化
  display.init(115200, true, 2, false);
  drawDisplay("Hello World");

  NimBLEDevice::init(BLE_DEVICE_NAME);
  pServer = NimBLEDevice::createServer();
  pServer->setCallbacks(new ServerCallbacks());

  NimBLEService *pService = pServer->createService(SERVICE_UUID);

  pCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID,
    NIMBLE_PROPERTY::WRITE  |
    NIMBLE_PROPERTY::NOTIFY
  );

  pCharacteristic->setCallbacks(new CharacteristicCallbacks());
  pService->start();

  BLEAdvertising *pAdvertising = NimBLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(false);
  pAdvertising->setMinPreferred(0x0);
  BLEDevice::startAdvertising();

  Serial.println("End Setup");


  // サーボセットアップ
  servoRight.setPeriodHertz(period);
  servoLeft.setPeriodHertz(period);
  servoRight.attach(rightPin, minUs, maxUs);
  servoLeft.attach(leftPin, minUs, maxUs);

  // 初期値は開いている状態にする
  servoRight.write(initAngle);
  servoLeft.write(initAngle);
  Serial.println("Servo setuped");
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
