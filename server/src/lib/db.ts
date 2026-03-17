import mongoose from "mongoose";

let connecting: Promise<typeof mongoose> | null = null;

export async function connectMongo(mongoUri: string) {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (connecting) return connecting;

  connecting = mongoose.connect(mongoUri, {
    autoIndex: true,
  });

  try {
    return await connecting;
  } finally {
    connecting = null;
  }
}

