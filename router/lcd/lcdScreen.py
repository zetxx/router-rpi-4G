###/home/zetxx/dotfiles/home/zetxx/router/minecraftia-regular.ttf
# import Adafruit_GPIO.SPI as SPI
import Adafruit_SSD1306
from PIL import Image
from PIL import ImageDraw
from PIL import ImageFont


font=ImageFont.truetype('/home/zetxx/dotfiles/home/zetxx/router/minecraftia-regular.ttf', 8)
# Raspberry Pi pin configuration:
RST = 24
# Note the following are only used with SPI:
DC = 23
SPI_PORT = 0
SPI_DEVICE = 0
# 128x64 display with hardware I2C:
disp = Adafruit_SSD1306.SSD1306_128_64(rst=RST)
 Initialize library.
disp.begin()
# Clear display.
disp.clear()
disp.display()

width = disp.width
height = disp.height
image = Image.new('1', (width, height))
# Get drawing object to draw on image.
draw = ImageDraw.Draw(image)
# Draw a black filled box to clear the image.
draw.rectangle((0,0,width,height), outline=0, fill=0)


draw.text((x, top), "alabala",  font=font, fill=255)

disp.image(image)
disp.display()
