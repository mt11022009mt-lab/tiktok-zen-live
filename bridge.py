import sys
import asyncio
import os
import requests
from TikTokLive import TikTokLiveClient
from TikTokLive.events import ConnectEvent, CommentEvent, LikeEvent, GiftEvent, JoinEvent

if len(sys.argv) < 2:
    print("Usage: python bridge.py <tiktok_username>")
    sys.exit(1)

USERNAME = sys.argv[1].replace('@', '').strip()
SERVER_URL = f"http://localhost:{os.environ.get('ZEN_LIVE_PORT', '3000')}/api/webhook"

print(f"[Python Bridge] Initializing TikTok connection for: {USERNAME}")
client = TikTokLiveClient(unique_id=USERNAME)

def send_to_server(endpoint, payload):
    try:
        requests.post(f"{SERVER_URL}/{endpoint}", json=payload, timeout=2)
    except Exception as e:
        print(f"[Bridge Error] Failed to post to {endpoint}: {e}")

@client.on(ConnectEvent)
async def on_connect(event):
    print(f"[Python Bridge] Connected successfully to room {client.room_id} for @{USERNAME}!")
    send_to_server("connect", {"username": USERNAME, "roomId": client.room_id})

@client.on(CommentEvent)
async def on_comment(event: CommentEvent):
    print(f"[Comment] {event.user.nickname}: {event.comment}")
    avatar = ""
    try:
        avatar = event.user.avatar.urls[-1]
    except Exception:
        pass
    send_to_server("chat", {
        "uniqueId": event.user.unique_id,
        "nickname": event.user.nickname,
        "comment": event.comment,
        "profilePictureUrl": avatar
    })

@client.on(LikeEvent)
async def on_like(event: LikeEvent):
    avatar = ""
    try:
        avatar = event.user.avatar.urls[-1]
    except Exception:
        pass
    send_to_server("like", {
        "uniqueId": event.user.unique_id,
        "nickname": event.user.nickname,
        "likeCount": event.count,
        "totalLikes": event.total,
        "profilePictureUrl": avatar
    })

@client.on(GiftEvent)
async def on_gift(event: GiftEvent):
    if event.gift.info.type == 1 and not event.gift.is_repeating:
        # Streak gift in progress
        pass
    print(f"[Gift] {event.user.nickname} sent {event.gift.count}x {event.gift.info.name} ({event.gift.info.diamond_count} diamonds)")
    avatar = ""
    try:
        avatar = event.user.avatar.urls[-1]
    except Exception:
        pass
    send_to_server("gift", {
        "uniqueId": event.user.unique_id,
        "nickname": event.user.nickname,
        "giftName": event.gift.info.name,
        "giftId": event.gift.info.id,
        "repeatCount": event.gift.count,
        "diamondCount": event.gift.info.diamond_count * event.gift.count,
        "profilePictureUrl": avatar
    })

@client.on(JoinEvent)
async def on_join(event: JoinEvent):
    avatar = ""
    try:
        avatar = event.user.avatar.urls[-1]
    except Exception:
        pass
    send_to_server("join", {
        "uniqueId": event.user.unique_id,
        "nickname": event.user.nickname,
        "profilePictureUrl": avatar
    })

async def main():
    try:
        await client.start()
    except Exception as e:
        print(f"[Python Bridge Error]: {e}")
        send_to_server("error", {"message": str(e)})

if __name__ == '__main__':
    asyncio.run(main())
