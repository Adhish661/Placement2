import mongoose from 'mongoose';
import dns from 'dns';

const connectDB = async () => {
  try {
    // Some Windows environments block the system DNS resolver for SRV queries.
    // Force Node's dns module to use public DNS servers (can be overridden via env).
    const dnsServers = [process.env.DNS1 || '8.8.8.8', process.env.DNS2 || '1.1.1.1'];
    dns.setServers(dnsServers);
    console.log('🔎 DNS servers set to', dns.getServers());

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // keep sensible defaults; allow server selection timeout to fail fast when unreachable
      serverSelectionTimeoutMS: 10000
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

