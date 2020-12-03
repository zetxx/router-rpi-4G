# import main
from machine import Pin, Timer
import os
import logging
import powerboard
import gc

led = Pin(13, Pin.OUT)

gc.collect()
led.on()

logging.basicConfig(level=logging.INFO)
log = logging.getLogger('main')

try:
    if 'config.wifi.json' not in os.listdir():
        powerboard.wifiAsAp()
    else:
        log.info('=====================%s==============================', 'Init')
        powerboard.wifiAsClient()
        powerboard.init()
except OSError as e:
    log.error('=====================%s==============================', e)

def blink(n = None):
    if led.value() == 1:
        led.off()
    else:
        led.on()
Timer(1).init(mode=Timer.PERIODIC, period=400, callback=blink)