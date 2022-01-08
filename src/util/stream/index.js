
const child_process = require('child_process');

class StreamHandler {
    constructor(rtmpUrl) {
        console.log("Init stream handler with URL: ", rtmpUrl)
        this.ffmpeg = child_process.spawn('ffmpeg', [
            // '-framerate', '16',
            '-f', 'image2pipe', 
            // '-f', 'lavfi', '-i', 'anullsrc',
            '-f', 'lavfi', '-i' ,'anullsrc=channel_layout=stereo:sample_rate=44100',
            '-thread_queue_size', '6144',
            // '-stream_loop', '1',
            '-i', '-',
            '-vf', 'framerate=fps=16',
            // '-vf', 'scale=1280:720',
            '-c:v', 'libx264',
            // '-c:a', 'aac',
            '-b:v', '500k',
            // '-b:a', '192k',
            '-shortest',
            // '-acodec', 'aac',
            '-y',
            '-f', 'flv',
            rtmpUrl
            // 'rtmps://live-api-s.facebook.com:443/rtmp/214035877595103?s_bl=1&s_oil=0&s_psm=1&s_sw=0&s_tids=1&s_vt=api-s&a=Aby0O5DwTqn2VD89'
            // 'pls.flv'
        ]);
        this.ffmpeg.on('close', (code, signal) => {
            console.log('FFmpeg child process closed, code ' + code + ', signal ' + signal);
        });
         
        this.ffmpeg.stdin.on('error', (e) => {
             console.log('FFmpeg STDIN Error', e);
        });
           
        this.ffmpeg.stderr.on('data', (data) => {
            //console.log("FFmpeg stderr", data.toString())
        });
        console.log("End init stream handler")
    }

    stream = (canvas) => {
        if (this.ffmpeg == undefined) return
        canvas.toBuffer((err, buf) => {
            if (err) {
                console.log("Error: ", err)
            } // encoding failed
            else {
                this.ffmpeg.stdin.write(buf)
            }
        }, 'image/jpeg', { quality: 1 })
    }

    end = () => {
        console.log("Close stdin of ffmpeg")
        if (this.ffmpeg == undefined) return
        this.ffmpeg.stdin.end()
    }
}

module.exports = StreamHandler