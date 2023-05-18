import { httpTerminator, server } from '../server';
import { connection } from 'mongoose';

class ExitHandler {
  async handleExit(code, timeout = 5000) {
    try {
      console.log(`Attempting a graceful shutdown with code ${code}`);

      setTimeout(() => {
        console.log(`Forcing a shutdown with code ${code}`);
        process.exit(code);
      }, timeout).unref();

      if (server.listening) {
        console.log('Terminating HTTP connections');
        await httpTerminator.terminate();
      }

      connection.on('open', async () => {
        console.log('Closing database connection');

        await connection.close();
      });

      console.log(`Exiting gracefully with code ${code}`);
      process.exit(code);
    } catch (error) {
      console.log('Error shutting down gracefully');
      console.log(error);
      console.log(`Forcing exit with code ${code}`);
      process.exit(code);
    }
  }
}

export const exitHandler = new ExitHandler();
