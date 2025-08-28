// Loads env files in a sane order for tests
import path from "path";
import dotenv from "dotenv";

// Highest priority: test-specific overrides (optional)
dotenv.config({ path: path.resolve(process.cwd(), ".env.test.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

// Then project envs
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
