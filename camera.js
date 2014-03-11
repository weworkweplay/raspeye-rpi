var sys = require('sys'),
    request = require('request'),
    fs = require('fs'),
    exec = require('child_process').exec,
    api = 'http://link.to.api/',
    auth = {
      username: 'demo',
      password: 'demo'
    },
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
uploadPicture = function (fileName, callback) {
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

      takePicture();
    }).auth(auth.username, auth.password, true));
  });
};

/**
 * Execute default raspistill command, saving picture in /images/
 *
 * @return void
 */
takePicture = function (callback) {
  var now = new Date(),
      fileName = '/home/pi/images/' + now.getTime() + '.jpg';

  exec('raspistill -o ' + fileName + ' -w 1920 -h 1080 -q 15', function (err, stdin, stdout) {
    if (!err) {
      uploadPicture(fileName);
    }
  });
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
      var queueUpload = function (i) {
        setTimeout(function () {
          uploadPicture('/home/pi/images/' + files[i]);
        }, i * 200);
      };

      for (var i = 0; i < files.length; i++) {
        queueUpload(i);
      }
    }
  });
};

// Ready for take-off!
syncPictures();
takePicture();
