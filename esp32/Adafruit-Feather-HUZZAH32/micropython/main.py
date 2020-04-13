# install uasyncio
# import upip
# upip.install('micropython-uasyncio')
# upip.install('micropython-uasyncio.synchro')
# upip.install('micropython-uasyncio.queues')

import uasyncio as asyncio
from machine import Pin, Timer
from network import WLAN, STA_IF, AP_IF
import urequests as requests
import ujson
import socket

if 'config.json' not in os.listdir():
    ap_if = network.WLAN(network.AP_IF)
    ap_if.config(essid='My AP', channel=7, password='123456789')
    ap_if.active()
    addr = socket.getaddrinfo('0.0.0.0', 80)[0][-1]
    s = socket.socket()
    s.bind(addr)
    s.listen(1)
    print('listening on', addr)
else
    with open('config.json', 'r') as f:
        rawConfData = f.read()
    config = ujson.loads(rawConfData)
    endpointChecks = []

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

    async def checkEndpoint():
        print('=====================checkEndpoint==============================')
        if wlan.isconnected():
            global endpointChecks
            statusCode = 0
            try:
                r = requests.get(config['healtz']['endpoint'])
                statusCode = r.status_code
                r.close()
            except:
                print('=====================checkEndpoint:request exeption==============================')
            finally:
                if statusCode != 200:
                    print('=====================checkEndpoint=!200==============================')
                    endpointChecks.append(1)
                    if len(endpointChecks) > config['healtz']['maxChecks']:
                        print('=====================checkEndpoint=endpointChecks>3==============================')
                        endpointChecks = []
                        resetLoad()
                else:
                    endpointChecks = []
                    print('=====================checkEndpoint=200==============================')
        else:
            netConn()

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
