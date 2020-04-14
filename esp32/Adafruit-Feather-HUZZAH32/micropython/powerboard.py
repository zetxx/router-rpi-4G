from machine import Timer
import urequests as requests
from network import WLAN, AP_IF
import logging

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("powerboard")

endpointChecks = []

def preconf():
    # if 'config.json' not in os.listdir():
    ap_if = network.WLAN(network.AP_IF)
    ap_if.config(essid='My AP', channel=7, password='123456789')
    ap_if.active()
    addr = socket.getaddrinfo('0.0.0.0', 80)[0][-1]
    s = socket.socket()
    s.bind(addr)
    s.listen(1)
    log.info('listening on', addr)

def powerWatch(powerGridDetection, toBattery, powerLine, fromBattery):
    log.info('=====================%s==============================', 'powerWatch')
    if powerGridDetection.value() == 0:# if line is down
        toBattery.off()
        powerLine.off()
        fromBattery.on()
    else:# if line is up
        fromBattery.off()
        toBattery.on()
        powerLine.on()

def resetLoad():
    log.info('=====================%s==============================', 'resetLoad')
    Timer(-2).init(period=10000, mode=Timer.ONE_SHOT, callback=lambda t: powerWatch(powerGridDetection))
    powerLine.off()
    fromBattery.off()

def netConn(config, wlan):
    log.info('=====================%s==============================', 'netCon')
    if not wlan.isconnected():
        wlan.connect(config['wifi']['ssid'], config['wifi']['passphrase'])

async def checkEndpoint(config, wlan):
    log.info('=====================%s==============================', 'checkEndpoint')
    if wlan.isconnected():
        global endpointChecks
        statusCode = 0
        try:
            r = requests.get(config['healtz']['endpoint'])
            statusCode = r.status_code
            r.close()
        except:
            log.error('=====================%s==============================', 'checkEndpoint:request exeption')
        finally:
            if statusCode != 200:
                log.info('=====================%s==============================', 'checkEndpoint=!200')
                endpointChecks.append(1)
                if len(endpointChecks) > config['healtz']['maxChecks']:
                    log.info('=====================%s==============================', 'checkEndpoint=endpointChecks>3')
                    endpointChecks = []
                    resetLoad()
            else:
                endpointChecks = []
                log.info('=====================%s==============================', 'checkEndpoint=200')
    else:
        netConn(config, wlan)
