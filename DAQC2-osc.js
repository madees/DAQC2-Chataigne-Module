/** Chataigne Module for DAQC2 Plate (c) Mathieu Delquignies, 10/2020
===============================================================================
This file is a Chataigne Custom Module to remote control DAQC2 Plate.
More about DAQC2 Pi-Plates product : https://pi-plates.com/daqc2-users-guide/

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright notice,
this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice,
this list of conditions and the following disclaimer in the documentation
and/or other materials provided with the distribution.
3. The name of the author may not be used to endorse or promote products
derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED "AS IS" AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
===============================================================================
*/

/**	===============================================================================
*	Chataigne module common functions
*	
*	See https://bkuperberg.gitbook.io/chataigne-docs/scripting/scripting-reference#common-functions
*	===============================================================================
*/

/**
 * This function is called automatically by Chataigne when you add the module in your Noisette.
 * Used for GUI initialisation, OSC Rx callbacks.
 */
function init() 
{
	// Register OSC received messages to their callback functions
	// See https://bkuperberg.gitbook.io/chataigne-docs/scripting/scripting-reference/module-scripts#module-specific-methods-the-local-object
	local.register("/pong", "rxPong");
	local.register("/CAN/*", "rxCAN");
	local.register("/DIN/*", "rxDIN");

	// GUI setup
	setReadonly();
	collapseContainers();
}

/**
 * This function is called automatically by Chataigne when a module value changes
 * @param {value} value 
 */
function moduleValueChanged(value)
{
	if (value.is(local.values.clickToPingDAQC2))
	{
		root.modules.daqc2Pi_Plates.values.isThereAnybodyOutThere.set(false);
		txPing();
	}
}
function oscEvent(address, args)
{
}

/**	===============================================================================
	Commands to send OSC messages to DAQC2
	===============================================================================
*/

/**
 * Ping DAQC2
 */
function txPing()
{
	local.send("/ping");
}

/**
 * get all DIN states
 */
function getDIN()
{
	local.send("/getDIN");
}

/**
 * Ping DAQC2
 */
function intEnable()
{
	local.send("/intEnable");
}

/**
 * Ping DAQC2
 */
function intDisable()
{
	local.send("/intDisable");
}

/**
 * Set digital out state
 * @param {integer} channel (0-7)
 * @param {boolean} state
 */
function txDOut(channel,state)
{
	local.send("/DOut/"+channel,state);
}

/**
 * Set RGB LED color
 * @param {string} color as string (off, red, green, yellow, blue, magenta, cyan, white)
 */
function txLED(color)
{
	local.send("/LED", color);
}
/**	===============================================================================
	OSC rx parsers (from registered callback, others from OSCevent function)
	===============================================================================
*/

/**
 * OSC Receive a CAN channel value
 * @param {string} address 
 * @param {array} args 
 */
function rxCAN(address, args)
{
	channel=parseInt(address.substring(address.length-1, address.length));
	if (channel==0)
		{
		local.values.cANs.can0.set(args[0]);
		}
	else if(channel==1)
		{
		local.values.cANs.can1.set(args[0]);
		}
	else if(channel==2)
		{
		local.values.cANs.can2.set(args[0]);
		}
	else if(channel==3)
		{
		local.values.cANs.can3.set(args[0]);
		}
	else if(channel==4)
		{
		local.values.cANs.can4.set(args[0]);
		}
	else if(channel==5)
		{
		local.values.cANs.can5.set(args[0]);
		}
	else if(channel==6)
		{
		local.values.cANs.can6.set(args[0]);
		}
	else if(channel==7)
		{
		local.values.cANs.can7.set(args[0]);
		}
}

/**
 * OSC Receive a DIN channel state change
 * @param {string} address 
 * @param {array} args 
 */
function rxDIN(address, args)
{
	channel=parseInt(address.substring(address.length-1, address.length));
	if (channel==0)
		{
		local.values.dINs.din0.set(args[0]); //root.modules.daqc2Pi_Plates.values.dINs.din0 
		}
	else if(channel==1)
		{
		local.values.dINs.din1.set(args[0]);
		}
	else if(channel==2)
		{
		local.values.dINs.din2.set(args[0]);
		}
	else if(channel==3)
		{
		local.values.dINs.din3.set(args[0]);
		}
	else if(channel==4)
		{
		local.values.dINs.din4.set(args[0]);
		}
	else if(channel==5)
		{
		local.values.dINs.din5.set(args[0]);
		}
	else if(channel==6)
		{
		local.values.cANs.can6.set(args[0]);
		}
	else if(channel==7)
		{
		local.values.cANs.can7.set(args[0]);
		}
}

/**
 * OSC Receive an answer to ping
 */
function rxPong()
{
	local.values.isThereAnybodyOutThere.set(true);
}

/**	===============================================================================
	Little helper functions
	===============================================================================
*/

/**
 * Set up some GUI fields as read only
 */
function setReadonly() 
{
	//local.parameters.oscInput.localPort.setAttribute("readonly", true);
	//local.parameters.oscOutputs.oscOutput.remotePort.setAttribute("readonly", true);

	local.values.cANs.can0.setAttribute("readonly", true);
	local.values.cANs.can1.setAttribute("readonly", true);
	local.values.cANs.can2.setAttribute("readonly", true);
	local.values.cANs.can3.setAttribute("readonly", true);
	local.values.cANs.can4.setAttribute("readonly", true);
	local.values.cANs.can5.setAttribute("readonly", true);
	local.values.cANs.can6.setAttribute("readonly", true);
	local.values.cANs.can7.setAttribute("readonly", true);

	local.values.dINs.din0.setAttribute("readonly", true);
	local.values.dINs.din1.setAttribute("readonly", true);
	local.values.dINs.din2.setAttribute("readonly", true);
	local.values.dINs.din3.setAttribute("readonly", true);
	local.values.dINs.din4.setAttribute("readonly", true);
	local.values.dINs.din5.setAttribute("readonly", true);
	local.values.dINs.din6.setAttribute("readonly", true);
	local.values.dINs.din7.setAttribute("readonly", true);
}
/**
 * Collapse not so useful GUI containers
 */
function collapseContainers() 
{
	local.parameters.oscInput.setCollapsed(true);
	local.parameters.oscOutputs.setCollapsed(true);
	local.scripts.setCollapsed(true);
	local.templates.setCollapsed(true);
	local.commandTester.setCollapsed(true);
}
