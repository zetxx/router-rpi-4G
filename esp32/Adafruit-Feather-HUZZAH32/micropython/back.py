def checkEndpoint(stateChanger):
    global wifi
    log.info('=====================%s==============================', 'checkEndpoint init')
    config = getConfig('config.board.json')['remote']['healtz']
    endpointChecks = []

    async def checker():
        nonlocal endpointChecks
        log.info('=====================%s==============================', 'checkEndpoint.check')
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
                        await asyncio.sleep(5)
                        stateChanger(powerLine.value())
                else:
                    endpointChecks = []
                    log.info('=====================%s==============================', 'checkEndpoint=200')
        else:
            wifiAsClient()

        await asyncio.sleep(5)
        return await checker()

    return checker

def ledInit():
    global led
    log.info('=====================%s==============================', 'led init')
    led = Pin(getConfig('config.board.json')['pins']['led'], Pin.OUT)
    loop = None

    async def toggle(sleepTime):
        global led
        while True:
            log.info('=====================led toggle==============================')
            await asyncio.sleep_ms(sleepTime)
            led.on()
            await asyncio.sleep_ms(sleepTime)
            led.off()

    def change(to, sleepTime = 300):
        log.info('=====================led change to: %i for: %i==============================', to, sleepTime)
        global led
        nonlocal loop
        if (loop != None):
            loop.close()
        if (to == 0):
            led.off()
        else:
            led.off()
            loop = asyncio.get_event_loop()
            loop.create_task(toggle(sleepTime))
            loop.run_forever()
    
    return change
