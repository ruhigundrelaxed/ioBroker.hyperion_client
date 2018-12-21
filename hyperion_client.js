"use strict";
var utils =    require(__dirname + '/lib/utils'); // Get common adapter utils
var adapter = new utils.Adapter('hyperion_client');
var Hyperion = require('hyperion-client');
var convert = require('color-convert');
var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var hyperion;
var framerate = 10; 
var lastframe;
var framebuffer;
var num_leds = 1;

adapter.on('unload', function (callback) {
    try {
        adapter.log.info('cleaned everything up...');
        callback();
    } catch (e) {
        callback();
    }
});

// todo
adapter.on('discover', function (callback) {

});

// todo
adapter.on('install', function (callback) {

});

// todo
adapter.on('uninstall', function (callback) {

});

// is called if a subscribed object changes
adapter.on('objectChange', function (id, obj) {
    adapter.log.info('objectChange ' + id + ' ' + JSON.stringify(obj));
});


adapter.on('stateChange', function (id, state) {
    //adapter.log.info('StateChange ' + id + ' ' + JSON.stringify(obj));
});


adapter.on('ready', function () {
    main();
});


 function rgbToHex(r, g, b) {
	      r = Math.abs(r);
	      g = Math.abs(g);
	      b = Math.abs(b);

	      if ( r < 0 ) r = 0;
	      if ( g < 0 ) g = 0;
	      if ( b < 0 ) b = 0;

	      if ( r > 255 ) r = 255;
	      if ( g > 255 ) g = 255;
	      if ( b > 255 ) b = 255;

	     return '#' + [r, g, b].map(x => {
		           const hex = x.toString(16);
		           return hex.length === 1 ? '0' + hex : hex
		         }).join('');
 }
 

var myinterval = setInterval(function(){
		if (framebuffer != lastframe){
			for(var i=0; i<(num_leds - 1); i++){
				var my_rgb_val = rgbToHex(framebuffer[i*3],framebuffer[(i*3)+1],framebuffer[(i*3)+2]);
				var mycommon = {};
				mycommon["name"] = 'led'+i;
				mycommon["role"] = 'state';
				mycommon["type"] = 'state';
				adapter.setObject('leds.led_'+i, {type: 'state', common: mycommon, native: {id: 'leds.led_' + i}});
				adapter.setState('leds.led_'+i, my_rgb_val , false);
			};
			lastframe = framebuffer;
		}
},(1000 / framerate * num_leds))


function main() {
	adapter.setState("info.connection", false, true);
	
	server.bind(adapter.config['udp_listen_port'] || 33333, adapter.config['address']  || 'localhost');
    
	server.on('listening', function () {
		var address = server.address();
		adapter.log.info('RAWUDP HyperionData von: ' + address.address + ":" + address.port);
	});
  
	server.on('message', function (message, remote) {
		framebuffer = message;
		num_leds = framebuffer.length/3;	
		adapter.log.debug("Erhalte Nachrichten von :" +  num_leds + " RGB Leds");
	});

    adapter.subscribeStates('*');
}
