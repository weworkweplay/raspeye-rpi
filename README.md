# RaspEye
Create a low-cost webcam with the Raspberry Pi and the default RPi Camera board. By default, it stores your pictures on its SD-card, but there's an option to set an API URL and have all images uploaded to your server.

[We published an example server and front-end setup here.](https://github.com/weworkweplay/raspeye-web)

## Setup
1. Download NOOBS to SD-card
2. Install Raspbian
3. Install Node (http://weworkweplay.com/play/raspberry-pi-nodejs/ - step 2)
4. Install Forever (`$ sudo -i npm install -g forever`)
5. Clone this repository onto your Raspberry Pi.
6. If you want to post the images to your server, edit the API-variable in `camera.js`
7. To have it run on startup, open crontab configuration: `$ crontab -u pi -e`
8. Add the following line: `@reboot /usr/bin/sudo -u pi -H /usr/local/bin/forever start -a /home/pi/camera.js`

Note that if you're using a Raspberry Pi A, you have no ethernet port and you'll have to go through some trouble to set up automatic WiFi-connecting via a dongle if you want to push to a server.

If you turn off image uploading, all images stay on the SD-card, the app will probably crash when the card is full.

When booting, the app goes in burst mode. It'll take an image as soon as the camera is ready during three minutes, so when you're looking through the livestream you can position your camera and adjust it easily. You can turn it off by changing the `burstMode` to `false`.
