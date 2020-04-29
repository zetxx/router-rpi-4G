import os
import logging
import powerboard
import gc

gc.collect()

logging.basicConfig(level=logging.INFO)
log = logging.getLogger('main')

try:
	if 'config.wifi.json' not in os.listdir():
		powerboard.wifiAsAp()
	else:
		log.info('=====================%s==============================', 'Init')
		powerboard.wifiAsClient()
		powerboard.main()
except OSError as e:
	log.error('=====================%s==============================', e)
