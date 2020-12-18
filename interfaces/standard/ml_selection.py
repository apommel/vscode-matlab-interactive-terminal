# Developed by Aurelien Pommel and other contributors

from matlab_interface import MatlabInterface
import sys

matlab = MatlabInterface()
# Run the initial selection given in arg
matlab.run_selection(sys.argv[1])
matlab.interactive_loop()