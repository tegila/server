const port = process.env.PORT || 3000;
const io = require("socket.io")(port);

const J2M = require("j2m");
const j2m = J2M(`mongodb://${process.env.DATABASE_URL || "localhost"}:27017`);

const crypt = require("common")();
crypt.init_keypair();

io.sockets.on("connection", function(socket) {
  console.log("connected");

  socket.on("join", function(collection) {
    console.log("joining room", collection);
    socket.join(collection);
  });

  socket.on("leave", function(collection) {
    console.log("leaving room", collection);
    socket.leave(collection);
  });

  // stage 1
  socket.on("message_hash", (message_hash) => {
    console.log(`receiving message_hash: ${message_hash}`);
    const nonce = Math.random();

    const message_hash_nonce = crypt.hash_message({ message_hash, nonce });
    console.log(`message_hash_nonce: ${message_hash_nonce}`);

    socket.once(message_hash_nonce, (payload) => {
      console.log(`receiving data: ${payload}`);
      console.dir(payload);
      const payload_hash = crypt.hash_message(payload);
      console.log(`payload_hash: ${payload_hash}`);

      j2m
      .exec(payload.message)
      .then(ret => {
        // stage 3
        socket.emit(payload_hash, ret);
        console.log(`sending return: ${ret}`);
        // broadcast if it's a save, update or delete
        // io.sockets.in(data.collection).emit("message", data);
      })
      .catch(console.log);
    });
    // stage 2
    socket.emit(message_hash, nonce);
    console.log(`sending nonce: ${nonce}`);
  });
});
