# Technical setup "Inter-view"
To create the application, and also let it function in offline mode, the front-end of the website will be statically served. The "back-end" will function as a REST API so the questions can be properly stored and retrieved. I will include fallbacks so it will be possible to work in an offline setting.

## Front-end
The front-end is responsible for handling the interview questioning and audio recording. It will fetch the available scripts from the back-end, and then be cached client side for offline usage.

When a question is completed, the front-end should try to POST the audio, along with some meta-data to the "back-end". As a fallback, audio will be downloaded to the interviewers system. The front-end should still upload the meta-data, as soon as the device is back online.

## Administration / Back-end
The administration section will also 'live' in the front-end part of the application. Only this part will not function in offline mode.

Within this section the scripts can be created and/or changed, and responses can be viewed, listened to, sorted and filtered.

## Back-end
The actual back-end is merely a REST API to handle data storage which will be used by the front-end and administration section. It will statically serve the front-end.