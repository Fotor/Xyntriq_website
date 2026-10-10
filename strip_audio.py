import subprocess, os

ffmpeg = os.environ.get("FFMPEG", "ffmpeg")
base = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets', 'video')

jobs = [
    ("pov-sample.mp4", "pov-sample-silent.mp4"),
    ("pov-sample-2.mp4", "pov-sample-2-silent.mp4"),
]
for src_name, dst_name in jobs:
    src = os.path.join(base, src_name)
    dst = os.path.join(base, dst_name)
    cmd = [ffmpeg, "-y", "-i", src, "-map", "0:v:0", "-c:v", "copy", "-an", dst]
    r = subprocess.run(cmd, capture_output=True, text=True)
    print(dst_name, "exit", r.returncode)
    if r.returncode != 0:
        print("ERR", r.stderr[-300:])

# cleanup stray temp files from the earlier attempt
for f in os.listdir(base):
    if f.endswith(".noaudio.mp4"):
        try:
            os.remove(os.path.join(base, f))
            print("removed temp", f)
        except Exception as e:
            print("could not remove", f, e)
