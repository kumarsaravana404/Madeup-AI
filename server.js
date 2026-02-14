const app = require('./src/app');
const config = require('./src/config/env');
const logger = require('./src/utils/logger');

app.listen(config.PORT, () => {
  logger.info(`🚀 Server is running on http://localhost:${config.PORT}`);
  logger.info(`Environment: ${config.ENV}`);
});
