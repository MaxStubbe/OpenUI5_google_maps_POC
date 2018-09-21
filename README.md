# OpenUI5_google_maps_POC
this is an cordova application focussed on android 

the project is a example of using google maps with cordova and OpenUI5.

# Android Setup
clone the repository and go to the folder in your command prompt. 

use the following command : cordova platform add android

Go to Android studio and from the welcome screen choose Import Project.

Using the file browser navigate to your cordova app folder/platforms and select android

when prompted if you want to use graddle wrapper press OK

Navigate to the project structure

Open the build.gradle file and delete the following code in the dependencies node: 

debugCompile(project(path: "CordovaLib", configuration: "debug"))

releaseCompile(project(path: "CordovaLib", configuration: "release"))
  
And replace it with this code : 

compile project('CordovaLib')
  
Now sync the project (when getting an error about versions of android gradle and gradle, click the “Fix gradle wrapper and re-import project” link, then press update)

Now you can run the application on a device or emulator 
