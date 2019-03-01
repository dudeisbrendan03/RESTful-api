const col = require('./colours.js');

const log = {
    info: text => console.info(`${col.background.blue + col.foreground.white}[i] ${text}${col.reset + col.reset}`),
    error: text => console.warn(`${col.background.red + col.foreground.white}[e] ${text}${col.reset + col.reset}`),
    success: text => console.info(`${col.background.green + col.foreground.white}[s] ${text}${col.reset + col.reset}`),
    warn: text => console.warn(`${col.background.white + col.foreground.red}[w] ${text}${col.reset + col.reset}`),
    request: text => console.log(`${col.background.black + col.foreground.yellow}[r] ${text}${col.reset + col.reset}`)
};
module.exports = log;