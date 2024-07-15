import app from "./src/app";
import { config } from "./src/config/config";
import connectionDB from "./src/config/ds";

const startServer = async () => {
  await connectionDB();
  const port = config.port || 3000;

  app.listen(port, () => {
    console.log(`Server is listening on port: ${port}`);
  });
};

startServer();

export default app;
