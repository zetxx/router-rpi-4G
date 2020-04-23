from network import WLAN, AP_IF, STA_IF
import ujson
import uasyncio as asyncio
import logging
import urequests as requests
from machine import Pin

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("powerboard")
wifi = None

def getConfig(fn):
    log.info('=====================%s==============================', 'read config')
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

def powerState():
    log.info('=====================%s==============================', 'state init')
    config = getConfig('config.board.json')['pins']
    toBattery = Pin(config['toBattery'], Pin.OUT, Pin.PULL_DOWN)
    fromBattery = Pin(config['fromBattery'], Pin.OUT, Pin.PULL_DOWN)
    mainLine = Pin(config['mainLine'], Pin.OUT, Pin.PULL_DOWN)
    powerLine = Pin(config['powerLine'], Pin.IN, Pin.PULL_DOWN)

    def change(lineState):
        nonlocal toBattery, mainLine, fromBattery
        log.info('=====================%s(%i)==============================', 'state change', lineState)
        if lineState == 0:# if line is down
            toBattery.off()
            mainLine.off()
            fromBattery.on()
        elif (lineState == 1):# if line is up
            fromBattery.off()
            toBattery.on()
            mainLine.on()
        elif (lineState == 2):# cut power
            fromBattery.off()
            toBattery.off()
            mainLine.off()

    def powerGuard(p):
        log.info('=====================%s==============================', 'power guard triggered')
        change(p.value())

    powerLine.irq(trigger=Pin.IRQ_FALLING | Pin.IRQ_RISING, handler=lambda p: powerGuard(p))

    return change

async def checkEndpoint(stateChanger):
    global wifi
    log.info('=====================%s==============================', 'checkEndpoint init')
    config = getConfig('config.board.json')['remote']['healtz']
    endpointChecks = []

    def checker():
        nonlocal endpointChecks
        if wifi.isconnected():
            statusCode = 0
            try:
                r = requests.get(config['endpoint'])
                statusCode = r.status_code
                r.close()
            except:
                log.error('=====================%s==============================', 'checkEndpoint:request exeption')
            finally:
                if statusCode != 200:
                    log.info('=====================%s==============================', 'checkEndpoint=!200')
                    endpointChecks.append(1)
                    if len(endpointChecks) > config['maxChecks']:
                        log.info('=====================%s==============================', 'checkEndpoint=endpointChecks>3')
                        endpointChecks = []
                        stateChanger(2)
                else:
                    endpointChecks = []
                    log.info('=====================%s==============================', 'checkEndpoint=200')
        else:
            wifiAsClient()

    return checker

def main():
    stateChanger = powerState()
    asyncio.get_event_loop().run_until_complete(checkEndpoint(stateChanger))