/**
 *
 * @type {module.RageConfig}
 */
module.exports = class RageConfig {
  /**
   *
   * @param {object} options
   */
  constructor(options) {
    if (!options) {
      throw new Error('No options found !');
    }
    this.maxRage = options.maxRage ? options.maxRage : 10;
    this.minRage = options.minRage ? options.minRage : 0;
    this.baseRoute = options.baseRoute ? options.baseRoute : '/';
    this.minutesToWait = options.minutesToWait ? options.minutesToWait : 5;
    this.jwtConfig = options.jwtConfig ? options.jwtConfig : null;
  }
};
