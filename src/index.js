const logger = process.env.DEBUG ? console.log : null;

const port = process.env.PORT || 3000;
const io = require("socket.io")(port);

const J2M = require("j2m");
const j2m = J2M(`mongodb://${process.env.DATABASE_URL || "localhost"}:27017`);

const crypt = require("common")();
crypt.init_keypair();

io.sockets.on("connection", function(socket) {
  logger("connected");

  socket.on("join", function(collection) {
    logger("joining room", collection);
    socket.join(collection);
  });

  socket.on("leave", function(collection) {
    logger("leaving room", collection);
    socket.leave(collection);
  });

  // stage 1
  socket.on("message_hash", (message_hash) => {
    logger(`receiving message_hash: ${message_hash}`);
    const nonce = Math.random();

    const message_hash_nonce = crypt.hash_message({ message_hash, nonce });
    logger(`message_hash_nonce: ${message_hash_nonce}`);

    socket.once(message_hash_nonce, (payload) => {
      logger(`receiving data: ${payload}`);
      console.dir(payload);
      const payload_hash = crypt.hash_message(payload);
      logger(`payload_hash: ${payload_hash}`);

      j2m
      .exec(payload.message)
      .then(ret => {
        // stage 3
        socket.emit(payload_hash, ret);
        logger(`sending return: ${ret}`);
        // broadcast if it's a save, update or delete
        // io.sockets.in(data.collection).emit("message", data);
      })
      .catch(logger);
    });
    // stage 2
    socket.emit(message_hash, nonce);
    logger(`sending nonce: ${nonce}`);
  });
});
