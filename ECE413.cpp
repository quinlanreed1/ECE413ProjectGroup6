/******************************************************/
//       THIS IS A GENERATED FILE - DO NOT EDIT       //
/******************************************************/

#line 1 "c:/Users/igfj8/OneDrive/Documents/ECE413/ECE413/src/ECE413.ino"
#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"
#include "spo2_algorithm.h"
#include "Particle.h"

void takeMeasurement(int32_t* spo2, int32_t* heartRate);
void saveMeasurement(float spo2, float heartRate);
int retrieveAllMeasurements(int send_data);
void clearAllMeasurements();
void myHandler(const char *event, const char *data);
void setup();
void loop();
void flashRGBGreen();
void flashRGBYellow();
void flashRGBBlue();
void flashRGBPurple();
#line 7 "c:/Users/igfj8/OneDrive/Documents/ECE413/ECE413/src/ECE413.ino"
#define MAX_MEASUREMENTS 32   // 64 floats = 32 pairs of (spo2, heartRate)
#define EEPROM_START 0        // Start address in EEPROM


#define MAX_READINGS 100

SYSTEM_THREAD(ENABLED);
SYSTEM_MODE(AUTOMATIC);    // Let Device OS manage the connection to the Particle Cloud
// Show system, cloud connectivity, and application logs over USB
// View logs with CLI using 'particle serial monitor --follow'
SerialLogHandler logHandler(LOG_LEVEL_INFO);

MAX30105 particleSensor;

const byte RATE_SIZE = 4; //Increase this for more averaging. 4 is good.
byte rates[RATE_SIZE]; //Array of heart rates
byte rateSpot = 0;
long lastBeat = 0; //Time at which the last beat occurred

float beatsPerMinute;
int beatAvg;

int counter = 0;
const int led = D7;


String dataBuffer[10]; // Buffer for 10 readings
int bufferIndex = 0;

int32_t spo2; //SPO2 value
int8_t validSPO2; //indicator to show if the SPO2 calculation is valid
int32_t heartRate; //heart rate value
int8_t validHeartRate; //indicator to show if the heart rate calculation is valid

uint32_t irBuffer[100]; //infrared LED sensor data
uint32_t redBuffer[100];  //red LED sensor data

char data[128];     // storage for data collected from sensors

unsigned long lastCheckTime = 0; // Variable to store the last recorded time
const unsigned long interval = 86400000; // 24 hours in milliseconds

struct Measurement {
    uint32_t timestamp; // Unix timestamp when the reading was taken
    uint16_t redValues[MAX_READINGS]; // Red LED sensor readings
    uint16_t irValues[MAX_READINGS]; // IR LED sensor readings
    
    float spo2;       // SpO2 value
    float heartRate;  // Heart rate value
};


int currentMeasurementIndex = 0; // Tracks the current position in EEPROM

// Enum for state machine states
enum State {
    WAITING_FOR_MEASUREMENT,
    MEASURING_DATA,
    WAITING_FOR_WIFI_CONNECTION,
    UPLOAD_DATA,
    STORE_LOCALLY,
    TIMEOUT,
    LED_FLASH_BLUE,
    LED_FLASH_GREEN,
    LED_FLASH_YELLOW,
    WAITING_FOR_TIME_WINDOW
};

// Define initial state
State currentState = WAITING_FOR_MEASUREMENT;
unsigned long lastMeasurementTime = 0;
unsigned long measurementInterval = 30 * 60 * 1000; // 30 minutes
unsigned long timeoutLimit = 5 * 60 * 1000; // 5 minutes

void takeMeasurement(int32_t* spo2, int32_t* heartRate) {

    // Function to gather 100 samples of red and IR values
    for (int i = 0; i < MAX_READINGS; i++) {
        // Replace this with your sensor data reading logic
        redBuffer[i] = particleSensor.getRed();
        irBuffer[i] = particleSensor.getIR();
        particleSensor.nextSample(); // Move to the next sample
    }
    
    // Simulated function to calculate spo2 and heartRate
    maxim_heart_rate_and_oxygen_saturation(irBuffer, 100, redBuffer, spo2, &validSPO2, heartRate, &validHeartRate);

    if (!validSPO2 || !validHeartRate) {
        *spo2 = -1;     // Mark invalid measurements
        *heartRate = -1;
    }
}

void saveMeasurement(float spo2, float heartRate) {
    if (currentMeasurementIndex >= MAX_MEASUREMENTS) {
        Serial.println(F("EEPROM full! No more measurements can be saved."));
        return;
    }

    // Create a measurement pair
    Measurement m;
    m.spo2 = spo2;
    m.heartRate = heartRate;

    // Calculate EEPROM address to save this pair
    int address = EEPROM_START + (currentMeasurementIndex * sizeof(Measurement));

    // Save the measurement to EEPROM
    EEPROM.put(address, m);

    // Increment the index for the next measurement
    currentMeasurementIndex++;

    Serial.printlnf("Measurement saved: SpO2=%.2f, HeartRate=%.2f", spo2, heartRate);
}

int retrieveAllMeasurements(int send_data) {
    Serial.println(F("\nChecking for data collected offline:"));
    
    if (currentMeasurementIndex == 0) {
        return 0; // Exit the function early
    }
    else {
        for (int i = 0; i < currentMeasurementIndex; i++) {
            int address = EEPROM_START + (i * sizeof(Measurement));
            Measurement m;
            EEPROM.get(address, m);
    
            Serial.printlnf("Measurement %d: SpO2=%.2f, HeartRate=%.2f", i + 1, m.spo2, m.heartRate);
            
            if(send_data == 1) {
                //sendDataToServer(); // If connected to Wi-Fi, send data to server
                String Send_Data = "{\"spo2\":" + String(m.spo2) + ",\"heartRate\":" + String(m.heartRate) + "}";
                Particle.publish("Pulse_and_BloodOxygen", Send_Data, PRIVATE);
                delay(5000);       // Wait for 5 seconds
            }
        }
        return 1;
    }
}

void clearAllMeasurements() {
    // Loop through all stored measurements
    for (int i = 0; i < currentMeasurementIndex; i++) {
        int address = EEPROM_START + (i * sizeof(Measurement));
        
        // Overwrite the EEPROM memory with zeros (or some default value)
        Measurement blank = {0, 0}; // Default empty Measurement
        EEPROM.put(address, blank);
    }

    // Reset the index to 0 to indicate no measurements are stored
    currentMeasurementIndex = 0;

    Serial.println(F("\nAll measurements cleared from EEPROM!\n"));
}


void myHandler(const char *event, const char *data) {
  // Handle the integration response
}

void setup()
{
    Serial.begin(115200);
    Serial.println("Initializing...");
    
    pinMode(led, OUTPUT);
    RGB.control(true);
    Time.zone(-7); // Set to UTC-7 (Arizona time)
    delay(1000);
    
     // Check if this is the first run
    EEPROM.get(EEPROM_START + (MAX_MEASUREMENTS * sizeof(Measurement)), currentMeasurementIndex);

    
    // Simulate Wi-Fi connection (check if connected)
    WiFi.connect();

    // Initialize sensor
    if(!particleSensor.begin(Wire, I2C_SPEED_FAST)) //Use default I2C port, 400kHz speed
    {
        Serial.println(F("MAX30105 was not found. Please check wiring/power. "));
        while (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
            // flash Purple for RGB LED
            flashRGBPurple();
        }
    }
    Serial.println(F("Place your index finger on the sensor with steady pressure."));

    particleSensor.setup(); //Configure sensor with default settings
    particleSensor.setPulseAmplitudeRed(0x0A); //Turn Red LED to low to indicate sensor is running
    particleSensor.setPulseAmplitudeGreen(0); //Turn off Green LED
    
    // Subscribe to the integration response event
    //Particle.subscribe("hook-response/Pulse_and_BloodOxygen", myHandler, MY_DEVICES);

}

void loop()
{
    // Buffer to hold 100 readings
    uint16_t redBuffer[MAX_READINGS];
    uint16_t irBuffer[MAX_READINGS];

    int currentHour = Time.hour(); // Get the current hour in 24-hour format
    
    unsigned long currentMillis = millis();   // for keeping track of 24 hour period

     // State machine logic
    switch (currentState) {
        case WAITING_FOR_MEASUREMENT: {
                // Check if in 5min measurement interval and if the time window is correct
                if (millis() - lastMeasurementTime >= measurementInterval && (currentHour >= 6 && currentHour < 22)) {
                    currentState = LED_FLASH_BLUE; // Flash blue LED to indicate measurement request
                }
                else {
                    currentState = WAITING_FOR_TIME_WINDOW;
                }
        } break;

        case LED_FLASH_BLUE: {
                // Flash the blue LED to signal user to take measurement
                Serial.println(F("\nPlace finger on sensor to measure..."));
                unsigned long startTime = millis();
                while(millis() - startTime < timeoutLimit) {
                    flashRGBBlue();
                    
                    long irValue = particleSensor.getIR();
                
                    if (irValue >= 50000) {
                        currentState = MEASURING_DATA;
                        lastMeasurementTime = millis();  // Update the time of the last measurement
                        break;
                    }
                    
                    if (millis() - startTime >= timeoutLimit) {
                        lastMeasurementTime = millis();  // Update the time of the last measurement
                        currentState = TIMEOUT;
                        break;
                    }
                }
             
        } break;

        case MEASURING_DATA: {
                // Start heart rate measurement
                takeMeasurement(&spo2, &heartRate);
            
                currentState = WAITING_FOR_WIFI_CONNECTION; // Check for Wi-Fi before uploading
            
            } break;

        case WAITING_FOR_WIFI_CONNECTION: {
                // Check if device is connected to Wi-Fi
                if (WiFi.ready()) {
                    currentState = UPLOAD_DATA; // If connected, upload data
                } else {
                    currentState = STORE_LOCALLY; // If not connected, store data locally
                }
        } break;

        case UPLOAD_DATA: {
        
                if(retrieveAllMeasurements(1) == 0) {
                     Serial.println("No measurements found!\n");
                }
                
                // Upload the data to the server
                String Send_Data = "{\"spo2\":" + String(spo2) + ",\"heartRate\":" + String(heartRate) + "}";
                Particle.publish("Pulse_and_BloodOxygen", Send_Data, PRIVATE);
                delay(2000);       // Wait for 30 seconds
                
                // Include API Key and ensure successful submission

                Serial.print(F("\nNew Data SPO2="));
                Serial.print(spo2, DEC);
                        
                Serial.print(F(", HR="));
                Serial.print(heartRate, DEC);
                        
                Serial.print(F("\n"));
                
                currentState = LED_FLASH_GREEN; // Flash green LED to indicate success
                
        } break;

        case STORE_LOCALLY: {
                // Store data locally for later upload
                saveMeasurement(spo2, heartRate);
                
                // Update the last check time to the current time
                lastCheckTime = currentMillis;
                        
                Serial.print(F("\nData stored locally untill Wi-Fi is back\n"));
                
                // Flash yellow LED to indicate local storage
                currentState = LED_FLASH_YELLOW;
        } break;

        case TIMEOUT: {
                // If 5 minutes pass without a measurement, show timeout state
                Serial.print(F("\nTIMEOUT!! No measurement taken.\n"));
                // Handle any necessary cleanup or retry logic
                currentState = WAITING_FOR_MEASUREMENT;
        } break;

        case LED_FLASH_GREEN: {
                // Flash the green LED to indicate successful upload
                flashRGBGreen();
                delay(1000);  // Flash for 1 second
                
                currentState = WAITING_FOR_MEASUREMENT; // Return to waiting for next measurement
        } break;

        case LED_FLASH_YELLOW: {
                // Flash the yellow LED to indicate data is stored locally
                flashRGBYellow();
                delay(1000);  // Flash for 1 second
                
                currentState = WAITING_FOR_MEASUREMENT; // Return to waiting for next measurement
        } break;

        case WAITING_FOR_TIME_WINDOW: {
                if (currentHour >= 6 && currentHour < 22) {
                    currentState = WAITING_FOR_MEASUREMENT; // Proceed with measurement request
                }
                else {
                    // Wait until the configured time window for measurements (e.g., 6 AM to 10 PM)
                    Serial.print(F("\nThe time is outside of 6 AM to 10 PM.\n"));
                    // Flash purple
                    flashRGBPurple();
                }
        } break;
    }
    
    
    

    // Check if 24 hours have passed to delete all saved data that was kept for 24hours
    if (currentMillis - lastCheckTime >= interval) {
        Serial.println(F("\n_________________________________________"));
        if(retrieveAllMeasurements(0) == 1) {
            Serial.println(F("\n24 hours is up!!!"));
            clearAllMeasurements();
        }
        lastCheckTime = currentMillis;
    }
}



/////// Flashing colors //////
void flashRGBGreen() {
    int count = 0;
    while(count < 3) {
    // flash green for RGB LED
        RGB.color(0, 255, 0);   // Green
        delay(500); // Keep it on for 500ms
        RGB.color(0, 0, 0);   // Turn off the LED
        delay(500);
        count++;
    }                  
    
}

void flashRGBYellow() {
    int count = 0;
    while(count < 3) {
    // flash Yellow for RGB LED
        RGB.color(255, 255, 0);   // Green
        delay(500); // Keep it on for 500ms
        RGB.color(0, 0, 0);   // Turn off the LED
        delay(500);
        count++;
    }                  
}

void flashRGBBlue() {
    // flash Blue for RGB LED
    RGB.color(0, 0, 255);   // Green
    delay(500); // Keep it on for 500ms
    RGB.color(0, 0, 0);   // Turn off the LED
    delay(500);
}

void flashRGBPurple() {
    // flash Blue for RGB LED
    RGB.color(255, 0, 255);   // Green
    delay(500); // Keep it on for 500ms
    RGB.color(0, 0, 0);   // Turn off the LED
    delay(500);
}
