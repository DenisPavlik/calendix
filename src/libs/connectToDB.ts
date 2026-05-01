import mongoose from "mongoose";

let isConnected = false;

export async function connectToDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI as string);
  isConnected = true;

  // Drop stale global unique index on uri — replaced by compound (email+uri) index
  await mongoose.connection.db
    ?.collection("eventtypes")
    .dropIndex("uri_1")
    .catch(() => {});
}
