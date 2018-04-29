setFormat();
setAudioPath("./audio/");

//set sound clips and music tracks here
var menu_music_track = new musicTrackLoopingWTail("temp_placeholder", 3);
var win_music_track = new musicTrackLoopingWTail("temp_placeholder", 3);
var loose_music_track = new musicTrackLoopingWTail("temp_placeholder", 3);
var inGame_music_track1 = new musicTrackNonLooping("temp_placeholder", 0);
var inGame_music_track2_1 = new musicTrackNonLooping("lazyGuitarVar1", 52.8);
var inGame_music_track2_2 = new musicTrackNonLooping("lazyGuitarVar2", 52.8);
var inGame_music_track2_3 = new musicTrackNonLooping("lazyGuitarVar3", 52.8);
var inGame_music_track2_4 = new musicTrackNonLooping("lazyGuitarVar4", 52.8);
var inGame_music_track2_master = new musicContainerRandom([inGame_music_track2_1,inGame_music_track2_2,inGame_music_track2_3,inGame_music_track2_4]);
var inGame_music_master = new musicContainerPlaylistRandom([inGame_music_track1,inGame_music_track2_master],4,2);




function setFormat() {
	var audio = new Audio();
	if (audio.canPlayType("audio/ogg")) {
		audioFormatType = ".ogg";
	} else {
		audioFormatType = ".mp3";
	}
}

function setAudioPath(path = "") {
	audioPath = path;
}

function audioFormat(alt = false) {
	var format = audioFormatType;
	if (alt != false) {
		format = ".mp3";
	}
	return format;
}

function toggleMute() {
	isMuted = !isMuted;
	SFXVolumeManager.updateVolume();
	MusicVolumeManager.updateVolume();
}

function setMute(TorF) {
	isMuted = TorF;
	SFXVolumeManager.updateVolume();
	MusicVolumeManager.updateVolume();
}

function getMute(TorF) {
	return isMuted;
	SFXVolumeManager.updateVolume();
	MusicVolumeManager.updateVolume();
}



//Time Manager
const REMOVE = 0; // Arrayformat [REMOVE]
const FADE = 1; // Arrayformat [FADE, track, startTime, endTime, startVolume, endVolume, crossfade]
const TIMER = 2; // Arrayformat [TIMER, track, endTime, callSign]
const STOP = 3; // Arrayformat [STOP, track, endTime]

var AudioEventManager = new audioEventManager();

function audioEventManager() {
	var eventList = [];
	var now = Date.now();

	this.returnEventList = function() {
		return eventList;
	}

	this.updateEvents = function() {
		now = Date.now();
		runList();
		cleanupList();
	}

	this.addFadeEvent = function(track, duration, endVol) {
		var check = checkListFor(FADE, track);
		var endTime = duration * 1000 + now;
		var startVolume = track.getVolume();
		//console.log("Adding Fade Event for " + track.getTrackName());

		if (check == "none") {
			eventList.push([FADE, track, now, endTime, startVolume, endVol, false]);
		} else {
			eventList[check] = [FADE, track, now, endTime, startVolume, endVol, false];
		}
	}

	this.addCrossfadeEvent = function(track, duration, endVol) {
		var check = checkListFor(FADE, track);
		var endTime = duration * 1000 + now;
		var startVolume = track.getVolume();
		//console.log("Adding Fade Event for " + track.getTrackName());

		if (check == "none") {
			eventList.push([FADE, track, now, endTime, startVolume, endVol, true]);
		} else {
			eventList[check] = [FADE, track, now, endTime, startVolume, endVol, true];
		}
	}

	this.addTimerEvent = function(track, duration, callSign = "none") {
		var thisTrack = track;
		var check = checkListFor(TIMER, thisTrack, callSign);
		var endTime = (duration * 1000) + now;
		//var endTime = (thisTrack.getDuration() - thisTrack.getTime()) * 1000 + now;

		if (check == "none") {
			//console.log("Adding Timer Event for " + track.getTrackName());
			eventList.push([TIMER, track, endTime, callSign]);
		} else {
			eventList[check] = [TIMER, track, endTime, callSign];
		}
	}

	this.addStopEvent = function(track, duration) {
		var thisTrack = track;
		var check = checkListFor(STOP, thisTrack);
		var endTime = (duration * 1000) + now;
		//var endTime = (thisTrack.getDuration() - thisTrack.getTime()) * 1000 + now;

		if (check == "none") {
			//console.log("Adding Stop Event for " + track.getTrackName());
			eventList.push([STOP, track, endTime]);
		} else {
			eventList[check] = [STOP, track, endTime];
		}
	}

	this.removeTimerEvent = function(track, callSign = "none") {
		var thisTrack = track;
		var check = checkListFor(TIMER, thisTrack, callSign);

		if (check == "none") {
			return;
		} else {
			//console.log("Removing Timer Event for " + track.getTrackName());
			eventList[check] = [REMOVE];
		}
	}

	this.removeStopEvent = function(track) {
		var thisTrack = track;
		var check = checkListFor(STOP, thisTrack);

		if (check == "none") {
			return;
		} else {
			//console.log("Removing Stop Event for " + track.getTrackName());
			eventList[check] = [REMOVE];
		}
	}

	function runList(){
		for (var i = 0; i < eventList.length; i++) {
			if (eventList[i][0] == FADE) {
				// Arrayformat [FADE, track, startTime, endTime, startVolume, endVolume, crossfade]
				thisTrack = eventList[i][1];
				if (thisTrack.getPaused() == false) {
						if(eventList[i][6]) {
							if(eventList[i][4] < eventList[i][5]){
								thisTrack.setVolume(scaleRange(0, 1, eventList[i][4], eventList[i][5], 
									Math.pow(interpolateFade(eventList[i][2], eventList[i][3], 0, 1, now), 0.5)));
							} else {
								thisTrack.setVolume(scaleRange(1, 0, eventList[i][4], eventList[i][5], 
									Math.pow(interpolateFade(eventList[i][2], eventList[i][3], 1, 0, now), 0.5)));
							}
						} else {
							thisTrack.setVolume(interpolateFade(eventList[i][2], eventList[i][3], eventList[i][4], eventList[i][5], now));
						}
					if (eventList[i][3] < now) {
						//console.log("Ending Fade Event for " + thisTrack.getTrackName());
						eventList[i] = [REMOVE];
					}
				}
			}
			if (eventList[i][0] == TIMER) {
				thisTrack = eventList[i][1];
				if (thisTrack.getPaused() == false) {
					if (eventList[i][2] <= now) {
						//console.log("Ending Timer Event for " + thisTrack.getTrackName());
						eventList[i] = [REMOVE];
						thisTrack.triggerTimerEnded(eventList[i][3]);
					}
				} else {
					eventList[i] = [REMOVE];
				}
			}
			if (eventList[i][0] == STOP) {
				thisTrack = eventList[i][1];
				if (thisTrack.getPaused() == false) {
					if (eventList[i][2] <= now) {
						//console.log("Executing Stop Event for " + thisTrack.getTrackName());
						eventList[i] = [REMOVE];
						thisTrack.stop();
					}
				}
			}
		}

	}

	function cleanupList() {
		eventList.sort(function(a, b){return b-a});
		while (eventList[eventList.length - 1] == REMOVE) {
			eventList.pop();
		}
	}

	function checkListFor(eventType, track, callSign = "none"){
		var foundItem = false;
		for (var i = 0; i < eventList.length; i++) {
			if (eventList[i][0] == eventType) {
				if (eventList[i][1] == track) {
					if(eventType == TIMER && eventList[i][3] == callSign) {
						foundItem = true;
						return i;
					} else if (eventType != TIMER) {
						foundItem = true;
						return i;
					}
				}
			}
		}
		if (!foundItem) {
			return "none";
		}
	}
}

function interpolateFade(startTime, endTime, startVolume, endVolume, currentTime) {
	/*
	x1 = startTime
	y1 = startVolume

	x2 = endTime
	y2 = endVolume

	x = currentTime
	y = y1 + (x - x1)((y2 - y1)/(x2 - x1))
    currentVolume = startVolume + (now - startTime) * ((endVolume - startVolume) / (endTime - startTime))
	*/
	if (currentTime > endTime) {currentTime = endTime;}
	var currentVolume = startVolume + (currentTime - startTime) * ((endVolume - startVolume) / (endTime - startTime));

	return currentVolume;
}

function scaleRange(inputStart, inputEnd, outputStart, outputEnd, value) {
	var scale = (outputEnd - outputStart) / (inputEnd - inputStart);
	return outputStart + ((value - inputStart) * scale);
}