
const child_process = require('child_process');

class StreamHandler {
    constructor(rtmpUrl) {
        this.imgBuffer = null
        //console.log("Init stream handler with URL: ", rtmpUrl)
        //rtmpUrl = 'rtmps://live-api-s.facebook.com:443/rtmp/FB-223798053285552-0-AbxrcVaUGXb3L158'
        
        this.ffmpeg = child_process.spawn('ffmpeg', [
            '-re','-thread_queue_size', '6144','-f', 'lavfi', '-i', 'anullsrc',  '-f', 'image2pipe', '-i', "-", '-vcodec', 'libx264' ,'-acodec', 'aac','-r','30','-g','60', '-f', 'flv', 
            rtmpUrl
        ]);

        this.ffmpeg.on('close', (code, signal) => {
            console.log('FFmpeg child process closed, code ' + code + ', signal ' + signal);
        });
         
        this.ffmpeg.stdin.on('error', (e) => {
             console.log('FFmpeg STDIN Error', e);
        });
           
        this.ffmpeg.stderr.on('data', (data) => {
             //console.log('FFmpeg STDERR:', data.toString());
            console.log("FFmpeg stderr", data.toString())
        });
      //  console.log("End init stream handler")
    }

    stream = (canvas, reBuffer) => {
        if (this.ffmpeg == undefined) return
        if (reBuffer) {
            console.log("Rebuffer :")
            canvas.toBuffer((err, buf) => {
                if (err) {
                    console.log("Error: ", err)
                } // encoding failed
                else {
                    this.imgBuffer = buf
                    this.ffmpeg.stdin.write(buf)
                }
            }, 'image/jpeg', { quality: 1 })
        }
        else {
            if (this.imgBuffer != null) {
                this.ffmpeg.stdin.write(this.imgBuffer)
            }
        }
    }

    end = () => {
        console.log("Close stdin of ffmpeg")
        if (this.ffmpeg == undefined) return
        this.ffmpeg.stdin.end()
    }
}

module.exports = StreamHandler