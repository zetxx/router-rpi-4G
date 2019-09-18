#micropython
from machine import Pin, Timer

def powerWatch(p):
    if p.value() == 0:# if line is down
        chargeLine.off()
        powerLine.off()
        batteryLine.on()
    else:# if line is up
        batteryLine.off()
        chargeLine.on()
        powerLine.on()

def resetLoad():
    tim.init(period=10000, mode=Timer.ONE_SHOT, callback=lambda t: powerWatch(highPowerLine))
    powerLine.off()
    batteryLine.off()

tim = Timer(-1)
chargeLine = Pin(12, Pin.OUT, Pin.PULL_DOWN)
batteryLine = Pin(13, Pin.OUT, Pin.PULL_DOWN)
powerLine = Pin(14, Pin.OUT, Pin.PULL_DOWN)
highPowerLine = Pin(15, Pin.IN, Pin.PULL_DOWN)
powerWatch(highPowerLine)
highPowerLine.irq(trigger=Pin.IRQ_FALLING | Pin.IRQ_RISING, handler=powerWatch)

# tim.init(period=5000, mode=Timer.ONE_SHOT, callback=lambda t: resetLoad())
