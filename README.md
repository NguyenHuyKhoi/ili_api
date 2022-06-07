# Installation guide for ILI server:
Pls check demo before: https://ili-client.herokuapp.com/
> 1. Clone git.

> 2. Run`npm i` to install packages.

> 3. Run `npm start` to start app.

> Note: 
>> 1. ILI use SDK of Youtube and FB to handle create/edit/stream on livestream. Those require creating application of Google/FB Dev Console and fill credentials into source code. So, if you prefer using your own apps to default apps, pls config: 
>>> - `API_KEY` for Google app in `src/match/livestream/youtube.js`
>> 2. ILI use cloud MongoDB for  DB, So, if you prefer using your own to default DB, pls config `MONGO_URL` on `.env` file.
>> 3. Important!!!: ILI use [FFmpeg]('https://ffmpeg.org/') to create video and stream realtime to YT/FB server. So, if you want to try ILI locally, pls install FFmpeg first.