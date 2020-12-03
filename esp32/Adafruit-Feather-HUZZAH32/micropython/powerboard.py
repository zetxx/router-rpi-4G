from network import WLAN, AP_IF, STA_IF
import ujson
import logging
import socket
from machine import Pin
import time

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("powerboard")
wifi = None
udpSock = None
toBattery = None
mainLine = None
fromBattery = None
watchMainLine = None
watchBatteryLine = None

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

def decide():
    log.info('=====================%s==============================', 'decission')
    udpMulticast('decission')
    toBattery.off()
    fromBattery.off()
    mainLine.off()
    time.sleep_ms(10)
    if watchMainLine.value() == 1:
        udpMulticast('mainLineUp')
        toBattery.on()
        mainLine.on()
    elif watchMainLine.value() == 0 and watchBatteryLine.value() == 1:
        udpMulticast('mainLineDownBatteryUp')
        fromBattery.on()
    else:
        udpMulticast('M:' + str(watchMainLine.value()) + '; B:' + str(watchBatteryLine.value()))

def initPins():
    global toBattery, mainLine, fromBattery, watchMainLine, watchBatteryLine
    log.info('=====================%s==============================', 'setup pins')
    udpMulticast('setup pins')
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

def udpMulticast(text):
    log.info('=====================%s===============%s===============', 'multicats', text)
    global udpSock
    if wifi.isconnected() and udpSock and wifi and wifi.ifconfig and len(wifi.ifconfig()) > 2:
        addr = '.'.join(wifi.ifconfig()[0].split('.')[:-1] + ['255'])
        udpSock.sendto(bytearray(text), (addr, 1900))

def init():
    initUdp()
    initPins()
    watchMainLine.irq(trigger=Pin.IRQ_FALLING | Pin.IRQ_RISING, handler=lambda t: decide())
    watchBatteryLine.irq(trigger=Pin.IRQ_FALLING | Pin.IRQ_RISING, handler=lambda t: decide())