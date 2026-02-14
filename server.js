const app = require('./src/app');
const config = require('./src/config/env');
const logger = require('./src/utils/logger');

const PORT = 5000;
app.listen(PORT, () => {
  logger.info(`🚀 Server is running on http://localhost:${PORT}`);
  logger.info(`Environment: ${config.ENV}`);
});
