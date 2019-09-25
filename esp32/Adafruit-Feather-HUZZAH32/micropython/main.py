# install uasyncio
# import upip
# upip.install('micropython-uasyncio')
# upip.install('micropython-uasyncio.synchro')
# upip.install('micropython-uasyncio.queues')

import uasyncio as asyncio
from machine import Pin, Timer
from network import WLAN, STA_IF
import urequests as requests
import ujson

with open('config.json', 'r') as f:
    rawConfData = f.read()
config = ujson.loads(rawConfData)
rpiChecks = []

def powerWatch(p):
    print('=====================powerWatch==============================')
    if p.value() == 0:# if line is down
        toBattery.off()
        powerLine.off()
        fromBattery.on()
    else:# if line is up
        fromBattery.off()
        toBattery.on()
        powerLine.on()

def resetLoad():
    print('=====================resetLoad==============================')
    Timer(-2).init(period=10000, mode=Timer.ONE_SHOT, callback=lambda t: powerWatch(powerGridDetection))
    powerLine.off()
    fromBattery.off()

def netConn():
    print('=====================netCon==============================')
    if not wlan.isconnected():
        wlan.connect(config['wifi']['ssid'], config['wifi']['passphrase'])

async def checkRpi():
    print('=====================checkRpi==============================')
    if wlan.isconnected():
        global rpiChecks
        statusCode = 0
        try:
            r = requests.get(config['healtz']['rpi'])
            statusCode = r.status_code
            r.close()
        except:
            print('=====================checkRpi:request exeption==============================')
        finally:
            if statusCode != 200:
                print('=====================checkRpi=!200==============================')
                rpiChecks.append(1)
                if len(rpiChecks) > 3:
                    print('=====================checkRpi=rpiChecks>3==============================')
                    rpiChecks = []
                    resetLoad()
            else:
                rpiChecks = []
                print('=====================checkRpi=200==============================')
    else:
        netConn()

print('=====================Init==============================')
wlan = WLAN(STA_IF)
wlan.active(True)

toBattery = Pin(12, Pin.OUT, Pin.PULL_DOWN)
fromBattery = Pin(13, Pin.OUT, Pin.PULL_DOWN)
powerLine = Pin(14, Pin.OUT, Pin.PULL_DOWN)
powerGridDetection = Pin(15, Pin.IN, Pin.PULL_DOWN)
netConn()
powerWatch(powerGridDetection)
powerGridDetection.irq(trigger=Pin.IRQ_FALLING | Pin.IRQ_RISING, handler=powerWatch)
Timer(-1).init(period=30000, mode=Timer.PERIODIC, callback=lambda t: asyncio.get_event_loop().run_until_complete(checkRpi()))
