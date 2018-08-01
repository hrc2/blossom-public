# Blossom App
React Native app for interfacing with Blossom robot. Currently using a wrapper called Expo for easier deployment on iOS and android. However, this limits us to only using the Expo API, so no native coding or open-source solutions unless we eject from Expo.

## Installation
The app can be installed on [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) or [iOS](https://itunes.apple.com/us/app/expo-client/id982107779?mt=8) via the Expo Client app.

### Android
If you want to use the last internally-published version, search for `https://exp.host/@michaelhu/blossom-app`. 

Alternatively, you can use either yarn (`yarn install` -> `yarn start`) or npm (`npm install` -> `npm run start`) to install and run the app locally, then either enter the generated project URL or scan the QR code.

### iOS
Searching for apps is [not available on iOS](https://blog.expo.io/upcoming-limitations-to-ios-expo-client-8076d01aee1a) so you will have to publish the app under your own Expo account for it to be accessible through the Expo app.

After downloading the [iOS app](https://itunes.apple.com/us/app/expo-client/id982107779?mt=8), [create an Expo account](https://expo.io/).

Then, [download the Expo CLI](https://github.com/expo/exp) with `npm install -g exp`.

In the `BlossomApp` directory, run `exp publish` to publish the app under your username.

Once the process is complete, you can find the app in the phone application under the `Profile` tab.

### Controlling the robot
**TODO: Have screenshots**

In the app, tap the `Settings` icon in the top right.

Enter the IP address of the host computer; this is listed under "Starting server on *IP_address*:8000" when first starting `start.py` or can be found other ways.

Once the IP address is entered, go back to the controller and toggle on `Control Robot`.

This allows you to control the robot's orientation (pitch, yaw, roll) by moving the phone and use sliders for the center height and ears.

_Android: If Blossom is not controllable at first, unfocus and refocus the app._
