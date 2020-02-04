# Copyright (c) 2020 Aurélien Pommel

from matlab_interface import MatlabInterface
import sys

matlab = MatlabInterface()
# Run the initial selection given in arg
matlab.run_selection(sys.argv[1])
matlab.interactive_loop()