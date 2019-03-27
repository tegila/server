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
  socket.on("hash", (hash) => {
    console.log(`receiving hash: ${hash}`);
    const nonce = Math.random();

    const hash_1 = crypt.hash_message({ hash, nonce });
    console.log(`hash_1: ${hash_1}`);

    socket.once(hash_1, (payload) => {
      console.log(`receiving data: ${payload}`);
      console.dir(payload);
      const hash_2 = crypt.hash_message(payload);
      console.log(`hash_2: ${hash_2}`);

      j2m
      .exec(payload.message)
      .then(ret => {
        // stage 3
        socket.emit(hash_2, ret);
        console.log(`sending return: ${ret}`);
        // broadcast if it's a save, update or delete
        // io.sockets.in(data.collection).emit("message", data);
      })
      .catch(console.log);
    });
    // stage 2
    socket.emit(hash, nonce);
    console.log(`sending nonce: ${nonce}`);
  });
});
