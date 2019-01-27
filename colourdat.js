//Colour details
Reset = "\x1b[0m"
Bright = "\x1b[1m"
Dim = "\x1b[2m"
Underscore = "\x1b[4m"
Blink = "\x1b[5m"
Reverse = "\x1b[7m"
Hidden = "\x1b[8m"

FgBlack = "\x1b[30m"
FgRed = "\x1b[31m"
FgGreen = "\x1b[32m"
FgYellow = "\x1b[33m"
FgBlue = "\x1b[34m"
FgMagenta = "\x1b[35m"
FgCyan = "\x1b[36m"
FgWhite = "\x1b[37m"

BgBlack = "\x1b[40m"
BgRed = "\x1b[41m"
BgGreen = "\x1b[42m"
BgYellow = "\x1b[43m"
BgBlue = "\x1b[44m"
BgMagenta = "\x1b[45m"
BgCyan = "\x1b[46m"
BgWhite = "\x1b[47m"
//End of colour details




//global module
'use strict';
module.exports = {
  "reset" : "\033[0m",
  "hicolor" : "\033[1m",
  "underline" : "\033[4m",
  "inverse" : "\033[7m",
  "blink" : "\x1b[5m",

  // foreground colors
  "black" : "\033[30m",
  "red" : "\033[31m",
  "green" : "\033[32m",
  "yellow" : "\033[33m",
  "blue" : "\033[34m",
  "magenta" : "\033[35m",
  "cyan" : "\033[36m",
  "white" : "\033[37m",

  // background colors
  "bg_black" : "\033[40m",
  "bg_red" : "\033[41m",
  "bg_green" : "\033[42m",
  "bg_yellow" : "\033[43m",
  "bg_blue" : "\033[44m",
  "bg_magenta" : "\033[45m",
  "bg_cyan" : "\033[46m",
  "bg_white" : "\033[47m"
}
