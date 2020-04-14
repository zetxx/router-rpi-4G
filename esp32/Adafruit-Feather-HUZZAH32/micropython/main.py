import uasyncio as asyncio
from machine import Pin, Timer
from network import WLAN, STA_IF, AP_IF
import ujson

with open('config.json', 'r') as f:
    rawConfData = f.read()
config = ujson.loads(rawConfData)
endpointChecks = []

print('=====================Init==============================')
wlan = WLAN(STA_IF)
wlan.active(True)

toBattery = Pin(12, Pin.OUT, Pin.PULL_DOWN)
fromBattery = Pin(27, Pin.OUT, Pin.PULL_DOWN)
powerLine = Pin(33, Pin.OUT, Pin.PULL_DOWN)
powerGridDetection = Pin(32, Pin.IN, Pin.PULL_DOWN)
netConn()
powerWatch(powerGridDetection)
powerGridDetection.irq(trigger=Pin.IRQ_FALLING | Pin.IRQ_RISING, handler=powerWatch)
Timer(-1).init(period=config['healtz']['checkInterval'], mode=Timer.PERIODIC, callback=lambda t: asyncio.get_event_loop().run_until_complete(checkEndpoint()))
