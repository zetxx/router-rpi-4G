# import main
from machine import Pin, Timer
import os
import logging
import powerboard
import gc

pins = powerboard.getConfig('config.board.json')['pins']
led = Pin(pins['led'], Pin.OUT)

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
        Timer(4).init(mode=Timer.ONE_SHOT, period=100, callback=blink)
Timer(1).init(mode=Timer.PERIODIC, period=2000, callback=blink)
