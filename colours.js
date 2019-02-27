//global module
module.exports = {
  reset: '\033[0m',
  hicolour: '\033[1m',
  underline: '\033[4m',
  inverse: '\033[7m',
  blink: '\x1b[5m',

  foreground: {
      black: '\033[30m',
      red: '\033[31m',
      green: '\033[32m',
      yellow: '\033[33m',
      blue: '\033[34m',
      magenta: '\033[35m',
      cyan: '\033[36m',
      white: '\033[37m'
  },

  background: {
      black: '\033[40m',
      red: '\033[41m',
      green: '\033[42m',
      yellow: '\033[43m',
      blue: '\033[44m',
      magenta: '\033[45m',
      cyan: '\033[46m',
      white: '\033[47m'
  }
};
