import os
import logging
import powerboard
import gc
gc.collect()

led = Pin(13, Pin.OUT)
led.on()

def main():

	logging.basicConfig(level=logging.INFO)
	log = logging.getLogger('main')

	try:
		if 'config.wifi.json' not in os.listdir():
			powerboard.wifiAsAp()
		else:
			log.info('=====================%s==============================', 'Init')
			powerboard.wifiAsClient()
			powerboard.init()
	except OSError as e:
		log.error('=====================%s==============================', e)


# if __name__ == '__main__':
#     print("main entered")
#     main()