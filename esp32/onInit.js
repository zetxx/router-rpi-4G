const watchPin = D14;
const batteryPin = D15;
const powerPin = D33;

watchPin.mode('input');
powerPin.write(true);
batteryPin.write(false);

[batteryPin, powerPin].map((pin) => pin.mode('output'));

setWatch(
  (pin) => {
    console.log('listen pin state:', pin);
    if(pin.state) {
      powerPin.write(true);
      batteryPin.write(false);
    } else {
      powerPin.write(false);
      batteryPin.write(true);
    }
  },
  watchPin,
  {repeat: true, edge: 'both', data: watchPin}
);
