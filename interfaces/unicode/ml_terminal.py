# Copyright (c) 2020 Aurélien Pommel

from matlab_interface import MatlabInterface
import sys

if len(sys.argv)==1:
    matlab = MatlabInterface()
else:
    matlab = MatlabInterface(matlab_session=sys.argv[1])
matlab.interactive_loop()