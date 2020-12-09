from network import WLAN, AP_IF, STA_IF
import ujson
import logging
import socket
from machine import Pin, Timer
import time
import utime

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("powerboard")
wifi = None
udpSock = None
toBattery = None
mainLine = None
fromBattery = None
watchMainLine = None
watchBatteryLine = None
mainTimer = 0
stats = {
    "id": 0,
    "ids": []
}

def setStats(key, value):
    global stats
    if key not in stats:
        stats[key] = []
    stats[key].append(value)
    stats[key] = stats[key][-100:]
    ct = utime.time()
    stats['ids'].append(ct)
    stats['ids'] = stats['ids'][-100:]
    stats['id'] = ct

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

def dummy(p = None):
    log.info('=====================%s==============================', 'dummy trigger')

def decide(p = None):
    log.info('=====================%s==============================', 'decide')
    multicast('decission')
    toBattery.off()
    fromBattery.off()
    mainLine.off()
    time.sleep_ms(20)
    log.info('=====================%s==============================', 'decide wake up')
    if watchMainLine.value() == 1:
        multicast('mainLineUp')
        toBattery.on()
        mainLine.on()
        setStats('mainLineUp', utime.time())
    elif watchMainLine.value() == 0 and watchBatteryLine.value() == 1:
        multicast('mainLineDownBatteryUp')
        fromBattery.on()
        setStats('mainLineDownBatteryUp', utime.time())
    else:
        multicast('M:' + str(watchMainLine.value()) + '; B:' + str(watchBatteryLine.value()))
        setStats('mainLineDownBatteryDown', utime.time())
    log.info('=====================%s==============================', 'decision got')

def initPins():
    global toBattery, mainLine, fromBattery, watchMainLine, watchBatteryLine
    log.info('=====================%s==============================', 'setup pins')
    multicast('setup pins')
    config = getConfig('config.board.json')['pins']
    toBattery = Pin(config['toBattery'], Pin.OUT, Pin.PULL_DOWN)
    fromBattery = Pin(config['fromBattery'], Pin.OUT, Pin.PULL_DOWN)
    mainLine = Pin(config['mainLine'], Pin.OUT, Pin.PULL_DOWN)

    watchMainLine = Pin(config['watchMainLine'], Pin.IN, Pin.PULL_DOWN)
    watchBatteryLine = Pin(config['watchBatteryLine'], Pin.IN, Pin.PULL_DOWN)

    decide()

def initUdp():
    global udpSock
    log.info('=====================%s==============================', 'init udp')
    udpSock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    udpSock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    udpSock.bind(('', 1900))
    time.sleep_ms(100)

def multicast(text):
    global udpSock
    if wifi.isconnected() and udpSock and wifi and wifi.ifconfig and len(wifi.ifconfig()) > 2:
        addr = '.'.join(wifi.ifconfig()[0].split('.')[:-1] + ['255'])
        udpSock.sendto(bytearray(text), (addr, 1900))

def prepareDelay(p = None):
    global mainTimer
    log.info('=====================%s==============================', 'prepareDelay')
    if mainTimer == 0:
        mainTimer = 1
        Timer(3).init(mode=Timer.ONE_SHOT, period=50, callback=delayedDecision)

def delayedDecision(p = None):
    global mainTimer
    log.info('=====================%s==============================', 'delayedDecision')
    mainTimer = 0
    decide()

def init():
    initUdp()
    initPins()
    watchMainLine.irq(trigger=Pin.IRQ_FALLING | Pin.IRQ_RISING, handler=prepareDelay)
    watchBatteryLine.irq(trigger=Pin.IRQ_FALLING | Pin.IRQ_RISING, handler=prepareDelay)
    Timer(2).init(mode=Timer.PERIODIC, period=30000, callback=lambda x: multicast(ujson.dumps(stats)))