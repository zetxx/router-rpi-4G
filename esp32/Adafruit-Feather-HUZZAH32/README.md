# Espruino
- https://www.espruino.com/ESP32
- https://learn.adafruit.com/adafruit-huzzah32-esp32-feather

## [flash latest firmware](https://www.espruino.com/binaries/travis/master/espruino_esp32.bin)

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
## drawback
- device not going to sleep when no load, it gets very hot

# Micropython
- http://docs.micropython.org/en/latest/esp32/tutorial/intro.html#getting-the-firmware

## [flash latest firmware](https://micropython.org/download#esp32)

