const ping = require('net-ping');
const getPingStatusModel = require('../../../db/models/pingStatus');
const update = (host, time) => getPingStatusModel().create({host, time});

module.exports = (sequelize, host) => {
  setInterval(() => {
    Promise.resolve(ping.createSession())
      .then((session) => new Promise((resolve, reject) => (
        session.pingHost(host, (err, res, sent, rcvd) => (err && reject(err)) || resolve(rcvd - sent))
      )))
      .then((t) => update(host, t))
      .catch((res) => update(host, 0));
  }, 600000);
};
