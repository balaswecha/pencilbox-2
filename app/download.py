#!/usr/bin/python
import sys
from os.path import expanduser

receivedString = sys.argv[1]
replacedString = receivedString.replace('&QUOT','"').replace('&SPAC',' ')
home = expanduser('~')
filename = home + '/Desktop/' + sys.argv[2]
with open(filename, 'w') as f:
    f.write(replacedString)
    f.close()
