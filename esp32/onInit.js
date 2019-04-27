function onInit () {
    const watchPin = D14;
    const batteryPin = D15;
    const powerPin = D33;
    [batteryPin, powerPin].map((pin) => pin.mode('output'));
    watchPin.mode('input');

    const stateChange = (pin) => {
        console.log('watched pin state:', pin);
        if (pin.state) {
            powerPin.write(true);
            batteryPin.write(false);
        } else {
            powerPin.write(false);
            batteryPin.write(true);
        }
    };

    stateChange({state: watchPin.read()});

    setWatch (stateChange, watchPin, {debounce: 50, repeat: true, edge: 'both', data: watchPin});
}
