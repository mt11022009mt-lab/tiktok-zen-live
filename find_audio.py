import urllib.request
import re

url = "https://www.dieuphapam.net/"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
try:
    with urllib.request.urlopen(req) as resp:
        content = resp.read().decode('utf-8', errors='ignore')
        mp3s = re.findall(r'href=[\'"]([^\'"]+\.mp3)[\'"]', content)
        print("Found mp3s:", mp3s[:10])
except Exception as e:
    print("Error:", e)
