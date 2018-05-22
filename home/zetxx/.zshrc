export ZSH=$HOME/.oh-my-zsh

ZSH_THEME="kolo"

plugins=(git archlinux docker)

source $ZSH/oh-my-zsh.sh

archey3
/opt/vc/bin/vcgencmd measure_temp
/opt/vc/bin/vcgencmd measure_volts core
/opt/vc/bin/vcgencmd measure_volts sdram_c
/opt/vc/bin/vcgencmd measure_volts sdram_i
/opt/vc/bin/vcgencmd measure_volts sdram_p
