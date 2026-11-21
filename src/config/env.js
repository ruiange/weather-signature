import { loadEnvFile } from 'node:process';

try {
    loadEnvFile();
} catch (error) {
    if (error.code !== 'ENOENT') throw error;
}
