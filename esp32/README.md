# Small controller for power management, so rpi can work without problems

needs to be done
- watch power line
- watch raspberry pi state
    - send requests to a specific port and host to check target host status
        - if target host responds: leave it as is
        - if target host not responds, cut power for period of time then power it ON
- switching power sources when needed
    - battery
    - power line

- [schematics](https://easyeda.com/zetxx/power-board)
- [logo]: https://photos.app.goo.gl/yxkKp1nXDG4eWBiA8 "work in progress"
