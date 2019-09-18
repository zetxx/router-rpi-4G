# Small controller for power management, so rpi can work without problems

needs to be done
- watch power line
- watch raspberry pi state
    - send requests to a specific port and host to check target host status
        - if target host responds: leave it as is
        - if target host not responds, cut power for period of time then power it ON
- switching power sources when needed
    - battery
    - power line

## device used

Adafruit Feather HUZZAH32 ESP32 - Wi-Fi, Bluetooth, CP2104 USB-UART, Li-Po charging port

## devices, libs
- https://www.espruino.com/ESP32
- https://learn.adafruit.com/adafruit-huzzah32-esp32-feather

# [flash latest firmware](https://www.espruino.com/binaries/travis/master/espruino_esp32.bin)

```bash
esptool.py    \
        --chip esp32                                \
        --port /dev/ttyUSB0                         \
        --baud 921600                               \
        --before default_reset                            \
        --after hard_reset write_flash              \
        -z                                          \
        --flash_mode dio                            \
        --flash_freq 40m                            \
        --flash_size detect                         \
        0x10000 espruino_esp32.bin
```
