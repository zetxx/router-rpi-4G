import uasyncio as asyncio
import webrepl
from machine import Pin, Timer
from network import WLAN, STA_IF, AP_IF
import ujson
import os
import logging
import powerboard

try:
	logging.basicConfig(level=logging.INFO)
	log = logging.getLogger('main')
	if 'config.json' not in os.listdir():
		powerboard.preconf()
		webrepl.start()
	else:
		with open('config.json', 'r') as f:
			rawConfData = f.read()
		config = ujson.loads(rawConfData)

		log.info('=====================%s==============================', 'Init')
		wlan = WLAN(STA_IF)
		wlan.active(True)

		toBattery = Pin(12, Pin.OUT, Pin.PULL_DOWN)
		fromBattery = Pin(27, Pin.OUT, Pin.PULL_DOWN)
		powerLine = Pin(33, Pin.OUT, Pin.PULL_DOWN)
		powerGridDetection = Pin(32, Pin.IN, Pin.PULL_DOWN)
		powerboard.netConn(config, wlan)
		powerboard.powerWatch(powerGridDetection, toBattery, powerLine, fromBattery)
		# powerGridDetection.irq(trigger=Pin.IRQ_FALLING | Pin.IRQ_RISING, handler=lambda p: powerboard.powerWatch(p, toBattery, powerLine, fromBattery))
		Timer(-1).init(period=config['healtz']['checkInterval'], mode=Timer.PERIODIC, callback=lambda t: asyncio.get_event_loop().run_until_complete(powerboard.checkEndpoint(config, wlan)))

except OSError as e:
	log.error('=====================%s==============================', e)