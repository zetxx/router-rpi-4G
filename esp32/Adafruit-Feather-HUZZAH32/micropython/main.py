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
        chargeLine.off()
        powerLine.off()
        batteryLine.on()
    else:# if line is up
        batteryLine.off()
        chargeLine.on()
        powerLine.on()

def resetLoad():
    print('=====================resetLoad==============================')
    Timer(-2).init(period=10000, mode=Timer.ONE_SHOT, callback=lambda t: powerWatch(highPowerLine))
    powerLine.off()
    batteryLine.off()

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

print('=====================Init==============================')
wlan = WLAN(STA_IF)
wlan.active(True)

chargeLine = Pin(12, Pin.OUT, Pin.PULL_DOWN)
batteryLine = Pin(13, Pin.OUT, Pin.PULL_DOWN)
powerLine = Pin(14, Pin.OUT, Pin.PULL_DOWN)
highPowerLine = Pin(15, Pin.IN, Pin.PULL_DOWN)
netConn()
powerWatch(highPowerLine)
highPowerLine.irq(trigger=Pin.IRQ_FALLING | Pin.IRQ_RISING, handler=powerWatch)
Timer(-1).init(period=30000, mode=Timer.PERIODIC, callback=lambda t: asyncio.get_event_loop().run_until_complete(checkRpi()))
