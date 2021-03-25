# DAQC2-Chataigne-Module
Chataigne module to interface Pi-Plates DAQC2 hardware with OSC protocol.

Pi-Plates DAQC2 is an affordable high precision multifunctional Data Acquisition and Controller board for Raspberry Pi.
It doesn't support OSC natively, so we made a Python script as bridge on Raspberry Pi side.

This community module is NOT OFFICIALLY supported by Pi-Plates.
It is publicly available to enable interested users to experiment, extend and create their own adaptations.
There is no guarantee for compatibility inbetween versions or for the implemented functionality to be reliable for professional.
Use what is provided here at your own risk!

To learn more about Chataigne, please visit : http://benjamin.kuperberg.fr/chataigne/

And Ben's Youtube channel where you can find tutorials : https://youtu.be/RSBU9MwJNLY

To learn more about Pi-Plates DAQC2, please visit : https://pi-plates.com/daqc2r1/

For global support on how to use Chataigne and its modules, please visit the forum : 
http://benjamin.kuperberg.fr/chataigne/forum 
or join us on Discord : 
https://discord.com/invite/ngnJ5z my contact there is also "madees".

## Installation
To install the Custom Module, just copy the "DAQC2-module" folder in My Documents\Chataigne\modules.

On Raspberry Pi, you'll need to run the Python script "OSCDAQC2Plate.py" for OSC parsing.

This scripts needs those modules installed :
https://pypi.org/project/osc4py3/
> sudo pip3 install osc4py3

https://pi-plates.com/daqc2-users-guide/
> sudo pip3 install pi-plates

## Principle of use
You should first start the OSC parser on Raspberry Pi by running the script:
> python3 OSCDAQC2Plate.py

By default, it will send OSC to local IP (ie. Chataigne shoud run on Raspberry Pi).

You can also send OSC to another IP (if Chataigne runs on another distant device) by giving IP as command line argument, example :
> python3 OSCDAQC2Plate.py 192.168.1.69

The DAQC2 LED should turn from white to black, and to green if everything's fine.

Now you can run Chataigne, and add a DAQC2 module.

You may use Module Commands to change DAQC2 outputs, and Module Values to retrieve its inputs.

## Module interface
#### OSC Input port
Preset according to Python script (5051). If not local, Python script should be run with Chataigne IP as argument

#### OSC Output port
Preset according to Python qcript (50052).
Default IP address setting is local, if you run Chataigne on the Raspberry PI. If not, should be set to the distant Raspberry Pi IP.

#### Ping
Simple function to check communication with Python script. 
Pressing the button will send a "/ping" command.
"Is anybody out there" check if you receive a "/pong" from Raspberry Pi.

#### CAN Analog inputs
- Eight protected inputs
- -12 to +12V input range
- 16 bit resolution

Receives "/CAN/channel value" as float
Values are automatically received when they change on analog inputs.
Sampling rate from DAQC2 is about 1000 samples/second, but filtered to max 50 values changes/second in Python script to lower OSC traffic.

#### DIN Digital inputs
- 8 protected inputs
- 3.3 and 5.0 logic compatible
- Can be polled or programmed to generate an interrupt on change

Receives "/DIN/channel state" as boolean

## Commands
Commands are ready to use in your scripts, with the "Command tester" tool, or as outputs from the State machine and Sequences in Time Machine.

#### Ping
Send "/ping", should receive "/pong". This is time stamped in RPI CLI.

#### GetDIN
Send "/getDIN"

Update DIN states manually.

#### intEnable
Send "/intEnable"

Enable interrupts on digital inputs. States will be automatically updates when the inputs changes. This is time stamped in RPI CLI.

#### intDisable
Send "/intDisable"

Disable interrupts on digital inputs. You'll need to manually pull changes by using GetDIN. This is time stamped in RPI CLI.

#### DOut (channel, state)
Send "/Dout/channel state"

Set one output state. "channel" is the number of output as integer (0-7), "state" is a boolean (True=+5v, False=0v)
- 8 Outputs
- Green LEDs on each output
- open collector 3A sink current for each channel
- Built in flyback current protection
- Maximum load voltage of 30VDC

#### Color LED (color)
Change the RGB DAQC2 LED color. "color" is a string ("off", "red", "green", "yellow", "blue", "magenta", "cyan", "white")
