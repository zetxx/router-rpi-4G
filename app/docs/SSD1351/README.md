# Next screen

## Links

- https://github.com/rm-hull/luma.oled/issues/174
- https://www.waveshare.com/w/upload/5/5b/1.5inch_RGB_OLED_Module_User_Manual_EN.pdf
- https://www.raspberrypi-spy.co.uk/wp-content/uploads/2012/06/Raspberry-Pi-GPIO-Layout-Model-B-Plus-rotated-2700x900.png
- https://www.freetronics.com.au/pages/oled128-quickstart-guide-raspberry-pi
- https://gitlab.com/ftmazzone/ssd1351

### Wiring

| SSD1351 pin    |RPi pin|RPi func          |
|----------------|:------|:-----------------|
| VCC            |   2   |   5V             |
| GND            |   6   |   GND            |
| DC             |   18  |  GPIO24          |
| DIN            |   19  |GPIO10(SPI0_MOSI) |
| RST            |   22  |  GPIO25          |
| CLK            |   23  |GPIO11(SPI0_SCLK) |
| CS             |   24  |GPIO8(SPI0_CEO_N) |
