#include <WiFiManager.h>
#include <WiFiClientSecure.h>
#include <ESPmDNS.h>
#include <ESP32Servo.h>

// API用
WiFiClientSecure client;
WiFiManager wifiManager;
WiFiServer server(80);

// Servo用
Servo servoRight;
Servo servoLeft;
int rightPin = 25;
int leftPin = 26;

int period = 20000;
int minUs = 550;
int maxUs = 2450;

void setup() {
  Serial.begin(115200);

  // サーボセットアップ
  servoRight.setPeriodHertz(period);
  servoLeft.setPeriodHertz(period);
  servoRight.attach(rightPin, minUs, maxUs);
  servoLeft.attach(leftPin, minUs, maxUs);
  
  // 初期値は開いている状態にする
  servoRight.write(0);
  servoLeft.write(180);
  delay(1000);
}

void loop() {
  int pos = 0;
  
  for (pos = 0; pos <= 90; pos++) {
    servoRight.write(pos);
    servoLeft.write(180-pos);
    delay(2);
  }
  delay(1000);
  for (pos = 90; pos >= 0; pos--) {
    servoRight.write(pos);
    servoLeft.write(180-pos);
    delay(2);
  }
  delay(1000);
  
}
