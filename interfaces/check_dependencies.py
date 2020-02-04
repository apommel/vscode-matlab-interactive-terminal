# Copyright (c) 2020 Aurélien Pommel

# Checks if the necessary Python dependencies are present on the system at activation
try: # Check if the Matlab Engine is installed
    import matlab.engine
except ImportError:
    print('1')
else:
    print('0')