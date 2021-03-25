print("*** DAQC2 OSC Bridge ***")
print("v1.3 Mathieu Delquignies 6/03/2021") 
# Import needed modules from osc4py3
# more infos :
# https://pypi.org/project/osc4py3/ 
from osc4py3.as_eventloop import *
from osc4py3 import oscmethod as osm
from osc4py3 import oscbuildparse
# more infos :
# https://pi-plates.com/daqc2-users-guide/
import piplates.DAQC2plate as DAQC2

# Import utilities from modules
from time import sleep
from sys import argv
import socket
import RPi.GPIO as GPIO
import datetime

print(str(datetime.datetime.now()), "All libs import OK.")
#####################
# Constants & Globals
#
# DAQC2 plate address (0-7, see jumper configuration https://pi-plates.com/daqc2-users-guide/#Address_Selection_Header ). This version only support one DAQC2 plate at a time.
AD = 0
# CANs values buffer
prevCAN = [0,0,0,0,0,0,0,0,0]
DINInterrupt = 0
DINByte = 0

# Network parameters
# Rx host
rxPort=50052
localIP=socket.gethostbyname(socket.gethostname())
# Tx host
txPort=50051
# Command line argument may be recipient IP, without arg it will be Local
if(len(argv)==2):
    ipAddress=argv[1]
else:
    ipAddress=localIP

#####################
# Callback functions
#

# Reply to ping
def ping():
    msg = oscbuildparse.OSCMessage("/pong", None, [])
    osc_send(msg, "OSCTx")
    print(str(datetime.datetime.now()), "Received a ping, answering pong.")
    osc_process()
    pass

# Set DOUT
def OSCDOut(address, args):
    global AD
    # convert output number in address String to Integer range (0-7)
    pinOut=int(address[len(address)-1])%8
    # set or clear corresponding DAQC2 plate output
    if (args==1):
        DAQC2.setDOUTbit(AD, pinOut)
    else:
        DAQC2.clrDOUTbit(AD, pinOut)
    pass

# Set RGB Led
def OSCLED(args):
    global AD
    # args is color as string: ‘off’, 'red’, ‘green’, ‘yellow’, ‘blue’, ‘magenta’, ‘cyan’, ‘white’
    DAQC2.setLED(AD, args)
    pass

# get all Din values
def getDAQC2DIN():
    global AD
    global DINInterrupt
    global DINByte
    # get DIN digital inputs values
    DINByte=DAQC2.getDINall(AD)
    DINInterrupt=255
    pass
    
# DAQC2 Interrupt
def DAQC2Interrupt(args):
    global AD
    global DINInterrupt
    global DINByte
    # get DIN digital inputs values
    DINByte=DAQC2.getDINall(AD)
    # debounce button before clearing interrupt (! software deboucining slow down OSC send rate, including CANs)
    # sleep(0.01)
    DINInterrupt=DAQC2.getINTflags(AD)
    pass
    
#
def intEnable():
    DAQC2.intEnable(AD)
    print(str(datetime.datetime.now()), "DIN interrupts enabled.")


def intDisable():
    DAQC2.intDisable(AD)
    print(str(datetime.datetime.now()), "DIN interrupts disabled.")


#####################
#Functions

def testBit(int_type, offset):
    mask = 1 << offset
    return(bool(int_type & mask))
    
#####################
# Main
OSCLED("off")

# GPIO 22 is used as external interrupt from DAQC2. Enable interrupts on this pin
GPIO.setmode(GPIO.BCM)
GPIO.setup(22, GPIO.IN, pull_up_down=GPIO.PUD_UP)
# set interrupt callback
# ? strange behaviour of bouncetime>1, see sleep() in interrupt callback alternative ? worth check with GPIO module update
GPIO.add_event_detect(22, GPIO.FALLING, callback=DAQC2Interrupt, bouncetime=1)
# enable interrupt also on 0-7 DAQC2 Digital Inputs for both edges
for i in range(8):DAQC2.enableDINint(AD, i, "b")
# reset interrupt flag, pin GPIO.22 should be high
DINInterrupt=DAQC2.getINTflags(AD)
if (DAQC2.GPIO.input(22)==1): print(str(datetime.datetime.now()), "External interrupts OK.")

# Start the OSC system.
osc_startup()
print(str(datetime.datetime.now()), "OSC system started.")

# Make server channels to receive and send packets with LOCAL IP
osc_udp_server("127.0.0.1", rxPort, "OSCRx")
print(str(datetime.datetime.now()), "Local OSC server up and running on port "+str(rxPort)+" @"+localIP)
osc_udp_client(ipAddress, txPort, "OSCTx")
print(str(datetime.datetime.now()), "OSC client up and running on port "+str(txPort)+" @"+ipAddress)

# Associate Python functions with received message address patterns (default argument scheme OSCARG_DATAUNPACK)
osc_method("/ping", ping)
osc_method("/DOut/*", OSCDOut, argscheme=osm.OSCARG_ADDRESS + osm.OSCARG_DATAUNPACK)
osc_method("/LED", OSCLED)
osc_method("/getDIN", getDAQC2DIN)
osc_method("/intEnable",intEnable)
osc_method("/intDisable",intDisable)

print(str(datetime.datetime.now()), "Rx parser up, start event loop. Press Ctrl+c to stop.")
OSCLED("green")
# Event loop
try:
    finished = False
    while not finished:
        # Process DIN to OSC
        if (DINInterrupt):
            if (DINInterrupt>255):
                print(str(datetime.datetime.now()), "Interrupt error ! "+str(DINInterrupt))
            else:
                for i in range(8):
                    if (testBit(DINInterrupt,i)): 
                        msg = oscbuildparse.OSCMessage("/DIN/"+str(i), None, [int(testBit(DINByte,i)==True)])
                        osc_send(msg, "OSCTx")
                        osc_process()
                        #print(str(datetime.datetime.now()), "DIN #"+str(i)+" "+str(testBit(DINByte,i)))
        DINInterrupt=0
        
        # Process CANs to OSC
        # Get all 8 channels
        CAN=DAQC2.getADCall(AD)
        for i in range(8):
            if prevCAN[i]!=CAN[i]:
                msg = oscbuildparse.OSCMessage("/CAN/"+str(i), None, [CAN[i]])
                osc_send(msg, "OSCTx")
                osc_process()
                #print(str(datetime.datetime.now()), "/CAN/"+str(i), CAN[i])
                prevCAN[i]=CAN[i]
                
        # Slow down to <50 hz
        sleep(0.02)
        
# Properly close the system.
except KeyboardInterrupt:
    print(str(datetime.datetime.now()), "OSCDAQC2Plate.py stopped by operator.")
osc_terminate()
print(str(datetime.datetime.now()), "OSC system stopped.")
OSCLED("red")
GPIO.cleanup()
print(str(datetime.datetime.now()), "GPIO interrupts cleaned.")

