var sys = require('sys'),
    request = require('request'),
    fs = require('fs'),
    exec = require('child_process').exec,
    api = 'http://link.to.api/',
    auth = {
      username: 'demo',
      password: 'demo'
    },
    burstMode = true,
    takePicture,
    uploadPicture,
    syncPictures;

/**
 * File upload
 * Delete file on 200 OK
 *
 * @param string fileName
 * @return void
 */
uploadPicture = function (fileName) {
  if (api.length === 0) {
    return false;
  }

  fs.exists(fileName, function (exists) {
    if (!exists) {
      return false;
    }

    fs.createReadStream(fileName).pipe(request.post(api + '/upload/', function (error, response, body) {
      if (response.statusCode === 200) {
        fs.unlink(fileName, function (err) {});
      }
    }).auth(auth.username, auth.password, true));
  });
};

/**
 * Execute default raspistill command, saving picture in /images/
 *
 * @param function callback - Gets filename as an argument
 * @return void
 */
takePicture = function (callback) {
  var now = new Date(),
      fileName = '/home/pi/images/' + now.getTime() + '.jpg';

  exec('raspistill -o ' + fileName + ' -w 1920 -h 1080 -q 15', function (err, stdin, stdout) {});

  setTimeout(function () {
    callback(fileName);
  }, 10000);
};

/**
 * Find files that didn't get deleted (sign of failed upload) and try to upload them again
 *
 * @return void
 */
syncPictures = function () {
  fs.readdir('/home/pi/images/', function (err, files) {
    if (err) {
      return false;
    }

    if (files.length > 0) {
      for (var i = 0; i < files.length; i++) {
        setTimeout(function () {
          uploadPicture('/home/pi/images/' + files[i]);
        }, i * 200);
      }
    }
  });
};

// Ready for take-off!
syncPictures();

(function timelapse () {
  var now = new Date(),
      timeout;

  // Default timeout = 3 minutes
  timeout = 180000;

  // If night (between 7PM and 7AM), timeout = 10 minutes
  if (now.getHours() < 7 || now.getHours() > 19) {
    timeout = 600000;
  }

  // If burst mode is on, timeout = 1 seconds
  if (burstMode) {
    timeout = 1000;
  }

  takePicture(uploadPicture);
  setTimeout(timelapse, timeout);
})();

// Let burst mode run for 3 minutes to allow camera positioning
setTimeout(function () {
  burstMode = false;
}, 180000);
