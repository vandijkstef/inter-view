# Debriefing Interview tool "Inter-view"
This document outlines the project "Inter-view", an interview tool designed for HvA researchers to conduct semi-structured interviews, and audio record the outcomes. The responses will be seperated and easily sortable/filterable afterwards to process the results.

## A note about deployment
Since the application can process personal data and/or confidential information, measures of security are required. I have a fair understanding of security, but I'm not an expert. I will provide HTTPS/SSL connections to the (testing)server, and audio files should only be visible/downloadable on logged in users. A real long-term deployment would probably require ICT people from HvA or a company providing hosting services. All data should be processed and stored on private servers, authored by HvA. Specifically excluding cloud services like Dropbox and Google Drive. During development I will use a private server, and notify the user to use dummy data only.

## A note about mobile / cross-platform
The interface can be created responsive to screen sizes and device. Note that tapping a device can disturb the audio recording. It will likely be much harder to let the app function stable in bad network conditions. The size of the audio files will most likely be hard to handle on mobile platforms without creating a platform-specific native app. In perfect conditions, mobile platforms should function just as desktop platforms using any major browser. Based on the timeframe, mobile optimisation is definitely 'nice to have'. The focus will be on the laptop with external mic setting. 


## Stages
Each interview will have 3 stages; preparation, interviewing and processing. Each of these stages are set in a different context.

### Preparation
Well before conducting the interviews, the researcher will create the "script" (Interview) in the application. He/she will most likely do this during "office hours", with no interviewees in the area. Each script will contain a number of features and/or requirements:
- Questions
	- To be set in a specific order
- Meta Data on interviewees
	- Attributes on the interviewee, configurable based on the script
	- Asked either before, or after the interview
	- Open/arbitrary (text) "input" fields
		- Optionally, provide a set of default questions, which can help to provide some consistency (name, age, gender, email, wants-updates (contact information), etc)

### Interviewing
During the interviews, the application will guide the interviewer with the questions. The interface should have a "powerpoint presenter mode like interface". This interface will consist of:
- The question asked
- Additional guidance text on that question, used by the interviewer, not to be passed on to the interviewee
- A timer, totalling the interview, but also timing per question.

The flow during the interviews is as following:
1. Interviewer opens the webapp on a laptop, hooking up an external mic and making sure the recording works. (Test tool required, like audio feedback and/or a visual indicator (db meter))
2. Interviewee sits down, interviewer selects the script to be used
3. Interviewer will input meta data based on the script
4. Interviewer will start the script and ask the first question. At this time, recording is started. During this time, interviewer is able to optionally;
	1. Add a star rating to the answer
	2. Add a tag to the answer
	3. Skip the question
5. Interviewer goes to next question, at this time:
	1. Recording is stopped
	2. Audio is uploaded to the server, or downloaded on the device. (Possibly both to catch any connection issues) (Stability of the recordings is very important, I'd rather be safe then sorry)
	3. Repeat with the next question from point 4, untill all questions are answered.
6. After the questions, there will be one more screen where recording is enabled, to provide space for "anything else?"
7. Interviewer will have a post-interview screen, possibly adding meta data to the interviewee. This is similar to step 3, except it's after the interview
8. Interviewee leaves
9. Interviewer will have a secondary post-interview screen, in which he/she can provide additional comments on individual questions, as well as some general comments on the interview. It will also be possible to revise the previously added star ratings and tags.
10. Interviewer will invite the next interviewee, starting from point 2

### Processing
After taking the interviews, the application should provide a proper way to extract the audio files so they can be send to a transcription service (like transcribe.me). This part is currently more "open" but already has the following required use cases:
- Provide an overview of interviews/answers
- Retrieve a single interview in full as audio
- Retrieve all answers (as audio) on a specific question in a script, optionally filtering on the interviewee's meta data
- Provide an area to add the transcription, so all data will stay together

## Planning
Please provide me with a time and location.
### 7th of June
Interaction design on the application, basics of the 'back-end' to enter scripts and find the conducted interviews in a basic layout
### 12th of June
Processed feedback on the interaction design, basics of the 'front-end' to conduct the interviews

Please provide me a day, time and location for the weeks after this.

### Grading
Grading will probably take place on thursday 28 June. There will be an exposition of all the projects our class created. Unsure about the time of this exposition right now.
