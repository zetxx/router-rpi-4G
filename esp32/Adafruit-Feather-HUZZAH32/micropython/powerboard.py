from network import WLAN, AP_IF, STA_IF
import ujson
import uasyncio as asyncio
import logging
import urequests as requests
from machine import Pin
import time

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("powerboard")
wifi = None
toBattery = None
mainLine = None
fromBattery = None
powerLine = None
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

def getWifi():
    global wifi
    return wifi

def setupPins():
    global toBattery, mainLine, fromBattery, powerLine, led
    log.info('=====================%s==============================', 'setup pins')
    config = getConfig('config.board.json')['pins']
    led = Pin(config['led'], Pin.OUT)
    led.on()
    toBattery = Pin(config['toBattery'], Pin.OUT, Pin.PULL_DOWN)
    fromBattery = Pin(config['fromBattery'], Pin.OUT, Pin.PULL_DOWN)
    mainLine = Pin(config['mainLine'], Pin.OUT, Pin.PULL_DOWN)
    powerLine = Pin(config['powerLine'], Pin.IN, Pin.PULL_DOWN)

    toBattery.off()
    fromBattery.off()
    mainLine.off()

def powerState():
    global toBattery, mainLine, fromBattery, powerLine, led
    log.info('=====================%s==============================', 'state init')
    switchState = -1
    def change(lineState):
        global toBattery, mainLine, fromBattery, powerLine
        nonlocal switchState
        log.info('=====================%s(from=%i, to=%i)==============================', 'state change ask', switchState, lineState)
        if (switchState == lineState):
            log.info('=====================%s(from=%i, to=%i)==============================', 'state not change', switchState, lineState)
            return
        log.info('=====================%s(from=%i, to=%i)==============================', 'state change', switchState, lineState)
        switchState = lineState
        fromBattery.off()
        toBattery.off()
        mainLine.off()
        if lineState == 0:# if powerLine is down
            time.sleep_ms(70)
            fromBattery.on()
            time.sleep_ms(70)
        elif (lineState == 1):# if powerLine is up
            time.sleep_ms(70)
            mainLine.on()
            time.sleep_ms(70)
            toBattery.on()
            time.sleep_ms(70)
    led.off()
    change(powerLine.value())

    def powerGuard(p):
        print(p)
        log.info('=====================%s==============================', 'power guard triggered')
        change(p.value())

    powerLine.irq(trigger=Pin.IRQ_FALLING | Pin.IRQ_RISING, handler=powerGuard)

    return change

def main():
    setupPins()
    stateChanger = powerState()
