/**
  * GUIA PARA SER USAR O CODIGO DO FLOWATER 
  * PRIMEIRO, BAIXE AS SEGUINTES BIBLIOTECAS : Adafruit_PCD8544, FreqCount Adafruit GFX LibraryAdafruit 
  * OBS : AS BIBLIOTECAS DEVEM SER USADAS NO APLICATIVO DO ARDUINO, JUNTO COM O CODIGO, AMBOS DEVEM SER USADOS NO 
  * APLICATIVO IDE DO ADUINO 
 */

//Fazendo chamadas das Bibliotecas 
#include < Adafruit_GFX.h >
  #include < Adafruit_PCD8544.h >
  #include < FreqCount.h >

  // Pinos para o display Nokia 5110
  #define PCD8544_DC 7
#define PCD8544_CS 6
#define PCD8544_RST 5

Adafruit_PCD8544 display =
  Adafruit_PCD8544(
    PCD8544_DC,
    PCD8544_CS,
    PCD8544_RST
  );

// Pino do sensor de fluxo de água
const int flowSensorPin = 2; // Sensor conectado ao pino digital 2

// Variáveis para cálculo
volatile uint32_t pulseCount = 0;
float flowRate = 0.0;
uint32_t totalMilliLiters = 0;
unsigned long oldTime = 0;

// Preço por litro de água
const float pricePerLiter = 0.005; // Exemplo de preço

void setup() {
  Serial.begin(9600);

  // Configura o pino do sensor de fluxo como entrada
  pinMode(flowSensorPin, INPUT);
  digitalWrite(flowSensorPin, HIGH);

  // Configura a interrupção para contar os pulsos
  attachInterrupt(digitalPinToInterrupt(flowSensorPin), pulseCounter, FALLING); // fazer a explicação dessa variavel

  // Inicializa o display Nokia 5110
  display.begin();
  display.setContrast(50);
  display.clearDisplay();
  display.display();
}

void loop() {
  // Calcula a taxa de fluxo de água
  if ((millis() - oldTime) > 1000) { // Atualiza a cada segundo
    detachInterrupt(digitalPinToInterrupt(flowSensorPin));

    // Calcula a taxa de fluxo em L/min
    flowRate = ((1000.0 / (millis() - oldTime)) * pulseCount) / 7.5;
    oldTime = millis();
    pulseCount = 0;

    // Atualiza a quantidade total de água
    totalMilliLiters += (flowRate / 60) * 1000;

    // Calcula o valor monetário correspondente
    float totalLiters = totalMilliLiters / 1000.0;
    float totalCost = totalLiters * pricePerLiter;

    // Exibe as informações no display
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(BLACK);
    display.setCursor(0, 0);
    display.print("Flow rate:");
    display.print(flowRate);
    display.println(" L/min");
    display.print("Total used:");
    display.print(totalLiters);
    display.println(" L");
    display.print("Cost:");
    display.print(totalCost);
    display.println(" USD");
    display.display();

    // Reativa a interrupção
    attachInterrupt(digitalPinToInterrupt(flowSensorPin), pulseCounter, FALLING);
  }
}

void pulseCounter() {
  pulseCount++;
}