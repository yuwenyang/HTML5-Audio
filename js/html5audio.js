document.addEventListener("DOMContentLoaded", function(event) {

var music = document.getElementById('music'); // id for audio element
var duration; // Duration of audio clip
var pButton = document.getElementById('pButton'); // play button
var playhead = document.getElementById('playhead'); // playhead
var timeline = document.getElementById('timeline'); // timeline
var label =  document.getElementById('label'); // label
var piecesdiv =  document.getElementById('pieces'); // pieces

  document.getElementById('back30').addEventListener("click", function () { seekToRelative(-30) });
  document.getElementById('back05').addEventListener("click", function () { seekToRelative(-5) });
  document.getElementById('fore05').addEventListener("click", function () { seekToRelative(5) });
  document.getElementById('fore30').addEventListener("click", function () { seekToRelative(30) });
  document.getElementById('rate05').addEventListener("click", function () { setRate(0.5) });
  document.getElementById('rate075').addEventListener("click", function () { setRate(0.75) });
  document.getElementById('rate1').addEventListener("click", function () { setRate(1) });
  document.getElementById('rate2').addEventListener("click", function () { setRate(2) });
  document.getElementById('rate4').addEventListener("click", function () { setRate(4) });

  var pbrate = document.getElementById("pbrate");
  var curpbrate = document.getElementById("curpbrate");
  var curpiece = document.getElementById("curpiece");
 
  pbrate.addEventListener('input', function () {
    curpbrate.innerHTML = pbrate.value;
    music.playbackRate = pbrate.value;
  }, false);

  function seekTo(seconds) {
    music.currentTime = seconds;
  }
  function seekToRelative(seconds) {
    var cur = music.currentTime;
    cur = Math.max(cur + seconds, 0);
    seekTo(cur, true);
  }
  function seekNextPiece(increment) {
    // TODO
    var piece = Math.max(0, Math.min(currentPiece + increment, piecesData.length - 1));
    seekTo(piecesData[piece].pseconds, true);
  }
  function setRate(rate) {
    music.playbackRate = rate;
  }


// timeline width adjusted for playhead
var timelineWidth = timeline.offsetWidth - playhead.offsetWidth;

// play button event listener
pButton.addEventListener("click", play);

// timeupdate event listener
music.addEventListener("timeupdate", timeUpdate, false);

// makes timeline clickable
timeline.addEventListener("click", function(event) {
    moveplayhead(event);
    music.currentTime = duration * clickPercent(event);
}, false);

// returns click as decimal (.77) of the total timelineWidth
function clickPercent(event) {
    return (event.clientX - getPosition(timeline)) / timelineWidth;

}

// makes playhead draggable
playhead.addEventListener('mousedown', mouseDown, false);
window.addEventListener('mouseup', mouseUp, false);

// Boolean value so that audio position is updated only when the playhead is released
var onplayhead = false;

// mouseDown EventListener
function mouseDown() {
    onplayhead = true;
    window.addEventListener('mousemove', moveplayhead, true);
    music.removeEventListener('timeupdate', timeUpdate, false);
}

// mouseUp EventListener
// getting input from all mouse clicks
function mouseUp(event) {
    if (onplayhead == true) {
        moveplayhead(event);
        window.removeEventListener('mousemove', moveplayhead, true);
        // change current time
        music.currentTime = duration * clickPercent(event);
        music.addEventListener('timeupdate', timeUpdate, false);
    }
    onplayhead = false;
}
// mousemove EventListener
// Moves playhead as user drags
function moveplayhead(event) {
    var newMargLeft = event.clientX - getPosition(timeline);

    if (newMargLeft >= 0 && newMargLeft <= timelineWidth) {
        playhead.style.marginLeft = newMargLeft + "px";
    }
    if (newMargLeft < 0) {
        playhead.style.marginLeft = "0px";
    }
    if (newMargLeft > timelineWidth) {
        playhead.style.marginLeft = timelineWidth + "px";
    }
}

// timeUpdate
// Synchronizes playhead position with current point in audio
function timeUpdate() {
    var playPercent = timelineWidth * (music.currentTime / duration);
    playhead.style.marginLeft = playPercent + "px";
    if (music.currentTime == duration) {
        pButton.className = "";
        pButton.className = "play";
    }
  var curTime = music.currentTime;
  label.innerText = (curTime+'').seconds2Time() + ' / ' + (music.duration+'').seconds2Time();
  var p;
  for (var i = 0; i < piecesData.length; i++) {
    p = piecesData[i];
    document.getElementById('p'+p.bwv).classList.remove('playing');
    if (curTime < p.pseconds) {
      break;
    }
  }
  curpiece.innerHTML = pieceHTML(i-1, curTime);
  document.getElementById('p'+piecesData[i-1].bwv).classList.add('playing');

  // save current play location so can resume here if page is closed
  localStorage.curTime = music.currentTime;
}

  String.prototype.seconds2Time = function () {
    var sec_num = parseInt(this, 10);
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time = hours+':'+minutes+':'+seconds;
    return time;
  }
  String.prototype.time2Seconds = function () {
    var a = this.split(':');
    return (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]) || undefined; 
  }

//Play and Pause
function play() {
    // start music
    if (music.paused) {
      music.play();
      localStorage.playing = pButton.className;
      // remove play, add pause
      pButton.className = "";
      pButton.className = "pause";
    } else { // pause music
      music.pause();
      localStorage.playing = pButton.className;
      // remove pause, add play
      pButton.className = "";
      pButton.className = "play";
    }
}

// Gets audio file duration
music.addEventListener("canplaythrough", function() {
    duration = music.duration;
}, false);

// getPosition
// Returns elements left position relative to top-left of viewport
function getPosition(el) {
    return el.getBoundingClientRect().left;
}

  // go to location played last time page was loaded
  if (typeof(localStorage.curTime) !== "undefined") {
    music.currentTime = Number(localStorage.curTime);
  } else {
    music.currentTime = 0.1; // TODO: not sure why 0 doesn't work...
  }
  if (localStorage.playing === "play") {
    play();
  }
  
  piecesData = [
    { book: 1, number:  1, bwv: 846, key: "C Maj.",  prelude: "00:00:00.5", fugue: "00:01:57.5" },
    { book: 1, number:  2, bwv: 847, key: "C min.",  prelude: "00:04:30.3", fugue: "00:05:48.3" },
    { book: 1, number:  3, bwv: 848, key: "C♯ Maj.", prelude: "00:07:30.6", fugue: "00:08:44.5" },
    { book: 1, number:  4, bwv: 849, key: "C♯ min.", prelude: "00:10:50.4", fugue: "00:14:03.7" },
    { book: 1, number:  5, bwv: 850, key: "D Maj.",  prelude: "00:20:27.0", fugue: "00:21:35.5" },
    { book: 1, number:  6, bwv: 851, key: "D min.",  prelude: "00:23:30.1", fugue: "00:24:56.6" },
    { book: 1, number:  7, bwv: 852, key: "E♭ Maj.", prelude: "00:27:32.8", fugue: "00:31:13.3" },
    { book: 1, number:  8, bwv: 853, key: "E♭ min.", prelude: "00:32:43.2", fugue: "00:37:07.8" },
    { book: 1, number:  9, bwv: 854, key: "E Maj.",  prelude: "00:43:35.9", fugue: "00:44:40.5" },
    { book: 1, number: 10, bwv: 855, key: "E min.",  prelude: "00:45:48.3", fugue: "00:47:41.6" },
    { book: 1, number: 11, bwv: 856, key: "F Maj.",  prelude: "00:48:50.6", fugue: "00:49:45.3" },
    { book: 1, number: 12, bwv: 857, key: "F min.",  prelude: "00:51:04.8", fugue: "00:53:14.8" },
    { book: 1, number: 13, bwv: 858, key: "F♯ Maj.", prelude: "00:58:39.3", fugue: "01:00:03.4" },
    { book: 1, number: 14, bwv: 859, key: "F♯ min.", prelude: "01:02:20.9", fugue: "01:03:12.2" },
    { book: 1, number: 15, bwv: 860, key: "G Maj.",  prelude: "01:07:30.3", fugue: "01:08:18.8" },
    { book: 1, number: 16, bwv: 861, key: "G min.",  prelude: "01:10:41.8", fugue: "01:12:39.2" },
    { book: 1, number: 17, bwv: 862, key: "A♭ Maj.", prelude: "01:15:31.7", fugue: "01:16:42.2" },
    { book: 1, number: 18, bwv: 863, key: "G♯ min.", prelude: "01:19:37.3", fugue: "01:21:01.3" },
    { book: 1, number: 19, bwv: 864, key: "A Maj.",  prelude: "01:24:26.2", fugue: "01:25:37.1" },
    { book: 1, number: 20, bwv: 865, key: "A min.",  prelude: "01:28:14.0", fugue: "01:29:08.8" },
    { book: 1, number: 21, bwv: 866, key: "B♭ Maj.", prelude: "01:33:16.9", fugue: "01:34:22.5" },
    { book: 1, number: 22, bwv: 867, key: "B♭ min.", prelude: "01:35:52.1", fugue: "01:38:18.2" },
    { book: 1, number: 23, bwv: 868, key: "B Maj.",  prelude: "01:42:37.5", fugue: "01:43:29.2" },
    { book: 1, number: 24, bwv: 869, key: "B min.",  prelude: "01:46:02.3", fugue: "01:47:26.2" },

    { book: 2, number:  1, bwv: 870, key: "C Maj.",  prelude: "02:01:21.7", fugue: "02:03:51.5" },
    { book: 2, number:  2, bwv: 871, key: "C min.",  prelude: "02:05:22.9", fugue: "02:07:12.0" },
    { book: 2, number:  3, bwv: 872, key: "C♯ Maj.", prelude: "02:09:50.7", fugue: "02:11:21.0" },
    { book: 2, number:  4, bwv: 873, key: "C♯ min.", prelude: "02:13:09.4", fugue: "02:16:55.3" },
    { book: 2, number:  5, bwv: 874, key: "D Maj.",  prelude: "02:18:53.1", fugue: "02:23:47.6" },
    { book: 2, number:  6, bwv: 875, key: "D min.",  prelude: "02:27:16.0", fugue: "02:28:38.2" },
    { book: 2, number:  7, bwv: 876, key: "E♭ Maj.", prelude: "02:30:17.9", fugue: "02:32:37.0" },
    { book: 2, number:  8, bwv: 877, key: "E♭ min.", prelude: "02:34:55.2", fugue: "02:38:12.0" },
    { book: 2, number:  9, bwv: 878, key: "E Maj.",  prelude: "02:42:38.2", fugue: "02:46:50.2" },
    { book: 2, number: 10, bwv: 879, key: "E min.",  prelude: "02:51:19.6", fugue: "02:54:21.1" },
    { book: 2, number: 11, bwv: 880, key: "F Maj.",  prelude: "02:57:03.7", fugue: "03:00:05.5" },
    { book: 2, number: 12, bwv: 881, key: "F min.",  prelude: "03:01:41.4", fugue: "03:05:53.4" },
    { book: 2, number: 13, bwv: 882, key: "F♯ Maj.", prelude: "03:07:46.8", fugue: "03:10:31.5" },
    { book: 2, number: 14, bwv: 883, key: "F♯ min.", prelude: "03:13:02.8", fugue: "03:16:25.5" },
    { book: 2, number: 15, bwv: 884, key: "G Maj.",  prelude: "03:22:31.3", fugue: "03:24:43.3" },
    { book: 2, number: 16, bwv: 885, key: "G min.",  prelude: "03:25:53.4", fugue: "03:28:44.9" },
    { book: 2, number: 17, bwv: 886, key: "A♭ Maj.", prelude: "03:32:13.1", fugue: "03:35:20.3" },
    { book: 2, number: 18, bwv: 887, key: "G♯ min.", prelude: "03:38:54.4", fugue: "03:42:38.3" },
    { book: 2, number: 19, bwv: 888, key: "A Maj.",  prelude: "03:49:23.9", fugue: "03:50:56.0" },
    { book: 2, number: 20, bwv: 889, key: "A min.",  prelude: "03:52:04.2", fugue: "03:56:31.0" },
    { book: 2, number: 21, bwv: 890, key: "B♭ Maj.", prelude: "03:58:02.0", fugue: "04:03:50.0" },
    { book: 2, number: 22, bwv: 891, key: "B♭ min.", prelude: "04:07:40.7", fugue: "04:10:33.8" },
    { book: 2, number: 23, bwv: 892, key: "B Maj.",  prelude: "04:18:14.8", fugue: "04:19:44.3" },
    { book: 2, number: 24, bwv: 893, key: "B min.",  prelude: "04:24:51.3", fugue: "04:27:09.6" }
  ];
  function piecesHTML() {
    var html = '<div id="col1"><div>Book I</div>';
    for (var i = 0; i < piecesData.length; i++) {
      html += pieceHTML(i);
      if (i==23) html += '</div><div id="col2"><div>Book II</div>';
    }
    html += '</div>';
    return html;
  }
  piecesdiv.innerHTML = piecesHTML();
  

  function pieceHTML(pieceIndex, time) {
    var html = "";
    var book = "";
    var bwv = "";
    var preorfug = "";
    var p = piecesData[pieceIndex];
    p.pseconds = p.prelude.time2Seconds()
    p.fseconds = p.fugue.time2Seconds()
    if (typeof(time) !== 'undefined') {
      book = pieceIndex < 24 ? "Book I" : "Book II";
      preorfug = typeof(p.fseconds) !== 'undefined' ? time < p.fseconds ? "Prelude " : "Fugue " : "";
    }
    var k = p.key.split(" ")
    var htmlKey = '<span class="key">' + k[0] + '</span> ' + k[1]
    if (typeof(time) !== 'undefined') {
      html += '<div class="piece" id="pc' + p.bwv + '">' + book + ': ' + preorfug + ' <span class="number">' + p.number + '</span> in ' + htmlKey;
      html = html.replace("Maj.", "Major");
      html = html.replace("min.", "minor");
      html += ', <a href="http://www.hermann-keller.org/assets/downloads/547e2aeb/bwv' + p.bwv + '.pdf" target="_blank">BWV ' + p.bwv + '</a>';
    } else {
      html += '<div class="piece" id="p' + p.bwv + '"> <span class="number">' + p.number + '</span> ' + p.bwv + ' ' + htmlKey + ' ';
      html += '<a href="javascript:void(0);" onclick="music.currentTime = ' + p.pseconds + ';" title="' + p.prelude + '">Prel.</a> ';
      if (p.fseconds >= 0) {
	html += '<a href="javascript:void(0);" onclick="music.currentTime = ' + p.fseconds + ';" title="' + p.fugue   + '">Fug.</a> '
      } else {
	html += 'Fug. ';
      }
    }
    html += '</div>';
    return html;
  }

/* DOMContentLoaded*/
});
