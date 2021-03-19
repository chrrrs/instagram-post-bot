const functions = require("firebase-functions");
const os = require("os");
const fs = require("fs");
const path = require("path");
const { decodeData } = require("PATH_TO_PASSWORD_DECODER");
const admin = require("firebase-admin");
const { Storage } = require("@google-cloud/storage");
const { init } = require("../../bot");

admin.initializeApp({
  credential: admin.credential.cert("./access-key.json"),
  databaseURL: "https://YOUR_FIREBASE_APP.firebaseio.com",
});

const gcs = new Storage({
  keyFilename: "./access-key.json",
});

exports.bot = functions
  .runWith({ memory: "1GB" })
  .pubsub.schedule("* * * * *")
  .onRun(async (_, response) => {
    const destinationBucket = gcs.bucket("gs://YOUR_FIREBASE_APP.appspot.com/");
    const now = admin.firestore.Timestamp.now();
    const db = admin.firestore();

    const query = db.collection("tasks").where("performAt", "<=", now);
    const tasks = await query.get();

    if (tasks.size === 0) response.end();

    tasks.forEach(async (snapshot, _) => {
      const job = snapshot.data();

      const user = await db
        .collection("users")
        .doc(job.id)
        .collection("accounts")
        .doc(job.type)
        .get();
      const userDetails = user.data();

      const tmpFilePath = path.join(
        os.tmpdir(),
        path.basename(job.imageStorageRef)
      );

      await destinationBucket
        .file(`${job.type}/${job.imageStorageRef}`)
        .download({
          destination: tmpFilePath,
        });

      /**
       *
       *
       *
       *
       * START THE BOT HERE
       *
       *
       */
      const username = decodeData(userDetails.email, job.id);
      const password = decodeData(userDetails.password, job.id);
      const filepath = tmpFilePath;
      const description = job.description;

      init(username, password, filepath, description);

      // Clean up images and remove tasks
      fs.unlinkSync(tmpFilePath);
      destinationBucket.file(`${job.type}/${job.imageStorageRef}`).delete();
      await db.collection("tasks").doc(job.docRef).delete();

      response.end();
    });
  });
