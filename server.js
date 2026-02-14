const app = require('./src/app');
const config = require('./src/config/env');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`Environment: ${config.ENV}`);
});
