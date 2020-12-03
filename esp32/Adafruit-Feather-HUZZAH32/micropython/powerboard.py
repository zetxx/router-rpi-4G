from network import WLAN, AP_IF, STA_IF
import ujson
# import uasyncio as asyncio
import logging
# import urequests as requests
from machine import Pin
import time

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("powerboard")
wifi = None
toBattery = None
mainLine = None
fromBattery = None
watchMainLine = None
watchBatteryLine = None
led = None

def getConfig(fn):
    log.info('=====================%s: %s==============================', 'read config', fn)
    with open(fn, 'r') as f:
        rawConfData = f.read()
    return ujson.loads(rawConfData)

def wifiAsAp():
    global wifi
    ap_if = WLAN(AP_IF)
    ap_if.active(True)
    ap_if.config(essid='hywcoinpo', channel=7, password='123456789')
    log.info('wifi as AP')
    wifi = ap_if

def wifiAsClient():
    global wifi
    config = getConfig('config.wifi.json')
    client_if = WLAN(STA_IF)
    client_if.active(True)
    client_if.connect(config['ssid'], config['passphrase'])
    log.info(client_if.ifconfig())
    wifi = client_if

def initPins():
    global toBattery, mainLine, fromBattery, watchMainLine, led
    log.info('=====================%s==============================', 'setup pins')
    config = getConfig('config.board.json')['pins']
    led = Pin(config['led'], Pin.OUT)
    led.on()
    toBattery = Pin(config['toBattery'], Pin.OUT, Pin.PULL_DOWN)
    fromBattery = Pin(config['fromBattery'], Pin.OUT, Pin.PULL_DOWN)
    mainLine = Pin(config['mainLine'], Pin.OUT, Pin.PULL_DOWN)

    watchMainLine = Pin(config['watchMainLine'], Pin.IN, Pin.PULL_DOWN)
    watchBatteryLine = Pin(config['watchBatteryLine'], Pin.IN, Pin.PULL_DOWN)

    toBattery.off()
    fromBattery.off()
    mainLine.off()
